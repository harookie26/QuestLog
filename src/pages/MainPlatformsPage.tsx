import React, { useEffect, useState } from 'react'

type PlatformDoc = { _id?: string; name: string; generation?: string }

export default function MainPlatformsPage() {
  const [active, setActive] = useState<string[]>([])
  const [generations, setGenerations] = useState<{ title: string; items: string[] }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/platforms')
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
        console.error('Failed to load platforms', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-violet-900 mb-4">Active Platforms</h2>
      <div className="bg-violet-100/60 border border-violet-300 p-4 rounded mb-6">
        {loading ? (
          <div className="text-sm text-violet-800">Loading…</div>
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
