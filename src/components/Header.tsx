import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, Info, Gamepad, Server } from 'lucide-react'
import { getStoredUser, logoutFromServer } from '../js/auth'

const THREAD_CATEGORIES = ['All', 'Recommendation', 'Question', 'Bug Report'] as const

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [displayName, setDisplayName] = useState('GUEST')
  const [showUserMenu, setShowUserMenu] = useState(false)
  type ThreadResult = { _id: string; title: string; game?: string }
  type GameResult = { _id: string; name: string }
  const [searchResults, setSearchResults] = useState<{ threads: ThreadResult[]; games: GameResult[] }>({ threads: [], games: [] })
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [threadCategory, setThreadCategory] = useState<typeof THREAD_CATEGORIES[number]>('All')
  const navigate = useNavigate()

  // helper used to decide mobile vs desktop behavior
  const isMobile = () => (typeof window !== 'undefined' ? window.innerWidth < 768 : false)
  const isOpenRef = React.useRef(isOpen)
  const searchTimerRef = useRef<number | null>(null)
  const userMenuRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

  useEffect(() => {
    const readDisplayName = () => {
      const user = getStoredUser<{ username?: string; email?: string }>()
      if (!user) {
        setDisplayName('GUEST')
        return
      }

      const username = typeof user.username === 'string' ? user.username.trim() : ''
      const email = typeof user.email === 'string' ? user.email.trim() : ''
      setDisplayName(username || email || 'GUEST')
    }

    readDisplayName()
    window.addEventListener('storage', readDisplayName)
    return () => window.removeEventListener('storage', readDisplayName)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const sc = window.scrollY > 0
      setScrolled(sc)
      if (isOpenRef.current && isMobile()) {
        setIsOpen(false)
      }
      setShowUserMenu(false)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!userMenuRef.current) return
      if (!userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  // When sidebar is visible, shift the page content by adding left margin to body (desktop only)
  useEffect(() => {
    const sidebarWidth = '14rem'
    const shouldShift = scrolled && window.innerWidth >= 768
    if (shouldShift) {
      const prev = document.body.style.marginLeft
      document.body.style.transition = 'margin-left 0.25s ease'
      document.body.style.marginLeft = sidebarWidth
      return () => {
        document.body.style.marginLeft = prev || ''
      }
    } else {
      document.body.style.marginLeft = ''
    }
    return () => {
      document.body.style.marginLeft = ''
    }
  }, [scrolled])

  // debounced search
  useEffect(() => {
    const q = (searchQuery || '').trim()
    if (!q) {
      setSearchResults({ threads: [], games: [] })
      setSearchLoading(false)
      if (threadCategory !== 'All') {
        setThreadCategory('All')
      }
      return
    }
    setSearchLoading(true)
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }
    searchTimerRef.current = window.setTimeout(async () => {
      try {
        const enc = encodeURIComponent(q)
        const threadParams = new URLSearchParams({ q })
        if (threadCategory !== 'All') {
          threadParams.set('category', threadCategory)
        }
        const [gRes, tRes] = await Promise.all([
          fetch(`/api/games?q=${enc}`),
          fetch(`/api/threads?${threadParams.toString()}`)
        ])
        const games = gRes.ok ? await gRes.json() : []
        const threads = tRes.ok ? await tRes.json() : []
        setSearchResults({ games, threads })
      } catch (err) {
        console.error('Search error', err)
        setSearchResults({ games: [], threads: [] })
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [searchQuery, threadCategory])

  const handleLogout = async () => {
    await logoutFromServer()
    setShowUserMenu(false)
    setDisplayName('GUEST')
    navigate('/login', { replace: true })
  }

  return (
    <>
      <header className={`${scrolled ? 'fixed top-0 left-0 right-0 z-50 bg-violet-300/95 shadow-md backdrop-blur-sm' : 'relative z-50 bg-violet-300'}`}>
        <div className={`max-w-6xl mx-auto px-4 relative ${scrolled ? 'md:pl-56' : ''}`}>
          <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label="Toggle menu"
              className="md:hidden p-2 rounded hover:bg-violet-200"
            >
              <span className="sr-only">Toggle navigation</span>
              <div className="flex flex-col gap-1">
                <span className="block w-6 h-0.5 bg-violet-900 rounded" />
                <span className="block w-6 h-0.5 bg-violet-900 rounded" />
                <span className="block w-6 h-0.5 bg-violet-900 rounded" />
              </div>
            </button>
            <Link to="/" className="text-2xl font-semibold text-violet-900">QuestLog</Link>
               {/* Inline nav for wide screens when not scrolled (will be hidden when scrolled) */}
               {/* header nav: hide when scrolled (desktop) or when mobile overlay is open */}
               {/* Inline header nav: only show on md+ and only when not scrolled and not overlay-open */}
               <div className={`${(scrolled || isOpen) ? 'hidden' : 'hidden md:block'} absolute md:static left-0 right-0 top-full md:top-auto bg-white md:bg-transparent shadow-md md:shadow-none z-50` }>
                 <div className="max-w-6xl mx-auto px-4">
                   <nav className="flex md:flex-row flex-col gap-2 md:gap-6 text-sm text-violet-900 md:items-center py-3 md:py-0">
                     <Link className="hover:underline px-2 py-1 rounded hover:bg-violet-50 flex items-center" to="/">
                       <Home className="w-4 h-4 mr-2 text-violet-900" aria-hidden="true" />
                       HOME
                     </Link>
                     <Link className="hover:underline px-2 py-1 rounded hover:bg-violet-50 flex items-center" to="#">
                       <Info className="w-4 h-4 mr-2 text-violet-900" aria-hidden="true" />
                       ABOUT
                     </Link>
                     <Link className="hover:underline px-2 py-1 rounded hover:bg-violet-50 flex items-center" to="/games">
                       <Gamepad className="w-4 h-4 mr-2 text-violet-900" aria-hidden="true" />
                       GAMES
                     </Link>
                     <Link className="hover:underline px-2 py-1 rounded hover:bg-violet-50 flex items-center" to="/platforms">
                       {/* <Server className="w-4 h-4 mr-2 text-violet-900" aria-hidden="true" /> */}
                       PLATFORM
                     </Link>
                   </nav>
                 </div>
               </div>
          </div>

            <div className={`flex-1 px-4 transition-all ${scrolled ? 'flex justify-center' : ''}`}>
              <div className={`mx-auto w-full ${scrolled ? 'max-w-2xl' : 'max-w-md'}`}>
                <label className="relative block">
                  <input
                    className="w-full rounded-full border border-violet-400 bg-white/90 py-2 pl-4 pr-10 text-sm placeholder-violet-600 shadow-sm"
                    placeholder="Search threads or games"
                    value={searchQuery}
                    onFocus={() => setShowSearch(true)}
                    onChange={e => {
                      const v = e.target.value
                      setSearchQuery(v)
                      if (!v.trim()) {
                        setThreadCategory('All')
                      }
                    }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-violet-700">🔍</span>
                </label>
                {showSearch && (
                  <div className="mt-2 flex items-center gap-2">
                    <label htmlFor="header-thread-category" className="text-xs text-violet-900 whitespace-nowrap">Thread category</label>
                    <select
                      id="header-thread-category"
                      value={threadCategory}
                      onChange={(e) => setThreadCategory(e.target.value as typeof THREAD_CATEGORIES[number])}
                      className="px-2 py-1 border border-violet-300 bg-white rounded text-xs text-violet-900"
                    >
                      {THREAD_CATEGORIES.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                )}
                {/* Search dropdown */}
                {showSearch && (searchResults.threads.length > 0 || searchResults.games.length > 0 || searchLoading) && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border rounded shadow max-h-72 overflow-auto z-40">
                    <div className="p-2 text-sm text-gray-600">{searchLoading ? 'Searching…' : 'Results'}</div>
                    {searchResults.threads.length > 0 && (
                      <div className="border-t">
                        <div className="p-2 text-xs text-violet-700 font-semibold">Threads</div>
                        {searchResults.threads.map(t => (
                          <button key={t._id} onClick={() => { setShowSearch(false); setSearchQuery(''); setIsOpen(false); navigate(`/threads/inside/${t._id}`) }} className="w-full text-left px-3 py-2 hover:bg-violet-50">
                            <div className="font-medium text-violet-900">{t.title}</div>
                            {t.game ? <div className="text-xs text-violet-700">{t.game}</div> : null}
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.games.length > 0 && (
                      <div className="border-t">
                        <div className="p-2 text-xs text-violet-700 font-semibold">Games</div>
                        {searchResults.games.map(g => (
                          <button key={g._id} onClick={() => { setShowSearch(false); setSearchQuery(''); setIsOpen(false); navigate(`/games?q=${encodeURIComponent(g.name)}`) }} className="w-full text-left px-3 py-2 hover:bg-violet-50">
                            <div className="font-medium text-violet-900">{g.name}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 relative" ref={userMenuRef}>
              <div className="text-xs text-violet-900 hidden sm:block">✉️ (1) | 🔔 | {displayName}</div>
              <button
                type="button"
                onClick={() => setShowUserMenu(v => !v)}
                aria-expanded={showUserMenu}
                aria-haspopup="menu"
                aria-label="Open account menu"
                className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center text-violet-700 hover:bg-white"
              >
                👤
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-11 w-40 bg-white border border-violet-200 rounded-md shadow-md z-50 py-1" role="menu" aria-label="Account menu">
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="block w-full text-left px-3 py-2 text-sm text-violet-900 hover:bg-violet-50"
                    role="menuitem"
                  >
                    Account Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-sm text-violet-900 hover:bg-violet-50"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

        <aside className={`hidden md:block fixed left-0 top-0 h-full w-56 bg-white shadow-lg z-30 transform transition-transform duration-200 ease-out ${scrolled ? 'translate-x-0' : '-translate-x-full'}`} aria-hidden={!scrolled}>
        <div className="p-6 pt-20">
          <nav className="flex flex-col gap-4 text-violet-900">
            <Link className="flex items-center px-2 py-2 rounded hover:bg-violet-50" to="/">
              <Home className="w-5 h-5 mr-3" /> HOME
            </Link>
            <Link className="flex items-center px-2 py-2 rounded hover:bg-violet-50" to="#">
              <Info className="w-5 h-5 mr-3" /> ABOUT
            </Link>
            <Link className="flex items-center px-2 py-2 rounded hover:bg-violet-50" to="/games">
              <Gamepad className="w-5 h-5 mr-3" /> GAMES
            </Link>
            <Link className="flex items-center px-2 py-2 rounded hover:bg-violet-50" to="/platforms">
              <Server className="w-5 h-5 mr-3" /> PLATFORM
            </Link>
          </nav>
        </div>
      </aside>

      <div className={`md:hidden fixed inset-0 z-30 ${isOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
        <div className={`absolute inset-0 bg-black transition-opacity duration-200 ${isOpen ? 'opacity-40' : 'opacity-0'}`} onClick={() => setIsOpen(false)} />
        <div className={`absolute left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-200 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 pt-20">
            <nav className="flex flex-col gap-4 text-violet-900">
              <Link onClick={() => setIsOpen(false)} className="flex items-center px-2 py-2 rounded hover:bg-violet-50" to="/">
                <Home className="w-5 h-5 mr-3" /> HOME
              </Link>
              <Link onClick={() => setIsOpen(false)} className="flex items-center px-2 py-2 rounded hover:bg-violet-50" to="#">
                <Info className="w-5 h-5 mr-3" /> ABOUT
              </Link>
              <Link onClick={() => setIsOpen(false)} className="flex items-center px-2 py-2 rounded hover:bg-violet-50" to="/games">
                <Gamepad className="w-5 h-5 mr-3" /> GAMES
              </Link>
              <Link onClick={() => setIsOpen(false)} className="flex items-center px-2 py-2 rounded hover:bg-violet-50" to="/platforms">
                <Server className="w-5 h-5 mr-3" /> PLATFORM
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}
