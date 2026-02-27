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
    // Fetch the 2 most recent threads the user opened; if none,
    // fall back to fetching the latest threads. Always limit to 2.
    const fetchRecent = async () => {
      try {
        const res = await fetch('/api/threads?recent=true')
        if (!res.ok) throw new Error(res.statusText)
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setRecentThreads(data.slice(0, 2))
          return
        }

        // fallback to latest
        const r2 = await fetch('/api/threads')
        if (!r2.ok) throw new Error(r2.statusText)
        const latest = await r2.json()
        if (Array.isArray(latest)) setRecentThreads(latest.slice(0, 2))
        else setRecentThreads([])
      } catch (err) {
        // final fallback
        try {
          const r = await fetch('/api/threads')
          if (!r.ok) throw new Error(r.statusText)
          const latest = await r.json()
          if (Array.isArray(latest)) setRecentThreads(latest.slice(0, 2))
          else setRecentThreads([])
        } catch {
          setRecentThreads([])
        }
      }
    }

    // Only refetch when the location changes to the home path so that
    // returning to the home page updates recent interactions.
    if (location.pathname === '/') {
      fetchRecent()
    }
  }, [location.pathname])
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
              <CardItem title="Where are the Tri beam modifications?" subtitle="Fallout: New Vegas (X360)" type="topic" />
              <CardItem title="Why are my mods gone?" subtitle="Fallout 4 (PS4)" type="topic" />
              <CardItem title="Are there any negative effects?" subtitle="The Elder Scrolls V: Skyrim (X360)" type="topic" />
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
          {[1,2,3,4,5].map((n)=> (
            <div key={n} className="flex items-center gap-4">
              <div className="w-8 text-center font-bold text-violet-800">{n}</div>
              <div className="flex-1">
                <CardItem title={`The Elder Scrolls V: Skyrim`} subtitle={`X360 PC PS3 XONE PS4 NS PS5 XBSX NS2`} img={`https://via.placeholder.com/48?text=${n}`} type="game" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-sm"><a href="#" className="text-violet-800 hover:underline">More Games &gt;&gt;</a></div>
      </section>
    </div>
    {showNew && <NewThread onClose={() => setShowNew(false)} />}
    </>
  )
}
