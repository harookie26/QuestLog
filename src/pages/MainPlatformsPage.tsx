import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

type PlatformDoc = { _id?: string; name: string; generation?: string }

export default function MainPlatformsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [active, setActive] = useState<string[]>([])
  const [generations, setGenerations] = useState<{ title: string; items: string[] }[]>([])
  const [generationOptions, setGenerationOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const q = (searchParams.get('q') || '').trim()
  const generationFilter = (searchParams.get('generation') || 'All').trim()

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === 'All') next.delete(key)
      else next.set(key, value)
    }
    setSearchParams(next)
  }

  useEffect(() => {
    let mounted = true
    const loadGenerationOptions = async () => {
      try {
        const res = await fetch('/api/platforms?sort=asc')
        if (!res.ok) throw new Error('Failed to load platform filters')
        const list: PlatformDoc[] = await res.json()
        const options = Array.from(new Set((Array.isArray(list) ? list : [])
          .map((p) => (p.generation || 'Uncategorized').trim())
          .filter(Boolean)))
          .sort((a, b) => a.localeCompare(b))
        if (mounted) setGenerationOptions(options)
      } catch (err) {
        if (mounted) setGenerationOptions([])
      }
    }

    loadGenerationOptions()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        if (generationFilter && generationFilter !== 'All') params.set('generation', generationFilter)
        params.set('sort', 'asc')

        const res = await fetch(`/api/platforms?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to fetch platforms')
        const list: PlatformDoc[] = await res.json()

        // group by generation (treat missing as 'Uncategorized')
        const groups = new Map<string, string[]>()
        for (const p of list) {
          const gen = p.generation || 'Uncategorized'
          if (!groups.has(gen)) groups.set(gen, [])
          groups.get(gen)!.push(p.name)
        }

        // extract Active first
        const activeList = groups.get('Active') || []
        activeList.sort((a, b) => a.localeCompare(b))

        // build generations array excluding Active
        const gens: { title: string; items: string[] }[] = []
        for (const [title, items] of groups.entries()) {
          if (title === 'Active') continue
          const sorted = Array.from(new Set(items)).sort((a, b) => a.localeCompare(b))
          gens.push({ title, items: sorted })
        }

        // sort generations by title descending so newer ranges appear first
        gens.sort((a, b) => (b.title || '').localeCompare(a.title || ''))

        if (mounted) {
          setActive(activeList)
          setGenerations(gens)
        }
      } catch (err) {
        if (mounted) {
          setActive([])
          setGenerations([])
          setError('Failed to load platforms')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [q, generationFilter])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <input
          value={q}
          onChange={(e) => updateParams({ q: e.target.value.trim() || null })}
          placeholder="Search platforms"
          className="px-3 py-2 border rounded bg-white text-violet-800 text-sm md:col-span-2"
        />
        <select
          value={generationFilter || 'All'}
          onChange={(e) => updateParams({ generation: e.target.value })}
          className="px-3 py-2 border rounded bg-white text-violet-800 text-sm"
        >
          <option value="All">All Generations</option>
          {generationOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <h2 className="text-2xl font-bold text-violet-900 mb-4">Active Platforms</h2>
      <div className="bg-violet-100/60 border border-violet-300 p-4 rounded mb-6">
        {loading ? (
          <div className="text-sm text-violet-800">Loading…</div>
        ) : error ? (
          <div className="text-sm text-red-700">{error}</div>
        ) : (
          <ul className="flex flex-wrap gap-3 text-sm text-violet-800">
            {active.length === 0 ? <li className="text-sm text-gray-600">No active platforms</li> : active.map((a) => (
              <li key={a} className="w-auto list-none">
                <a href="#" className="px-2 py-1 hover:underline">{a}</a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {generations.map((g) => (
        <section key={g.title} className="mb-6">
          <h3 className="text-lg font-extrabold text-violet-900 mb-2">{g.title}</h3>
          <div className="border-t border-violet-300" />
          <div className="bg-violet-100/60 border border-violet-300 p-4 mt-3 rounded">
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm text-violet-800">
              {g.items.map((it) => (
                <li key={it}>
                  <a href="#" className="hover:underline">{it}</a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
    </div>
  )
}
