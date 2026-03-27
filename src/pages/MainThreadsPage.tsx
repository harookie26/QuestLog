import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import NewThread from '../components/NewThread'

type Thread = {
  _id: string
  title?: string
  body?: string
  game?: string
  platform?: string
  category?: string
  tags?: string[]
  author?: string
  createdAt?: string
}

type GameDoc = { _id: string; name: string }

const CATEGORY_OPTIONS = ['All', 'Recommendation', 'Question', 'Bug Report'] as const
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'relevance', label: 'Relevance' }
] as const
const LIMIT_OPTIONS = [10, 20, 50] as const

const ThreadRow = ({t, i}:{t:Thread; i:number}) => (
  <div className={`grid grid-cols-12 items-start gap-4 px-4 py-3 border-b border-violet-200 ${i % 2 === 0 ? 'bg-violet-50' : 'bg-violet-100/60'}`}>
    <div className="col-span-8">
      <div className="font-medium text-violet-900">{t.title || 'Untitled thread'}</div>
      {t.body ? <div className="text-xs text-violet-700 mt-1 line-clamp-2">{t.body}</div> : null}
      <div className="text-xs text-violet-700 mt-2 flex flex-wrap gap-2">
        {t.game ? <span className="px-2 py-0.5 rounded bg-violet-200">{t.game}</span> : null}
        {t.category ? <span className="px-2 py-0.5 rounded bg-violet-300/70">{t.category}</span> : null}
      </div>
    </div>
    <div className="col-span-2 text-sm text-violet-700">{t.author || 'Unknown'}</div>
    <div className="col-span-2 text-sm text-violet-700">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}</div>
  </div>
)

export default function MainThreadsPage(){
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showNew, setShowNew] = useState(false)
  const [threads, setThreads] = useState<Thread[]>([])
  const [games, setGames] = useState<GameDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const q = (searchParams.get('q') || '').trim()
  const category = (searchParams.get('category') || 'All').trim()
  const game = (searchParams.get('game') || '').trim()
  const sort = (searchParams.get('sort') || 'newest').trim().toLowerCase()
  const page = Math.max(Number.parseInt(searchParams.get('page') || '1', 10) || 1, 1)
  const limit = (() => {
    const parsed = Number.parseInt(searchParams.get('limit') || '10', 10)
    if (!Number.isFinite(parsed)) return 10
    return LIMIT_OPTIONS.includes(parsed as 10 | 20 | 50) ? parsed : 10
  })()

  const selectedSort = SORT_OPTIONS.some((item) => item.value === sort) ? sort : 'newest'
  const selectedCategory = CATEGORY_OPTIONS.includes(category as typeof CATEGORY_OPTIONS[number]) ? category : 'All'
  const canGoPrev = page > 1
  const canGoNext = threads.length === limit

  const updateParams = (updates: Record<string, string | null>, resetPage = false) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (!value) next.delete(key)
      else next.set(key, value)
    }
    if (resetPage) next.set('page', '1')
    setSearchParams(next)
  }

  useEffect(() => {
    let mounted = true
    const loadGames = async () => {
      try {
        const res = await fetch('/api/games?sort=asc')
        if (!res.ok) throw new Error('Failed to load game options')
        const list: GameDoc[] = await res.json()
        if (mounted) setGames(Array.isArray(list) ? list : [])
      } catch (err) {
        if (mounted) setGames([])
      }
    }
    loadGames()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    const loadThreads = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        if (selectedCategory !== 'All') params.set('category', selectedCategory)
        if (game) params.set('game', game)
        params.set('sort', selectedSort)
        params.set('page', String(page))
        params.set('limit', String(limit))

        const res = await fetch(`/api/threads?${params.toString()}`)
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Failed to fetch threads')
        }
        const list: Thread[] = await res.json()
        if (mounted) setThreads(Array.isArray(list) ? list : [])
      } catch (err: any) {
        if (mounted) {
          setThreads([])
          setError(err?.message || 'Failed to fetch threads')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadThreads()
    return () => { mounted = false }
  }, [q, selectedCategory, game, selectedSort, page, limit])

  const gameOptions = useMemo(() => games.map((g) => g.name), [games])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-start gap-6 mb-6">
        <img src="https://via.placeholder.com/96" alt="Main board" className="w-24 h-24 object-cover rounded-sm shadow-sm" />
        <div>
          <h1 className="text-2xl font-bold text-violet-900">Monster Hunter: World - Message Board</h1>
          <p className="text-sm text-violet-700 mt-1">Discussion boards for questions, predictions, guides, and tips in video games.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        <input
          value={q}
          onChange={(e) => updateParams({ q: e.target.value.trim() || null }, true)}
          placeholder="Search threads"
          className="px-3 py-2 border rounded bg-white text-violet-800 text-sm md:col-span-2"
        />
        <select
          value={selectedCategory}
          onChange={(e) => updateParams({ category: e.target.value === 'All' ? null : e.target.value }, true)}
          className="px-3 py-2 border rounded bg-white text-violet-800 text-sm"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div>
          <input
            list="thread-game-options"
            value={game}
            onChange={(e) => updateParams({ game: e.target.value.trim() || null }, true)}
            placeholder="Filter by game"
            className="w-full px-3 py-2 border rounded bg-white text-violet-800 text-sm"
          />
          <datalist id="thread-game-options">
            {gameOptions.map((name) => <option key={name} value={name} />)}
          </datalist>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedSort}
            onChange={(e) => updateParams({ sort: e.target.value }, true)}
            className="px-3 py-2 border rounded bg-white text-violet-800 text-sm flex-1"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            value={String(limit)}
            onChange={(e) => updateParams({ limit: e.target.value }, true)}
            className="px-3 py-2 border rounded bg-white text-violet-800 text-sm"
          >
            {LIMIT_OPTIONS.map((size) => (
              <option key={size} value={size}>{size}/pg</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setShowNew(true)} className="ml-auto px-3 py-1 bg-violet-700 text-white text-sm rounded">+ New Thread</button>
      </div>

      <div className="bg-white border border-violet-700 rounded-md overflow-hidden">
        <div className="bg-violet-900 text-white grid grid-cols-12 px-4 py-3 font-semibold">
          <div className="col-span-8">Threads</div>
          <div className="col-span-2">Author</div>
          <div className="col-span-2">Created</div>
        </div>

        <div>
          {loading ? <div className="p-4 text-sm text-violet-800">Loading threads…</div> : null}
          {!loading && error ? <div className="p-4 text-sm text-red-700">{error}</div> : null}
          {!loading && !error && threads.length === 0 ? <div className="p-4 text-sm text-violet-800">No threads matched your filters.</div> : null}
          {!loading && !error && threads.map((th, idx) => (
            <button
              key={th._id}
              type="button"
              className="w-full text-left"
              onClick={() => navigate(`/threads/inside/${th._id}`)}
            >
              <ThreadRow t={th} i={idx} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          type="button"
          disabled={!canGoPrev}
          onClick={() => updateParams({ page: String(page - 1) })}
          className="px-3 py-1 border rounded text-sm text-violet-800 disabled:opacity-50"
        >
          Previous
        </button>
        <div className="text-sm text-violet-800">Page {page}</div>
        <button
          type="button"
          disabled={!canGoNext}
          onClick={() => updateParams({ page: String(page + 1) })}
          className="px-3 py-1 border rounded text-sm text-violet-800 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="mt-4 text-sm text-violet-700">
        <Link to="/threads">Reset all filters</Link>
      </div>
      {showNew && <NewThread onClose={() => setShowNew(false)} />}
    </div>
  )
}
