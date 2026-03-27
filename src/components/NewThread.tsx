import React, { useState, useEffect, useRef } from 'react'

const CATEGORY_OPTIONS = ['Recommendation', 'Question', 'Bug Report'] as const

export default function NewThread({ onClose, onCreate }: { onClose: () => void, onCreate?: (t: any) => void }){
	const [platform, setPlatform] = useState('')
	const [platforms, setPlatforms] = useState<string[]>([])
	const [platformQuery, setPlatformQuery] = useState('')
	const [platformsLoading, setPlatformsLoading] = useState(false)
	const [showPlatforms, setShowPlatforms] = useState(false)
	const [game, setGame] = useState('')
	const [games, setGames] = useState<string[]>([])
	const [gameQuery, setGameQuery] = useState('')
	const [gamesLoading, setGamesLoading] = useState(false)
	const [addingGame, setAddingGame] = useState(false)
	const [showGames, setShowGames] = useState(false)
	const [category, setCategory] = useState<typeof CATEGORY_OPTIONS[number]>('Question')
	const [tags, setTags] = useState<string[]>([])
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [tagQuery, setTagQuery] = useState('')
	const [tagsLoading, setTagsLoading] = useState(false)
	const [addingTag, setAddingTag] = useState(false)
	const [showTags, setShowTags] = useState(false)
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
		if (!CATEGORY_OPTIONS.includes(category)) {
			setError('Please select a valid category.')
			return
		}
		setLoading(true)
		setError(null)
		try {
			const payload = {
				title: title.trim(),
				game,
				platform,
				category,
				tags: selectedTags,
				body: message
			}
			const res = await fetch('/api/threads', {
				method: 'POST',
				credentials: 'include',
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

	useEffect(() => {
		let mounted = true
		const load = async () => {
			setGamesLoading(true)
			try {
				const res = await fetch('/api/games')
				if (res.ok) {
					const list = await res.json()
					if (mounted) setGames(list.map((g: any) => g.name))
				}
			} catch (err) {
				console.error('Failed to load games', err)
			} finally {
				if (mounted) setGamesLoading(false)
			}
		}
		load()
		return () => { mounted = false }
	}, [])

	useEffect(() => {
		let mounted = true
		const load = async () => {
			setTagsLoading(true)
			try {
				const res = await fetch('/api/tags')
				if (res.ok) {
					const list = await res.json()
					if (mounted) setTags(list.map((t: { name: string }) => t.name))
				}
			} catch (err) {
				console.error('Failed to load tags', err)
			} finally {
				if (mounted) setTagsLoading(false)
			}
		}
		load()
		return () => { mounted = false }
	}, [])

	useEffect(() => {
		let mounted = true
		const load = async () => {
			setPlatformsLoading(true)
			try {
				const res = await fetch('/api/platforms')
				if (res.ok) {
					const list = await res.json()
					if (mounted) setPlatforms(list.map((p: any) => p.name))
				}
			} catch (err) {
				console.error('Failed to load platforms', err)
			} finally {
				if (mounted) setPlatformsLoading(false)
			}
		}
		load()
		return () => { mounted = false }
	}, [])

	const wrapperRef = useRef<HTMLDivElement | null>(null)
	useEffect(() => {
		function onDoc(e: MouseEvent) {
			if (!wrapperRef.current) return
			if (!wrapperRef.current.contains(e.target as Node)) setShowGames(false)
		}
		document.addEventListener('click', onDoc)
		return () => document.removeEventListener('click', onDoc)
	}, [])

	const platformRef = useRef<HTMLDivElement | null>(null)
	useEffect(() => {
		function onDoc(e: MouseEvent) {
			if (!platformRef.current) return
			if (!platformRef.current.contains(e.target as Node)) setShowPlatforms(false)
		}
		document.addEventListener('click', onDoc)
		return () => document.removeEventListener('click', onDoc)
	}, [])

	const tagsRef = useRef<HTMLDivElement | null>(null)
	useEffect(() => {
		function onDoc(e: MouseEvent) {
			if (!tagsRef.current) return
			if (!tagsRef.current.contains(e.target as Node)) setShowTags(false)
		}
		document.addEventListener('click', onDoc)
		return () => document.removeEventListener('click', onDoc)
	}, [])

	const filteredGames = gameQuery
		? games.filter(g => g.toLowerCase().includes(gameQuery.toLowerCase()))
		: games

	const filteredPlatforms = platformQuery
		? platforms.filter(p => p.toLowerCase().includes(platformQuery.toLowerCase()))
		: platforms

	const trimmedQuery = gameQuery.trim()
	const duplicateMatch = trimmedQuery
		? games.find(g => g.toLowerCase() === trimmedQuery.toLowerCase())
		: undefined
	const isDuplicate = !!duplicateMatch

	const filteredTags = tagQuery
		? tags.filter(t => t.toLowerCase().includes(tagQuery.toLowerCase()))
		: tags

	const trimmedTagQuery = tagQuery.trim()
	const duplicateTagMatch = trimmedTagQuery
		? tags.find(t => t.toLowerCase() === trimmedTagQuery.toLowerCase())
		: undefined
	const isTagDuplicate = !!duplicateTagMatch

	const handleSelectGame = (name: string) => {
		setGame(name)
		setGameQuery(name)
		setShowGames(false)
	}

	const handleSelectPlatform = (name: string) => {
		setPlatform(name)
		setPlatformQuery(name)
		setShowPlatforms(false)
	}

	const handleAddGame = async () => {
		const name = gameQuery.trim()
		if (!name) return
		setAddingGame(true)
		try {
			const res = await fetch('/api/games', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name })
			})
			if (!res.ok) throw new Error(await res.text())
			const created = await res.json()
			setGames(prev => {
				if (prev.some(p => p.toLowerCase() === created.name.toLowerCase())) return prev
				return [created.name, ...prev]
			})
			setGame(created.name)
			setGameQuery(created.name)
			setShowGames(false)
		} catch (err) {
			console.error('Add game failed', err)
			setError('Failed to add game')
		} finally {
			setAddingGame(false)
		}
	}

	const handleSelectTag = (name: string) => {
		setSelectedTags(prev => {
			if (prev.some(t => t.toLowerCase() === name.toLowerCase())) return prev
			return [...prev, name]
		})
		setTagQuery('')
		setShowTags(false)
	}

	const handleRemoveTag = (name: string) => {
		setSelectedTags(prev => prev.filter(t => t.toLowerCase() !== name.toLowerCase()))
	}

	const handleAddTag = async () => {
		const name = tagQuery.trim()
		if (!name) return
		setAddingTag(true)
		try {
			const res = await fetch('/api/tags', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name })
			})
			let payload: { name?: string } | null = null
			if (res.status === 201 || res.status === 409) {
				payload = await res.json()
			} else {
				throw new Error(await res.text())
			}

			const createdName = (payload?.name || name).trim()
			setTags(prev => {
				if (prev.some(t => t.toLowerCase() === createdName.toLowerCase())) return prev
				return [createdName, ...prev]
			})
			handleSelectTag(createdName)
		} catch (err) {
			console.error('Add tag failed', err)
			setError('Failed to add tag')
		} finally {
			setAddingTag(false)
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

						<div className="mb-4" ref={wrapperRef}>
							<label className="block text-lg text-violet-900 font-semibold mb-2">Select a game</label>
							<input
								value={gameQuery}
								onChange={e => { setGameQuery(e.target.value); setShowGames(true); setError(null) }}
								onFocus={() => setShowGames(true)}
								placeholder="Search or add a game"
								className="px-3 py-2 border rounded bg-white text-violet-800 text-sm w-64"
							/>
							<div className="relative">
								{showGames && (
									<div className="absolute z-40 mt-1 w-64 bg-white border rounded shadow max-h-56 overflow-auto">
										{gamesLoading ? <div className="p-2 text-sm text-gray-600">Loading…</div> : null}
										{!gamesLoading && filteredGames.length === 0 ? (
											<div className="p-2 text-sm text-gray-700">No matches</div>
										) : (
											filteredGames.map(g => (
												<button key={g} type="button" onClick={() => handleSelectGame(g)} className="w-full text-left px-3 py-2 hover:bg-violet-50">{g}</button>
											))
										)}
										<div className="border-t p-2 bg-gray-50 flex items-center justify-between">
											<div className="text-xs text-gray-700">Not listed?</div>
											{isDuplicate ? (
												<div className="flex items-center gap-2">
													<div className="text-xs text-green-700">Already listed</div>
													<button type="button" onClick={() => handleSelectGame(duplicateMatch!)} className="text-sm text-violet-900 px-2 py-1 rounded bg-white border">Select</button>
												</div>
											) : (
												<button type="button" onClick={handleAddGame} disabled={addingGame || !trimmedQuery} className="text-sm text-violet-900 px-2 py-1 rounded bg-white border">
													{addingGame ? 'Adding…' : `Add game "${gameQuery}"`}
												</button>
											)}
										</div>
									</div>
								)}
							</div>
							{game ? <div className="text-xs text-violet-700 mt-1">Selected: {game}</div> : null}
						</div>

						<div className="mb-4">
							<label className="block text-lg text-violet-900 font-semibold mb-2">Category</label>
							<select
								value={category}
								onChange={e => { setCategory(e.target.value as typeof CATEGORY_OPTIONS[number]); setError(null) }}
								className="px-3 py-2 border rounded bg-white text-violet-800 text-sm w-64"
							>
								{CATEGORY_OPTIONS.map(option => (
									<option key={option} value={option}>{option}</option>
								))}
							</select>
						</div>

						<div className="mb-4" ref={tagsRef}>
							<label className="block text-lg text-violet-900 font-semibold mb-2">Tags</label>
							<input
								value={tagQuery}
								onChange={e => { setTagQuery(e.target.value); setShowTags(true); setError(null) }}
								onFocus={() => setShowTags(true)}
								placeholder="Search or add a tag"
								className="px-3 py-2 border rounded bg-white text-violet-800 text-sm w-64"
							/>
							<div className="relative">
								{showTags && (
									<div className="absolute z-40 mt-1 w-64 bg-white border rounded shadow max-h-56 overflow-auto">
										{tagsLoading ? <div className="p-2 text-sm text-gray-600">Loading...</div> : null}
										{!tagsLoading && filteredTags.length === 0 ? (
											<div className="p-2 text-sm text-gray-700">No matches</div>
										) : (
											filteredTags.map(t => (
												<button key={t} type="button" onClick={() => handleSelectTag(t)} className="w-full text-left px-3 py-2 hover:bg-violet-50">{t}</button>
											))
										)}
										<div className="border-t p-2 bg-gray-50 flex items-center justify-between">
											<div className="text-xs text-gray-700">Not listed?</div>
											{isTagDuplicate ? (
												<div className="flex items-center gap-2">
													<div className="text-xs text-green-700">Already listed</div>
													<button type="button" onClick={() => handleSelectTag(duplicateTagMatch!)} className="text-sm text-violet-900 px-2 py-1 rounded bg-white border">Select</button>
												</div>
											) : (
												<button type="button" onClick={handleAddTag} disabled={addingTag || !trimmedTagQuery} className="text-sm text-violet-900 px-2 py-1 rounded bg-white border">
													{addingTag ? 'Adding...' : `Add tag "${tagQuery}"`}
												</button>
											)}
										</div>
									</div>
								)}
							</div>
							{selectedTags.length > 0 ? (
								<div className="mt-2 flex flex-wrap gap-2">
									{selectedTags.map(tag => (
										<span key={tag} className="inline-flex items-center gap-2 px-2 py-1 rounded bg-violet-100 text-violet-900 text-xs border border-violet-200">
											{tag}
											<button type="button" onClick={() => handleRemoveTag(tag)} className="text-violet-700">x</button>
										</span>
									))}
								</div>
							) : (
								<div className="text-xs text-violet-700 mt-1">No tags selected</div>
							)}
						</div>

						<div className="mb-4" ref={platformRef}>
							<label className="block text-lg text-violet-900 font-semibold mb-2">Select a platform</label>
							<input
								value={platformQuery}
								onChange={e => { setPlatformQuery(e.target.value); setShowPlatforms(true); setError(null) }}
								onFocus={() => setShowPlatforms(true)}
								placeholder="Search platform"
								className="px-3 py-2 border rounded bg-white text-violet-800 text-sm w-48"
							/>
							<div className="relative">
								{showPlatforms && (
									<div className="absolute z-40 mt-1 w-48 bg-white border rounded shadow max-h-56 overflow-auto">
										{platformsLoading ? <div className="p-2 text-sm text-gray-600">Loading…</div> : null}
										{!platformsLoading && filteredPlatforms.length === 0 ? (
											<div className="p-2 text-sm text-gray-700">No matches</div>
										) : (
											filteredPlatforms.map(p => (
												<button key={p} type="button" onClick={() => handleSelectPlatform(p)} className="w-full text-left px-3 py-2 hover:bg-violet-50">{p}</button>
											))
										)}
									</div>
								)}
							</div>
							{platform ? <div className="text-xs text-violet-700 mt-1">Selected: {platform}</div> : null}
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
