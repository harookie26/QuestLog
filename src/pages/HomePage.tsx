import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import NewThread from '../components/NewThread'

type CardType = 'game' | 'topic'

const CardItem = ({title, subtitle, img, type, to}:{title:string; subtitle:string; img?:string; type?:CardType; to?:string}) => {
  const content = (
    <div className="flex items-start gap-4 p-3 bg-violet-100/80 border-b border-violet-200">
      <img src={img || 'https://via.placeholder.com/48'} alt="thumb" className="w-12 h-12 object-cover rounded-sm" />
      <div>
        <div className="font-semibold text-violet-900">{title}</div>
        <div className="text-xs text-violet-700">{subtitle}</div>
      </div>
    </div>
  )

  if (type === 'game') {
    return (
      <Link to={to || '/threads'} className="block">
        {content}
      </Link>
    )
  }

  if (type === 'topic') {
    return (
      <Link to={to || '/threads/inside'} className="block">
        {content}
      </Link>
    )
  }

  return content
}

export default function HomePage(){
  type Thread = { _id?: string; title: string; game?: string; platform?: string }
  const [popularTopics, setPopularTopics] = useState<Thread[]>([])
  const [recentThreads, setRecentThreads] = useState<Thread[] | null>(null)
  const [showNew, setShowNew] = useState(false)

  useEffect(() => {
    // Fetch popular topics from backend. Adjust endpoint/query as needed.
    fetch('/api/threads?popular=true')
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data)) setPopularTopics(data)
        else setPopularTopics([])
      })
      .catch(() => setPopularTopics([]))
  }, [])

  const location = useLocation()

  useEffect(() => {
    // Use localStorage to determine which thread ids the user recently opened.
    // If present, fetch all threads and pick matching ones in order (limit 2).
    const fetchRecentFromLocal = async () => {
      try {
        const raw = localStorage.getItem('recentThreadIds')
        const ids: string[] = raw ? JSON.parse(raw) : []
        const res = await fetch('/api/threads')
        if (!res.ok) throw new Error(res.statusText)
        const all = await res.json()
        if (!Array.isArray(all)) {
          setRecentThreads([])
          return
        }

        if (Array.isArray(ids) && ids.length > 0) {
          // preserve order from ids, map to full thread objects when available
          const byId = new Map(all.map((t: any) => [String(t._id), t]))
          const matched = ids.map(id => byId.get(id)).filter(Boolean)
          if (matched.length > 0) {
            setRecentThreads(matched.slice(0, 2))
            return
          }
        }

        // fallback to latest
        setRecentThreads(all.slice(0, 2))
      } catch (err) {
        setRecentThreads([])
      }
    }

    if (location.pathname === '/') {
      fetchRecentFromLocal()
    }
  }, [location.pathname])

  const [topThreads, setTopThreads] = useState<Thread[] | null>(null)
  const [topGames, setTopGames] = useState<{ title: string; count: number }[] | null>(null)

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const res = await fetch('/api/threads')
        if (!res.ok) throw new Error(res.statusText)
        const all = await res.json()
        if (!Array.isArray(all)) {
          setTopThreads([])
          setTopGames([])
          return
        }

        try {
          const gameCounts = new Map<string, number>()
          all.forEach((t: any) => {
            const g = t.game
            if (g) gameCounts.set(String(g), (gameCounts.get(String(g)) || 0) + 1)
          })
          const topGamesArr = Array.from(gameCounts.entries())
            .map(([title, count]) => ({ title, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
          setTopGames(topGamesArr)
        } catch (e) {
          setTopGames([])
        }

        const withCount = all.map((t: any) => ({
          ...t,
          __msgCount: t.messageCount ?? (Array.isArray(t.messages) ? t.messages.length : 0),
        }))

        withCount.sort((a: any, b: any) => (b.__msgCount || 0) - (a.__msgCount || 0))

        const top = withCount.slice(0, 3).map((t: any) => ({ _id: t._id, title: t.title, game: t.game, platform: t.platform })) as Thread[]
        setTopThreads(top)
      } catch (err) {
        setTopThreads([])
      }
    }

    fetchTop()
  }, [])
  return (
    <>
    <div className="max-w-6xl mx-auto p-6">
      <section className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-violet-900">Your recent interactions</h2>
          <button onClick={() => setShowNew(true)} className="ml-4 px-3 py-1 bg-violet-700 text-white text-sm rounded">+ New Thread</button>
        </div>
        <div className="border-t border-violet-300">
          {recentThreads === null ? (
            [1, 2].map((n) => (
              <CardItem key={n} title={`Loading...`} subtitle={``} />
            ))
          ) : recentThreads.length === 0 ? (
            [1, 2].map((n) => (
              <CardItem key={n} title={`No threads`} subtitle={``} />
            ))
          ) : (
            recentThreads.map((t) => (
              <CardItem
                key={t._id || t.title}
                title={t.title}
                subtitle={t.game || t.platform || ''}
                type="topic"
                to={`/threads/inside/${t._id ?? ''}`}
              />
            ))
          )}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-violet-900 mb-2">Recent Threads</h2>
        <div className="border-t border-violet-300">
          {popularTopics.length === 0 ? (
            // placeholder while loading or if none
            [1,2,3].map((n) => (
              <CardItem key={n} title={`Loading...`} subtitle={``} />
            ))
          ) : (
            popularTopics.slice(0,5).map((t) => (
              <CardItem
                key={t._id || t.title}
                title={t.title}
                subtitle={t.game || t.platform || ''}
                type="topic"
                to={`/threads/inside/${t._id ?? ''}`}
              />
            ))
          )}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-violet-900 mb-2">Popular Threads</h2>
        <div className="flex gap-4">
          <div className="w-2/3">
            <div className="border-t border-violet-300">
              {topThreads === null ? (
                [1,2,3].map((n) => (
                  <CardItem key={n} title={`Loading...`} subtitle={``} />
                ))
              ) : topThreads.length === 0 ? (
                [1,2,3].map((n) => (
                  <CardItem key={n} title={`No threads`} subtitle={``} />
                ))
              ) : (
                topThreads.map((t) => (
                  <CardItem
                    key={t._id || t.title}
                    title={t.title}
                    subtitle={t.game || t.platform || ''}
                    type="topic"
                    to={`/threads/inside/${t._id ?? ''}`}
                  />
                ))
              )}
            </div>
          </div>
          <aside className="w-1/3">
            <div className="p-3 bg-white border border-violet-200 rounded">Sidebar / ads</div>
          </aside>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-violet-900 mb-2">Popular Games</h2>
        <div className="border-t border-violet-300">
          {topGames === null ? (
            [1,2,3,4,5].map((n) => (
              <div key={n} className="flex items-center gap-4">
                <div className="w-8 text-center font-bold text-violet-800">{n}</div>
                <div className="flex-1">
                  <CardItem title={`Loading...`} subtitle={``} img={`https://via.placeholder.com/48?text=${n}`} type="game" />
                </div>
              </div>
            ))
          ) : topGames.length === 0 ? (
            <div className="p-3 text-sm text-violet-700">No games found</div>
          ) : (
            topGames.map((g, idx) => (
              <div key={g.title} className="flex items-center gap-4">
                <div className="w-8 text-center font-bold text-violet-800">{idx + 1}</div>
                <div className="flex-1">
                  <CardItem
                    title={g.title}
                    subtitle={`${g.count} thread${g.count === 1 ? '' : 's'}`}
                    img={`https://via.placeholder.com/48?text=${idx + 1}`}
                    type="game"
                    to={`/threads?game=${encodeURIComponent(g.title)}`}
                  />
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-3 text-sm"><a href="#" className="text-violet-800 hover:underline">More Games &gt;&gt;</a></div>
      </section>
    </div>
    {showNew && <NewThread onClose={() => setShowNew(false)} />}
    </>
  )
}
