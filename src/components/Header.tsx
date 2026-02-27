import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Home, List, Gamepad, Server } from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // When sidebar is visible, shift the page content by adding left margin to body (desktop only)
  useEffect(() => {
    const sidebarWidth = '14rem' // matches w-56
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
  return (
    <>
      <header className={`${scrolled ? 'fixed top-0 left-0 right-0 z-50 bg-violet-300/95 shadow-md backdrop-blur-sm' : 'bg-violet-300'}`}>
        <div className={`max-w-6xl mx-auto px-4 relative ${scrolled ? 'md:pl-56' : ''}`}>
          <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-semibold text-violet-900">QuestLog</Link>
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
               {/* Inline nav for wide screens when not scrolled (will be hidden when scrolled) */}
               <div className={`${scrolled ? 'hidden' : (isOpen ? 'block md:block' : 'hidden md:block')} absolute md:static left-0 right-0 top-full md:top-auto bg-white md:bg-transparent shadow-md md:shadow-none z-50` }>
                 <div className="max-w-6xl mx-auto px-4">
                   <nav className="flex md:flex-row flex-col gap-2 md:gap-6 text-sm text-violet-900 md:items-center py-3 md:py-0">
                     <Link className="hover:underline px-2 py-1 rounded hover:bg-violet-50 flex items-center" to="/">
                       <Home className="w-4 h-4 mr-2 text-violet-900" aria-hidden="true" />
                       HOME
                     </Link>
                     <Link className="hover:underline px-2 py-1 rounded hover:bg-violet-50 flex items-center" to="#">
                       <List className="w-4 h-4 mr-2 text-violet-900" aria-hidden="true" />
                       BOARDS
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
                    placeholder="Search Game Titles"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-violet-700">🔍</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-xs text-violet-900 hidden sm:block">✉️ (1) | 🔔 | USER123</div>
              <div className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center text-violet-700">👤</div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar that appears when the user scrolls */}
      <aside className={`fixed left-0 top-0 h-full w-56 bg-white shadow-lg z-40 transform transition-transform duration-300 ${scrolled ? 'translate-x-0' : '-translate-x-full'}`} aria-hidden={!scrolled}>
        <div className="p-6 pt-20">
          <nav className="flex flex-col gap-4 text-violet-900">
            <Link className="flex items-center px-2 py-2 rounded hover:bg-violet-50" to="/">
              <Home className="w-5 h-5 mr-3" /> HOME
            </Link>
            <Link className="flex items-center px-2 py-2 rounded hover:bg-violet-50" to="#">
              <List className="w-5 h-5 mr-3" /> BOARDS
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
    </>
  )
}
