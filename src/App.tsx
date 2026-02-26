import React from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import MainThreadsPage from './pages/MainThreadsPage'
import InsideThreadsPage from './pages/InsideThreadsPage'
import MainGamesPage from './pages/MainGamesPage'
import MainPlatformsPage from './pages/MainPlatformsPage'
import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/threads" element={<MainThreadsPage />} />
          <Route path="/threads/inside" element={<InsideThreadsPage />} />
          <Route path="/games" element={<MainGamesPage />} />
          <Route path="/platforms" element={<MainPlatformsPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
