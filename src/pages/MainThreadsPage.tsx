import React, { useState } from 'react'
import NewThread from '../components/NewThread'

type Thread = {
  title: string
  excerpt?: string
  answers: number
  asked: string
  answered: string
}

const ThreadRow = ({t, i}:{t:Thread; i:number}) => (
  <div className={`grid grid-cols-12 items-start gap-4 px-4 py-3 border-b border-violet-200 ${i % 2 === 0 ? 'bg-violet-50' : 'bg-violet-100/60'}`}>
    <div className="col-span-7">
      <div className="font-medium text-violet-900">{t.title}</div>
      {t.excerpt ? <div className="text-xs text-violet-700 mt-1">{t.excerpt}</div> : null}
    </div>
    <div className="col-span-1 text-center text-violet-900 font-semibold">{t.answers}</div>
    <div className="col-span-2 text-sm text-violet-700">{t.asked}</div>
    <div className="col-span-2 text-sm text-violet-700">{t.answered}</div>
  </div>
)

export default function MainThreadsPage(){
  const [showNew, setShowNew] = useState(false)

  const threads: Thread[] = [
    { title: 'How am I supposed to play this Game? (PS4)', excerpt: 'Gameplay, controls and tips', answers: 4, asked: '1 month ago', answered: '2 weeks ago' },
    { title: 'Great jagras from the greatest jagras quest is not doing his vomit attack, what i do? (PC)', answers: 1, asked: '10 months ago', answered: '2 months ago' },
    { title: 'Large crown of Goldspring Macaque from Event-Quest possible? (XONE)', answers: 0, asked: '1 year ago', answered: '—' },
    { title: 'Where are the Tri beam modifications?', excerpt: 'Mod locations and installation', answers: 1, asked: '10 months ago', answered: '2 months ago' },
    { title: 'Why are my mods gone? (PS4)', answers: 1, asked: '10 months ago', answered: '5 months ago' }
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-start gap-6 mb-6">
        <img src="/js/placeholder-thumb.jpg" alt="thumb" className="w-24 h-24 object-cover rounded-sm shadow-sm" />
        <div>
          <h1 className="text-2xl font-bold text-violet-900">Monster Hunter: World - Message Board</h1>
          <p className="text-sm text-violet-700 mt-1">Discussion boards for questions, predictions, guides, and tips in video games.</p>
        </div>
      </div>

        <div className="flex items-center gap-3 mb-4">
        <select className="px-3 py-1 border rounded bg-white text-violet-800 text-sm">
          <option>All Questions</option>
        </select>
        <select className="px-3 py-1 border rounded bg-white text-violet-800 text-sm">
          <option>All Platforms</option>
        </select>
        <button onClick={() => setShowNew(true)} className="ml-auto px-3 py-1 bg-violet-700 text-white text-sm rounded">+ New Thread</button>
      </div>

      <div className="bg-white border border-violet-700 rounded-md overflow-hidden">
        <div className="bg-violet-900 text-white grid grid-cols-12 px-4 py-3 font-semibold">
          <div className="col-span-7">Threads</div>
          <div className="col-span-1 text-center">Ans.</div>
          <div className="col-span-2">Asked</div>
          <div className="col-span-2">Answered</div>
        </div>

        <div>
          {threads.map((th, idx) => (
            <ThreadRow key={idx} t={th} i={idx} />
          ))}
        </div>
      </div>
      {showNew && <NewThread onClose={() => setShowNew(false)} />}
    </div>
  )
}
