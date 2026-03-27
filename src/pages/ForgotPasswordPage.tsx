import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const startReset = async () => {
    if (!email.trim()) {
      setMessage('Email is required.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const res = await fetch('/api/users/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      })

      if (!res.ok) {
        const errText = await res.text()
        setMessage(errText || 'Failed to start password reset.')
        return
      }

      const data = await res.json()
      navigate('/reset-password', {
        state: {
          email: data?.email || email.trim(),
          resetToken: data?.resetToken || ''
        }
      })
    } catch {
      setMessage('Unable to reach server. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await startReset()
  }

  return (
    <div className="min-h-screen bg-violet-500 flex items-center justify-center p-6 sm:p-10">
      <section className="w-full max-w-4xl min-h-[72vh] bg-violet-100 border-4 border-violet-700 rounded-xl shadow-lg px-6 py-8 sm:px-10 sm:py-12">
        <div className="max-w-2xl mx-auto pt-4 sm:pt-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-none text-violet-800 font-serif text-center">
            Forgot Your Password?
          </h1>
          <p className="mt-3 text-xl sm:text-3xl text-violet-800 font-serif text-center">
            Enter your registered email to start password reset.
          </p>

          <form className="mt-8 space-y-4 sm:space-y-4" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="ENTER YOUR REGISTERED EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-11 sm:h-[64px] rounded-xl border-4 border-violet-700 bg-violet-100 px-6 text-center text-sm sm:text-xl font-semibold tracking-wide text-violet-500 placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="block w-full max-w-[50%] mx-auto h-10 sm:h-[56px] rounded-xl border-4 border-violet-700 bg-violet-300 text-violet-800 text-sm sm:text-3xl font-extrabold"
            >
              {isSubmitting ? 'STARTING...' : 'CONTINUE'}
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
