import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface ValidationErrors {
  username?: string
  email?: string
  password?: string
  otp?: string
}

export default function CreateProfilePage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [gender, setGender] = useState('')
  const [otp, setOtp] = useState('')
  const [otpExpiresAt, setOtpExpiresAt] = useState('')
  const [otpRequested, setOtpRequested] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<ValidationErrors>({})
  const redirectTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  // Validation functions
  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(emailValue.trim())
  }

  const validateUsername = (usernameValue: string): boolean => {
    const trimmedUsername = usernameValue.trim()
    // Username should be 3-20 characters, alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    return usernameRegex.test(trimmedUsername)
  }

  const getPasswordStrength = (
    passwordValue: string
  ): {
    strength: 'weak' | 'fair' | 'good' | 'strong'
    score: number
  } => {
    let score = 0
    const hasLowercase = /[a-z]/.test(passwordValue)
    const hasUppercase = /[A-Z]/.test(passwordValue)
    const hasNumbers = /\d/.test(passwordValue)
    const hasSpecialChar = /[!@#$%^&*()_\-+=\[\]{};:'",.<>?\/\\|`~]/.test(passwordValue)
    const isLongEnough = passwordValue.length >= 8
    const isVerylongEnough = passwordValue.length >= 12

    if (passwordValue.length > 0) score += 1
    if (isLongEnough) score += 1
    if (isVerylongEnough) score += 1
    if (hasLowercase) score += 1
    if (hasUppercase) score += 1
    if (hasNumbers) score += 1
    if (hasSpecialChar) score += 2

    let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak'
    if (score >= 7) {
      strength = 'strong'
    } else if (score >= 5) {
      strength = 'good'
    } else if (score >= 3) {
      strength = 'fair'
    } else {
      strength = 'weak'
    }

    return { strength, score }
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!username.trim()) {
      newErrors.username = 'Username is required.'
    } else if (!validateUsername(username)) {
      newErrors.username = 'Username must be 3-20 characters, containing only letters, numbers, and underscores.'
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required.'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (!password) {
      newErrors.password = 'Password is required.'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.'
    } else {
      const { strength } = getPasswordStrength(password)
      if (strength === 'weak') {
        newErrors.password = 'Password is too weak. Add uppercase, numbers, and special characters.'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const requestOtp = async () => {
    // Validate form before requesting OTP
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const res = await fetch('/api/users/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
          birthdate: birthdate || undefined,
          gender: gender || undefined
        })
      })

      if (!res.ok) {
        const errText = await res.text()
        setMessage(errText || 'Failed to send verification code.')
        return
      }

      const data = await res.json()
      setOtpRequested(true)
      setOtp('')
      setOtpExpiresAt(data?.expiresAt || '')
      setErrors({})

      const devNote = data?.devOtp
        ? ` Dev OTP: ${data.devOtp}`
        : ''
      setMessage(`Verification code sent to your email. Enter the 6-digit code to continue.${devNote}`)
    } catch (err) {
      setMessage('Unable to reach server. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifyOtpAndCreate = async () => {
    const newErrors: ValidationErrors = {}

    if (!otp.trim()) {
      newErrors.otp = 'Please enter the 6-digit verification code.'
    } else if (!/^\d{6}$/.test(otp.trim())) {
      newErrors.otp = 'Verification code must be exactly 6 digits.'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const res = await fetch('/api/users/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim()
        })
      })

      if (!res.ok) {
        const errText = await res.text()
        setMessage(errText || 'Failed to verify code.')
        return
      }

      setMessage('Profile created successfully! Redirecting to login in 20 seconds...')
      setUsername('')
      setEmail('')
      setPassword('')
      setBirthdate('')
      setGender('')
      setOtp('')
      setOtpExpiresAt('')
      setOtpRequested(false)
      setErrors({})

      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current)
      }

      redirectTimeoutRef.current = window.setTimeout(() => {
        navigate('/login')
      }, 20000)
    } catch (err) {
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
    await verifyOtpAndCreate()
  }

  return (
    <div className="min-h-screen bg-violet-500 flex items-center justify-center p-4 sm:p-8">
      <section className="w-full max-w-4xl bg-violet-100 border-4 border-violet-700 rounded-xl shadow-lg p-5 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-violet-800 font-serif leading-none">Create Your Profile</h1>
            <p className="mt-2 text-xl sm:text-3xl text-violet-800 font-serif">Customize your log</p>
          </div>
          <Link
            to="/login"
            aria-label="Close"
            className="text-violet-700 text-3xl sm:text-4xl font-extrabold leading-none hover:opacity-80"
          >
            ×
          </Link>
        </div>

        <div className="mt-6 sm:mt-8 flex items-center gap-4 sm:gap-5">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-violet-700 bg-violet-300 flex items-center justify-center text-4xl sm:text-5xl">
            👤
          </div>
          <button type="button" className="text-violet-800 text-base sm:text-2xl font-semibold">
            Change Your Profile Photo
          </button>
        </div>

        <form className="mt-6 sm:mt-8 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-violet-800 text-lg sm:text-2xl font-serif mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={otpRequested || isSubmitting}
              className={`w-full h-12 sm:h-16 rounded-2xl border-4 px-4 text-violet-800 text-base sm:text-xl focus:outline-none focus:ring-2 ${
                errors.username
                  ? 'border-red-600 bg-red-100 focus:ring-red-400'
                  : 'border-violet-700 bg-violet-100 focus:ring-violet-400'
              }`}
            />
            {errors.username && (
              <p className="mt-1 text-red-700 text-sm font-semibold">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-violet-800 text-lg sm:text-2xl font-serif mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={otpRequested || isSubmitting}
              className={`w-full h-12 sm:h-16 rounded-2xl border-4 px-4 text-violet-800 text-base sm:text-xl focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-red-600 bg-red-100 focus:ring-red-400'
                  : 'border-violet-700 bg-violet-100 focus:ring-violet-400'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-red-700 text-sm font-semibold">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-violet-800 text-lg sm:text-2xl font-serif mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={otpRequested || isSubmitting}
              className={`w-full h-12 sm:h-16 rounded-2xl border-4 px-4 text-violet-800 text-base sm:text-xl focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'border-red-600 bg-red-100 focus:ring-red-400'
                  : 'border-violet-700 bg-violet-100 focus:ring-violet-400'
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-red-700 text-sm font-semibold">{errors.password}</p>
            )}

            {password && !otpRequested && (() => {
              const { strength, score } = getPasswordStrength(password)
              const strengthColors = {
                weak: 'bg-red-500',
                fair: 'bg-yellow-500',
                good: 'bg-blue-500',
                strong: 'bg-green-500'
              }
              const strengthLabels = {
                weak: 'Weak',
                fair: 'Fair',
                good: 'Good',
                strong: 'Strong'
              }
              const maxScore = 9

              return (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-violet-800 text-sm font-semibold">Strength:</span>
                    <div className="flex-1 h-2 bg-violet-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthColors[strength]} transition-all duration-300`}
                        style={{ width: `${(score / maxScore) * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold ${
                      strength === 'weak' ? 'text-red-600' :
                      strength === 'fair' ? 'text-yellow-600' :
                      strength === 'good' ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      {strengthLabels[strength]}
                    </span>
                  </div>
                  <p className="mt-1 text-violet-700 text-xs">
                    Tip: Use uppercase, lowercase, numbers, and special characters for stronger security.
                  </p>
                </div>
              )
            })()}
          </div>

          <div>
            <label className="block text-violet-800 text-lg sm:text-2xl font-serif mb-1">Birthdate</label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              disabled={otpRequested || isSubmitting}
              className="w-full h-12 sm:h-16 rounded-2xl border-4 border-violet-700 bg-violet-100 px-4 text-violet-800 text-base sm:text-xl focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div>
            <label className="block text-violet-800 text-lg sm:text-2xl font-serif mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={otpRequested || isSubmitting}
              className="w-full h-12 sm:h-16 rounded-2xl border-4 border-violet-700 bg-violet-100 px-4 text-violet-800 text-base sm:text-xl focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              <option value="" disabled>
                Select gender
              </option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not">Prefer not to say</option>
            </select>
          </div>

          {otpRequested && (
            <div>
              <label className="block text-violet-800 text-lg sm:text-2xl font-serif mb-1">Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={`w-full h-12 sm:h-16 rounded-2xl border-4 px-4 text-violet-800 text-base sm:text-xl focus:outline-none focus:ring-2 ${
                  errors.otp
                    ? 'border-red-600 bg-red-100 focus:ring-red-400'
                    : 'border-violet-700 bg-violet-100 focus:ring-violet-400'
                }`}
              />
              {errors.otp && (
                <p className="mt-1 text-red-700 text-sm font-semibold">{errors.otp}</p>
              )}
              {otpExpiresAt && (
                <p className="mt-2 text-violet-900 text-sm sm:text-base font-semibold">
                  Code expires at {new Date(otpExpiresAt).toLocaleString()}.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || (!otpRequested && Object.keys(errors).length > 0)}
            className={`w-full h-12 sm:h-16 mt-4 rounded-2xl border-4 border-violet-700 text-violet-800 text-lg sm:text-3xl font-extrabold ${
              isSubmitting || (!otpRequested && Object.keys(errors).length > 0)
                ? 'bg-gray-300 cursor-not-allowed opacity-60'
                : 'bg-violet-300'
            }`}
          >
            {!otpRequested
              ? isSubmitting
                ? 'SENDING CODE...'
                : 'SEND VERIFICATION CODE'
              : isSubmitting
                ? 'VERIFYING...'
                : 'VERIFY CODE & CREATE PROFILE'}
          </button>

          {otpRequested && (
            <button
              type="button"
              onClick={requestOtp}
              disabled={isSubmitting}
              className="w-full h-12 sm:h-16 rounded-2xl border-4 border-violet-700 bg-violet-200 text-violet-800 text-base sm:text-2xl font-extrabold"
            >
              {isSubmitting ? 'RESENDING...' : 'RESEND CODE'}
            </button>
          )}

          {message && (
            <p className="text-violet-900 text-sm sm:text-base font-semibold">{message}</p>
          )}
        </form>
      </section>
    </div>
  )
}
