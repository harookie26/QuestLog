import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function CreateProfilePage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [gender, setGender] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const missingRequiredField = [username, email, password].some((value) => !value.trim())
    if (missingRequiredField) {
      setMessage('Username, email, and password are required.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const res = await fetch('/api/users', {
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
        setMessage(errText || 'Failed to create profile.')
        return
      }

      setMessage('Profile created successfully! You can now log in.')
      setUsername('')
      setEmail('')
      setPassword('')
      setBirthdate('')
      setGender('')
    } catch (err) {
      setMessage('Unable to reach server. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-violet-500 flex items-center justify-center p-4 sm:p-8">
      <section className="w-full max-w-4xl bg-violet-100 border-4 border-violet-700 rounded-xl shadow-lg p-5 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-violet-800 font-serif leading-none">Edit Your Profile</h1>
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
              className="w-full h-12 sm:h-16 rounded-2xl border-4 border-violet-700 bg-violet-100 px-4 text-violet-800 text-base sm:text-xl focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div>
            <label className="block text-violet-800 text-lg sm:text-2xl font-serif mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 sm:h-16 rounded-2xl border-4 border-violet-700 bg-violet-100 px-4 text-violet-800 text-base sm:text-xl focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div>
            <label className="block text-violet-800 text-lg sm:text-2xl font-serif mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 sm:h-16 rounded-2xl border-4 border-violet-700 bg-violet-100 px-4 text-violet-800 text-base sm:text-xl focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div>
            <label className="block text-violet-800 text-lg sm:text-2xl font-serif mb-1">Birthdate</label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full h-12 sm:h-16 rounded-2xl border-4 border-violet-700 bg-violet-100 px-4 text-violet-800 text-base sm:text-xl focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div>
            <label className="block text-violet-800 text-lg sm:text-2xl font-serif mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 sm:h-16 mt-4 rounded-2xl border-4 border-violet-700 bg-violet-300 text-violet-800 text-lg sm:text-3xl font-extrabold"
          >
            {isSubmitting ? 'CREATING PROFILE...' : 'CREATE PROFILE'}
          </button>

          {message && (
            <p className="text-violet-900 text-sm sm:text-base font-semibold">{message}</p>
          )}
        </form>
      </section>
    </div>
  )
}
