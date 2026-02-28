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
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

export default function App() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/create-profile'
  const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('questlog-auth') === 'true'
  const showAppShell = !isAuthPage && isAuthenticated

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {showAppShell && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/create-profile" element={<CreateProfilePage />} />
          <Route path="/threads" element={<ProtectedRoute><MainThreadsPage /></ProtectedRoute>} />
          <Route path="/threads/inside" element={<ProtectedRoute><InsideThreadsPage /></ProtectedRoute>} />
          <Route path="/threads/inside/:id" element={<ProtectedRoute><InsideThreadsPage /></ProtectedRoute>} />
          <Route path="/games" element={<ProtectedRoute><MainGamesPage /></ProtectedRoute>} />
          <Route path="/platforms" element={<ProtectedRoute><MainPlatformsPage /></ProtectedRoute>} />
        </Routes>
      </main>
      {showAppShell && <Footer />}
      <Analytics />
      <SpeedInsights />
    </div>
  )
}
