import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <header className="bg-violet-300">
      <div className="max-w-6xl mx-auto px-4 relative">
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

            <div className={`${isOpen ? 'block' : 'hidden'} md:block absolute md:static left-0 right-0 top-full md:top-auto bg-white md:bg-transparent shadow-md md:shadow-none z-50` }>
              <div className="max-w-6xl mx-auto px-4">
                <nav className="flex md:flex-row flex-col gap-2 md:gap-6 text-sm text-violet-900 md:items-center py-3 md:py-0">
                  <Link className="hover:underline px-2 py-1 rounded hover:bg-violet-50" to="/">HOME</Link>
                  <Link className="hover:underline px-2 py-1 rounded hover:bg-violet-50" to="#">BOARDS</Link>
                  <Link className="hover:underline px-2 py-1 rounded hover:bg-violet-50" to="/games">GAMES</Link>
                  <Link className="hover:underline px-2 py-1 rounded hover:bg-violet-50" to="/platforms">PLATFORM</Link>
                </nav>
              </div>
            </div>
          </div>

          <div className="flex-1 px-4">
            <div className="max-w-md mx-auto">
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
  )
}
