import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

type ResetState = {
  email?: string
  resetToken?: string
}

export default function ResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const redirectTimeoutRef = useRef<number | null>(null)

  const state = (location.state || {}) as ResetState
  const email = state.email || ''
  const resetToken = state.resetToken || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  if (!email || !resetToken) {
    return (
      <div className="min-h-screen bg-violet-500 flex items-center justify-center p-6 sm:p-10">
        <section className="w-full max-w-3xl bg-violet-100 border-4 border-violet-700 rounded-xl shadow-lg px-6 py-8 sm:px-10 sm:py-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-none text-violet-800 font-serif text-center">
            Reset Session Missing
          </h1>
          <p className="mt-4 text-violet-900 text-base sm:text-xl font-semibold text-center">
            Please request and verify a password reset code first.
          </p>
          <div className="mt-8 text-center">
            <Link to="/forgot-password" className="text-violet-800 underline text-sm sm:text-2xl">
              GO TO FORGOT PASSWORD
            </Link>
          </div>
        </section>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setMessage('New password and confirmation are required.')
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          resetToken,
          newPassword,
          confirmPassword
        })
      })

      if (!res.ok) {
        const errText = await res.text()
        setMessage(errText || 'Failed to reset password.')
        return
      }

      setMessage('Password reset successful! Redirecting to login...')
      setNewPassword('')
      setConfirmPassword('')

      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current)
      }

      redirectTimeoutRef.current = window.setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch {
      setMessage('Unable to reach server. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-violet-500 flex items-center justify-center p-6 sm:p-10">
      <section className="w-full max-w-4xl min-h-[72vh] bg-violet-100 border-4 border-violet-700 rounded-xl shadow-lg px-6 py-8 sm:px-10 sm:py-12">
        <div className="max-w-2xl mx-auto pt-4 sm:pt-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-none text-violet-800 font-serif text-center">
            Reset Password
          </h1>
          <p className="mt-3 text-xl sm:text-3xl text-violet-800 font-serif text-center">
            Enter a new password for {email}
          </p>

          <form className="mt-8 space-y-4 sm:space-y-4" onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="ENTER NEW PASSWORD"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-11 sm:h-[64px] rounded-xl border-4 border-violet-700 bg-violet-100 px-6 text-center text-sm sm:text-xl font-semibold tracking-wide text-violet-500 placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />

            <input
              type="password"
              placeholder="RE-ENTER NEW PASSWORD"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-11 sm:h-[64px] rounded-xl border-4 border-violet-700 bg-violet-100 px-6 text-center text-sm sm:text-xl font-semibold tracking-wide text-violet-500 placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="block w-full max-w-[60%] mx-auto h-10 sm:h-[56px] rounded-xl border-4 border-violet-700 bg-violet-300 text-violet-800 text-sm sm:text-3xl font-extrabold"
            >
              {isSubmitting ? 'RESETTING...' : 'RESET PASSWORD'}
            </button>

            {message && <p className="text-violet-900 text-sm sm:text-base font-semibold text-center">{message}</p>}
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-violet-800 underline text-xs sm:text-2xl">
              BACK TO LOGIN
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
