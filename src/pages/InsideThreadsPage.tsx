import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'

type Thread = { _id?: string; title?: string; game?: string; platform?: string; author?: string; body?: string }
type Message = { _id?: string; thread?: string; author?: string; body?: string; createdAt?: string }

export default function InsideThreadsPage(){
  const { id } = useParams<{ id?: string }>()
  const [thread, setThread] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [reply, setReply] = useState('')
  const replyRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (!id) return
    let mounted = true
    // fetch thread
    fetch(`/api/threads/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then((data) => { if (mounted) setThread(data || null) })
      .catch(() => { if (mounted) setThread(null) })

    // fetch messages for thread
    fetch(`/api/threads/${id}/messages`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then((data) => { if (mounted) setMessages(data || []) })
      .catch(() => { if (mounted) setMessages([]) })

    return () => { mounted = false }
  }, [id])

  const postReply = async () => {
    if (!id) return
    if (!reply.trim()) return
    try {
      const res = await fetch(`/api/threads/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: reply, author: 'Anonymous' })
      })
      if (!res.ok) throw new Error(res.statusText)
      const created: Message = await res.json()
      setMessages(prev => [created, ...prev])
      setReply('')
    } catch (err) {
      console.error('Failed to post reply', err)
      // optionally show UI feedback
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-4">
        <div className="flex items-start gap-4">
          <img src="https://via.placeholder.com/80" alt="thumb" className="w-20 h-20 object-cover rounded-sm" />
          <div>
            <h1 className="text-3xl font-extrabold text-violet-900">{thread?.title ?? 'Did you pull for Zibai?'}</h1>
            <div className="text-sm text-violet-700">{thread?.game ?? 'Genshin Impact'} <span className="text-violet-500">{thread?.platform ?? 'PlayStation 4'}</span></div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button className="px-3 py-1 bg-violet-600 text-white text-sm rounded">Track Thread</button>
          <button className="px-3 py-1 bg-violet-600 text-white text-sm rounded">Favorite</button>
          <button className="px-3 py-1 bg-violet-600 text-white text-sm rounded">Notify Me</button>
          <button
            className="px-3 py-1 bg-violet-600 text-white text-sm rounded"
            onClick={() => {
              // focus and scroll to reply box
              replyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              replyRef.current?.focus()
            }}
          >
            Post New Message
          </button>
        </div>
      </header>

      <section className="space-y-2">
        {thread && (
          <article className={`p-4 rounded border border-violet-200 bg-violet-50`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="text-sm text-violet-700 font-medium">{thread.author ?? 'OP'}</div>
                <div className="text-xs text-violet-500">posted</div>
              </div>
              <div className="text-xs text-violet-600">quote</div>
            </div>
            <div className="mt-3 text-violet-800">{thread.body ?? ''}</div>
          </article>
        )}

        {/* messages */}
        {messages.map((m) => (
          <article key={m._id} className="p-4 rounded border border-violet-100 bg-white">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="text-sm text-violet-700 font-medium">{m.author ?? 'Anonymous'}</div>
                <div className="text-xs text-violet-500">replied</div>
              </div>
              <div className="text-xs text-violet-500">{m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}</div>
            </div>
            <div className="mt-3 text-violet-800">{m.body}</div>
          </article>
        ))}

      </section>

      <section className="mt-6">
        <div className="border border-violet-300 rounded bg-white">
          <div className="p-2 border-b border-violet-200 text-sm text-violet-600">B I U • • •</div>
          <textarea ref={replyRef} value={reply} onChange={(e) => setReply(e.target.value)} className="w-full h-36 p-3 text-sm" placeholder="Write your reply..." />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm text-violet-600">Page <select className="ml-1 border rounded px-1 py-0.5"><option>1</option></select> of 12</div>
          <button onClick={postReply} className="px-4 py-2 bg-violet-700 text-white rounded">Post New Message</button>
        </div>
      </section>
    </div>
  )
}
