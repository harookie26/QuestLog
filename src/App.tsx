import React from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import MainThreadsPage from './pages/MainThreadsPage'
import InsideThreadsPage from './pages/InsideThreadsPage'
import MainGamesPage from './pages/MainGamesPage'
import MainPlatformsPage from './pages/MainPlatformsPage'
import LoginPage from './pages/LoginPage'
import CreateProfilePage from './pages/CreateProfilePage'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

export default function App() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/create-profile'

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {!isAuthPage && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-profile" element={<CreateProfilePage />} />
          <Route path="/threads" element={<MainThreadsPage />} />
          <Route path="/threads/inside" element={<InsideThreadsPage />} />
          <Route path="/threads/inside/:id" element={<InsideThreadsPage />} />
          <Route path="/games" element={<MainGamesPage />} />
          <Route path="/platforms" element={<MainPlatformsPage />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
      <Analytics />
      <SpeedInsights />
    </div>
  )
}
