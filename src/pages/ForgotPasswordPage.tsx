import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpRequested, setOtpRequested] = useState(false)
  const [otpExpiresAt, setOtpExpiresAt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const requestOtp = async () => {
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
        setMessage(errText || 'Failed to send password reset code.')
        return
      }

      const data = await res.json()
      setOtpRequested(true)
      setOtp('')
      setOtpExpiresAt(data?.expiresAt || '')

      const devNote = data?.devOtp ? ` Dev OTP: ${data.devOtp}` : ''
      setMessage(`Password reset code sent to your email.${devNote}`)
    } catch {
      setMessage('Unable to reach server. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifyOtp = async () => {
    if (!otp.trim()) {
      setMessage('Please enter the 6-digit reset code.')
      return
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setMessage('Reset code must be exactly 6 digits.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const res = await fetch('/api/users/verify-password-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim()
        })
      })

      if (!res.ok) {
        const errText = await res.text()
        setMessage(errText || 'Failed to verify password reset code.')
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
    if (!otpRequested) {
      await requestOtp()
      return
    }
    await verifyOtp()
  }

  return (
    <div className="min-h-screen bg-violet-500 flex items-center justify-center p-6 sm:p-10">
      <section className="w-full max-w-4xl min-h-[72vh] bg-violet-100 border-4 border-violet-700 rounded-xl shadow-lg px-6 py-8 sm:px-10 sm:py-12">
        <div className="max-w-2xl mx-auto pt-4 sm:pt-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-none text-violet-800 font-serif text-center">
            Forgot Your Password?
          </h1>
          <p className="mt-3 text-xl sm:text-3xl text-violet-800 font-serif text-center">
            Enter your registered email and verify the reset code.
          </p>

          <form className="mt-8 space-y-4 sm:space-y-4" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="ENTER YOUR REGISTERED EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={otpRequested || isSubmitting}
              className="w-full h-11 sm:h-[64px] rounded-xl border-4 border-violet-700 bg-violet-100 px-6 text-center text-sm sm:text-xl font-semibold tracking-wide text-violet-500 placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />

            {otpRequested && (
              <>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="ENTER 6-DIGIT RESET CODE"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full h-11 sm:h-[64px] rounded-xl border-4 border-violet-700 bg-violet-100 px-6 text-center text-sm sm:text-xl font-semibold tracking-wide text-violet-500 placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />

                {otpExpiresAt && (
                  <p className="text-violet-900 text-sm sm:text-base font-semibold text-center">
                    Code expires at {new Date(otpExpiresAt).toLocaleString()}.
                  </p>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="block w-full max-w-[50%] mx-auto h-10 sm:h-[56px] rounded-xl border-4 border-violet-700 bg-violet-300 text-violet-800 text-sm sm:text-3xl font-extrabold"
            >
              {!otpRequested
                ? isSubmitting
                  ? 'SENDING CODE...'
                  : 'SEND RESET CODE'
                : isSubmitting
                  ? 'VERIFYING...'
                  : 'VERIFY CODE'}
            </button>

            {otpRequested && (
              <button
                type="button"
                onClick={requestOtp}
                disabled={isSubmitting}
                className="block w-full max-w-[50%] mx-auto h-10 sm:h-[56px] rounded-xl border-4 border-violet-700 bg-violet-200 text-violet-800 text-sm sm:text-2xl font-extrabold"
              >
                {isSubmitting ? 'RESENDING...' : 'RESEND CODE'}
              </button>
            )}

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
