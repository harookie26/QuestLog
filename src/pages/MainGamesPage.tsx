import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

type GameDoc = { _id?: string; name: string }

export default function MainGamesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [games, setGames] = useState<GameDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const q = (searchParams.get('q') || '').trim()
  const sortParam = (searchParams.get('sort') || 'asc').trim().toLowerCase()
  const sort = sortParam === 'desc' ? 'desc' : 'asc'

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (!value) next.delete(key)
      else next.set(key, value)
    }
    setSearchParams(next)
  }

  useEffect(() => {
    let mounted = true
    const loadGames = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        params.set('sort', sort)
        const res = await fetch(`/api/games?${params.toString()}`)
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Failed to fetch games')
        }
        const list: GameDoc[] = await res.json()
        if (mounted) setGames(Array.isArray(list) ? list : [])
      } catch (err: any) {
        if (mounted) {
          setGames([])
          setError(err?.message || 'Failed to fetch games')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadGames()
    return () => { mounted = false }
  }, [q, sort])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="mb-6">
        <h2 className="text-2xl font-bold text-violet-900 mb-3">Games</h2>
        <div className="border-t border-violet-300 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={q}
            onChange={(e) => updateParams({ q: e.target.value.trim() || null })}
            placeholder="Search games"
            className="px-3 py-2 border rounded bg-white text-violet-800 text-sm md:col-span-3"
          />
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="px-3 py-2 border rounded bg-white text-violet-800 text-sm"
          >
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </select>
        </div>
      </section>

      <section className="bg-white border border-violet-300 rounded">
        {loading ? <div className="p-4 text-sm text-violet-800">Loading games…</div> : null}
        {!loading && error ? <div className="p-4 text-sm text-red-700">{error}</div> : null}
        {!loading && !error && games.length === 0 ? <div className="p-4 text-sm text-violet-800">No games matched your search.</div> : null}
        {!loading && !error && games.length > 0 ? (
          <ul>
            {games.map((game, idx) => (
              <li key={game._id || `${game.name}-${idx}`} className="p-3 border-b border-violet-100 last:border-b-0 flex items-center justify-between">
                <div className="font-semibold text-violet-900">{game.name}</div>
                <Link to={`/threads?game=${encodeURIComponent(game.name)}`} className="text-sm text-violet-700 hover:underline">
                  Browse threads
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  )
}
