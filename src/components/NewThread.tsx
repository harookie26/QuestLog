import React, { useState } from 'react'

export default function NewThread({ onClose, onCreate }: { onClose: () => void, onCreate?: (t: any) => void }){
	const [platform, setPlatform] = useState('')
	const [game, setGame] = useState('')
	const [title, setTitle] = useState('')
	const [message, setMessage] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const validateTitle = (t: string) => {
		if (t.length < 5 || t.length > 80) return 'Must be between 5 and 80 characters.'
		// allow letters, numbers, spaces and a small set of punctuation
		const ok = /^[A-Za-z0-9\s\-\_'\.,\?\!:\(\)]+$/.test(t)
		if (!ok) return 'Cannot contain special characters or emoji.'
		if (t === t.toUpperCase()) return 'Title cannot be in ALL CAPS.'
		return null
	}

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault()
		const v = validateTitle(title)
		if (v) { setError(v); return }
		setLoading(true)
		setError(null)
		try {
			const payload = { title: title.trim(), game, platform, body: message }
			const res = await fetch('/api/threads', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			})
			if (!res.ok) {
				const text = await res.text()
				throw new Error(text || `Server returned ${res.status}`)
			}
			const created = await res.json()
			// let parent know (optional) and close
			onCreate?.(created)
			onClose()
		} catch (err: any) {
			setError(err?.message || 'Failed to create thread')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center p-6">
			<div className="absolute inset-0 bg-black/40" onClick={onClose} />

			<div className="relative w-full max-w-4xl bg-white rounded-md border-4 border-violet-900 shadow-lg p-6" style={{maxHeight: '90vh', overflow: 'auto'}}>
				<button onClick={onClose} className="absolute right-4 top-4 w-10 h-10 rounded-sm bg-white border border-violet-900 text-violet-900 font-bold">X</button>

				<h2 className="text-3xl font-extrabold text-violet-900 mb-4">Create New Thread</h2>

					<form onSubmit={handleSubmit}>
						<div className="mb-4">
							<label className="block text-lg text-violet-900 font-semibold mb-2">Create a topic title</label>
							<input value={title} onChange={e => { setTitle(e.target.value); setError(null) }} className="w-full border px-2 py-1" />
							<div className="text-xs text-violet-700 mt-1">Must be between 5 and 80 characters, cannot contain special characters or emoji or be in ALL CAPS.</div>
							{error ? <div className="text-sm text-red-600 mt-1">{error}</div> : null}
						</div>

						<div className="mb-4">
							<label className="block text-lg text-violet-900 font-semibold mb-2">Select a game</label>
							<select value={game} onChange={e => setGame(e.target.value)} className="px-3 py-1 border rounded bg-white text-violet-800 text-sm w-64">
								<option value="">Choose a Game</option>
								<option>Halo Infinite</option>
								<option>Apex Legends</option>
								<option>Fortnite</option>
								<option>Elden Ring</option>
							</select>
						</div>

						<div className="mb-4">
							<label className="block text-lg text-violet-900 font-semibold mb-2">Select a platform</label>
							<select value={platform} onChange={e => setPlatform(e.target.value)} className="px-3 py-1 border rounded bg-white text-violet-800 text-sm w-48">
								<option value="">Choose a Platform</option>
								<option>PS4</option>
								<option>PC</option>
								<option>XONE</option>
								<option>Switch</option>
							</select>
						</div>

						<div className="mb-4">
							<label className="block text-lg text-violet-900 font-semibold mb-2">Write your message</label>
							<div className="border rounded">
								<div className="bg-gray-100 p-2 text-sm text-violet-800 border-b"> <button type="button" className="px-2 font-bold">B</button> <button type="button" className="px-2">U</button> <button type="button" className="px-2">•</button> </div>
								<textarea value={message} onChange={e => setMessage(e.target.value)} rows={10} className="w-full p-3" />
							</div>
						</div>

					<div className="flex items-center gap-3">
						<button type="submit" disabled={loading} className="bg-violet-700 text-white px-4 py-2 rounded disabled:opacity-50">
							{loading ? 'Creating…' : 'Create Thread'}
						</button>
						<button type="button" onClick={onClose} className="text-violet-900 px-3 py-2">Cancel</button>
					</div>
				</form>
			</div>
		</div>
	)
}
