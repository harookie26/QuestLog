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
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProfilePage from './pages/ProfilePage'
import UserProfilePage from './pages/UserProfilePage'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { fetchSessionUser, getStoredUser } from './js/auth'

export default function App() {
  const location = useLocation()
  const [isAuthLoading, setIsAuthLoading] = React.useState(true)
  const [currentUser, setCurrentUser] = React.useState<any | null>(() => getStoredUser<any>())

  React.useEffect(() => {
    let isMounted = true

    const syncSession = async () => {
      setIsAuthLoading(true)
      const user = await fetchSessionUser<any>()
      if (isMounted) {
        setCurrentUser(user)
        setIsAuthLoading(false)
      }
    }

    syncSession()

    return () => {
      isMounted = false
    }
  }, [location.pathname])

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/create-profile' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password'
  const isAuthenticated = Boolean(currentUser)
  const showAppShell = !isAuthPage && isAuthenticated

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (isAuthLoading) return null
    if (!isAuthenticated) return <Navigate to="/login" replace />
    return <>{children}</>
  }

  if (!isAuthPage && isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-violet-800 font-semibold">
        Restoring session...
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {showAppShell && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/create-profile" element={<CreateProfilePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/users/:username" element={<UserProfilePage />} />
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
