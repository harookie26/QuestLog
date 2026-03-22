import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getStoredUser } from '../js/auth'

type Thread = { _id?: string; title?: string; game?: string; platform?: string; author?: string; body?: string; createdAt?: string }
type Message = { _id?: string; thread?: string; author?: string; body?: string; createdAt?: string }

const normalizeUser = (value?: string) => String(value || '').trim().toLowerCase()

export default function InsideThreadsPage(){
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  type AuthUser = { username?: string }
  const storedUser = getStoredUser<AuthUser>()
  const author = storedUser?.username?.trim() || ''
  const currentUser = normalizeUser(author)
  const [thread, setThread] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [reply, setReply] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [threadError, setThreadError] = useState<string | null>(null)
  const [messageError, setMessageError] = useState<string | null>(null)
  const [isEditingThread, setIsEditingThread] = useState(false)
  const [threadTitleDraft, setThreadTitleDraft] = useState('')
  const [threadBodyDraft, setThreadBodyDraft] = useState('')
  const [isSavingThread, setIsSavingThread] = useState(false)
  const [isDeletingThread, setIsDeletingThread] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingMessageBody, setEditingMessageBody] = useState('')
  const [savingMessageId, setSavingMessageId] = useState<string | null>(null)
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null)
  const replyRef = useRef<HTMLTextAreaElement | null>(null)
  const postingRef = useRef(false)

  useEffect(() => {
    if (!id) return
    let mounted = true
    fetch(`/api/threads/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then((data) => { if (mounted) setThread(data || null) })
      .catch(() => { if (mounted) setThread(null) })

    fetch(`/api/threads/${id}/messages`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then((data) => { if (mounted) setMessages(data || []) })
      .catch(() => { if (mounted) setMessages([]) })

    return () => { mounted = false }
  }, [id])

  useEffect(() => {
    if (!id) return
    try {
      const raw = localStorage.getItem('recentThreadIds')
      const arr = Array.isArray(raw ? JSON.parse(raw) : null) ? JSON.parse(raw as string) : []
      const filtered = arr.filter((x: string) => x !== id)
      filtered.unshift(id)
      const truncated = filtered.slice(0, 20)
      localStorage.setItem('recentThreadIds', JSON.stringify(truncated))
    } catch (err) {

    }
  }, [id])

  const postReply = async () => {
    if (!id) return
    const messageBody = reply.trim()
    if (!messageBody) return
    if (postingRef.current) return

    postingRef.current = true
    setIsPosting(true)

    try {
      const res = await fetch(`/api/threads/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: messageBody, author: author || 'Anonymous' })
      })
      if (!res.ok) throw new Error(res.statusText)
      const created: Message = await res.json()
      setMessages(prev => [created, ...prev])
      setReply('')
    } catch (err) {
      console.error('Failed to post reply', err)
    } finally {
      postingRef.current = false
      setIsPosting(false)
    }
  }

  const isThreadOwner = !!thread && !!currentUser && normalizeUser(thread.author) === currentUser
  const isMessageOwner = (message: Message) => !!currentUser && normalizeUser(message.author) === currentUser

  const startThreadEdit = () => {
    setThreadError(null)
    setThreadTitleDraft(thread?.title || '')
    setThreadBodyDraft(thread?.body || '')
    setIsEditingThread(true)
  }

  const cancelThreadEdit = () => {
    setThreadError(null)
    setIsEditingThread(false)
  }

  const saveThreadEdit = async () => {
    if (!id || !thread) return
    const nextTitle = threadTitleDraft.trim()
    const nextBody = threadBodyDraft.trim()
    if (!nextTitle) {
      setThreadError('Thread title cannot be empty.')
      return
    }

    setIsSavingThread(true)
    setThreadError(null)
    try {
      const res = await fetch(`/api/threads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: nextTitle,
          body: nextBody,
          currentUser: author
        })
      })
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Failed to update thread')
      }
      const updated = await res.json()
      setThread(updated)
      setIsEditingThread(false)
    } catch (err: any) {
      setThreadError(err?.message || 'Failed to update thread')
    } finally {
      setIsSavingThread(false)
    }
  }

  const deleteThread = async () => {
    if (!id || !thread) return
    if (!window.confirm('Delete this thread and all replies? This action cannot be undone.')) return

    setIsDeletingThread(true)
    setThreadError(null)
    try {
      const res = await fetch(`/api/threads/${id}?currentUser=${encodeURIComponent(author)}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Failed to delete thread')
      }
      navigate('/')
    } catch (err: any) {
      setThreadError(err?.message || 'Failed to delete thread')
    } finally {
      setIsDeletingThread(false)
    }
  }

  const startMessageEdit = (message: Message) => {
    if (!message._id) return
    setMessageError(null)
    setEditingMessageId(message._id)
    setEditingMessageBody(message.body || '')
  }

  const cancelMessageEdit = () => {
    setMessageError(null)
    setEditingMessageId(null)
    setEditingMessageBody('')
  }

  const saveMessageEdit = async () => {
    if (!id || !editingMessageId) return
    const nextBody = editingMessageBody.trim()
    if (!nextBody) {
      setMessageError('Reply body cannot be empty.')
      return
    }

    setSavingMessageId(editingMessageId)
    setMessageError(null)
    try {
      const res = await fetch(`/api/threads/${id}/messages?messageId=${encodeURIComponent(editingMessageId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: nextBody,
          currentUser: author
        })
      })
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Failed to update reply')
      }

      const updated: Message = await res.json()
      setMessages((prev) => prev.map((m) => (m._id === updated._id ? updated : m)))
      setEditingMessageId(null)
      setEditingMessageBody('')
    } catch (err: any) {
      setMessageError(err?.message || 'Failed to update reply')
    } finally {
      setSavingMessageId(null)
    }
  }

  const deleteMessage = async (message: Message) => {
    if (!id || !message._id) return
    if (!window.confirm('Delete this reply?')) return

    setDeletingMessageId(message._id)
    setMessageError(null)
    try {
      const res = await fetch(`/api/threads/${id}/messages?messageId=${encodeURIComponent(message._id)}&currentUser=${encodeURIComponent(author)}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Failed to delete reply')
      }
      setMessages((prev) => prev.filter((m) => m._id !== message._id))
      if (editingMessageId === message._id) {
        setEditingMessageId(null)
        setEditingMessageBody('')
      }
    } catch (err: any) {
      setMessageError(err?.message || 'Failed to delete reply')
    } finally {
      setDeletingMessageId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-4">
        <div className="flex items-start gap-4">
          <img src="https://via.placeholder.com/80" alt="thumb" className="w-20 h-20 object-cover rounded-sm" />
          <div>
            <h1 className="text-3xl font-extrabold text-violet-900">{thread?.title }</h1>
            <div className="text-sm text-violet-700">{thread?.game} <span className="text-violet-500">{thread?.platform}</span></div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button className="px-3 py-1 bg-violet-600 text-white text-sm rounded">Track Thread</button>
          <button className="px-3 py-1 bg-violet-600 text-white text-sm rounded">Favorite</button>
          <button className="px-3 py-1 bg-violet-600 text-white text-sm rounded">Notify Me</button>
          <button
            className="px-3 py-1 bg-violet-600 text-white text-sm rounded"
            onClick={() => {
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
              <div className="flex items-center gap-2">
                {thread.createdAt ? <div className="text-xs text-violet-500">{new Date(thread.createdAt).toLocaleString()}</div> : null}
                {isThreadOwner && !isEditingThread ? (
                  <>
                    <button type="button" onClick={startThreadEdit} className="text-xs px-2 py-1 border border-violet-300 rounded text-violet-700">Edit</button>
                    <button type="button" onClick={deleteThread} disabled={isDeletingThread} className="text-xs px-2 py-1 border border-red-300 rounded text-red-700 disabled:opacity-60">{isDeletingThread ? 'Deleting...' : 'Delete'}</button>
                  </>
                ) : null}
              </div>
            </div>

            {isEditingThread ? (
              <div className="mt-3 space-y-2">
                <input
                  value={threadTitleDraft}
                  onChange={(e) => setThreadTitleDraft(e.target.value)}
                  className="w-full border border-violet-300 rounded px-2 py-1"
                  placeholder="Thread title"
                />
                <textarea
                  value={threadBodyDraft}
                  onChange={(e) => setThreadBodyDraft(e.target.value)}
                  className="w-full min-h-28 border border-violet-300 rounded px-2 py-2"
                  placeholder="Thread body"
                />
                <div className="flex items-center gap-2">
                  <button type="button" onClick={saveThreadEdit} disabled={isSavingThread} className="px-3 py-1 bg-violet-700 text-white text-sm rounded disabled:opacity-60">{isSavingThread ? 'Saving...' : 'Save'}</button>
                  <button type="button" onClick={cancelThreadEdit} className="px-3 py-1 border border-violet-300 text-violet-700 text-sm rounded">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="mt-3 text-violet-800">{thread.body ?? ''}</div>
            )}

            {threadError ? <div className="mt-2 text-sm text-red-700">{threadError}</div> : null}
          </article>
        )}

        {messageError ? <div className="text-sm text-red-700">{messageError}</div> : null}

        {/* messages */}
        {messages.map((m, idx) => {
          const isEditingThisMessage = editingMessageId === m._id
          const canEditMessage = isMessageOwner(m)
          const isSavingThisMessage = savingMessageId === m._id
          const isDeletingThisMessage = deletingMessageId === m._id

          return (
            <article key={m._id || `${m.author || 'anon'}-${idx}`} className="p-4 rounded border border-violet-100 bg-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-violet-700 font-medium">{m.author ?? 'Anonymous'}</div>
                  <div className="text-xs text-violet-500">replied</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-violet-500">{m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}</div>
                  {canEditMessage && !isEditingThisMessage ? (
                    <>
                      <button type="button" onClick={() => startMessageEdit(m)} className="text-xs px-2 py-1 border border-violet-300 rounded text-violet-700">Edit</button>
                      <button type="button" onClick={() => deleteMessage(m)} disabled={isDeletingThisMessage} className="text-xs px-2 py-1 border border-red-300 rounded text-red-700 disabled:opacity-60">{isDeletingThisMessage ? 'Deleting...' : 'Delete'}</button>
                    </>
                  ) : null}
                </div>
              </div>

              {isEditingThisMessage ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={editingMessageBody}
                    onChange={(e) => setEditingMessageBody(e.target.value)}
                    className="w-full min-h-24 border border-violet-300 rounded px-2 py-2"
                  />
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={saveMessageEdit} disabled={isSavingThisMessage} className="px-3 py-1 bg-violet-700 text-white text-sm rounded disabled:opacity-60">{isSavingThisMessage ? 'Saving...' : 'Save'}</button>
                    <button type="button" onClick={cancelMessageEdit} className="px-3 py-1 border border-violet-300 text-violet-700 text-sm rounded">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-violet-800">{m.body}</div>
              )}
            </article>
          )
        })}

      </section>

      <section className="mt-6">
        <div className="border border-violet-300 rounded bg-white">
          <div className="p-2 border-b border-violet-200 text-sm text-violet-600">B I U • • •</div>
          <textarea ref={replyRef} value={reply} onChange={(e) => setReply(e.target.value)} className="w-full h-36 p-3 text-sm" placeholder="Write your reply..." />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm text-violet-600">Page <select className="ml-1 border rounded px-1 py-0.5"><option>1</option></select> of 12</div>
          <button
            onClick={postReply}
            disabled={isPosting || !reply.trim()}
            className="px-4 py-2 bg-violet-700 text-white rounded disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPosting ? 'Posting...' : 'Post New Message'}
          </button>
        </div>
      </section>
    </div>
  )
}
