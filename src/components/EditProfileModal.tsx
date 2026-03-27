import React, { useState, useEffect } from 'react'
import { getStoredUser, saveAuth } from '../js/auth'

type Props = {
  open: boolean
  onClose: () => void
  onSaved?: (user: any) => void
  targetUser?: any | null
  persistAuth?: boolean
}

export default function EditProfileModal({ open, onClose, onSaved, targetUser = null, persistAuth = true }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    const u = targetUser || getStoredUser<any>()
    if (u) {
      setForm({
        _id: u._id,
        displayName: u.displayName || u.username || '',
        name: u.name || '',
        birthdate: u.birthdate ? (new Date(u.birthdate)).toISOString().slice(0,10) : '',
        gender: u.gender || '',
        address: u.address || '',
        phone: u.phone || ''
      })
    }
  }, [open])

  if (!open) return null

  const handleChange = (k: string, v: any) => setForm((s: any) => ({ ...s, [k]: v }))

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Save failed')
      }
      const updated = await res.json()
      if (persistAuth) {
        // persist to same storage location
        const keepSignedIn = typeof window !== 'undefined' && localStorage.getItem('questlog-auth') === 'true'
        saveAuth(updated, keepSignedIn)
      }
      if (onSaved) onSaved(updated)
      onClose()
    } catch (err: any) {
      alert(err.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
        <h3 className="text-lg font-semibold text-violet-800">Edit Profile</h3>
        <div className="mt-4 grid grid-cols-1 gap-3">
          <label className="text-sm">
            Display name
            <input className="mt-1 w-full border rounded px-2 py-1" value={form.displayName || ''} onChange={e => handleChange('displayName', e.target.value)} />
          </label>
          <label className="text-sm">
            Full name
            <input className="mt-1 w-full border rounded px-2 py-1" value={form.name || ''} onChange={e => handleChange('name', e.target.value)} />
          </label>
          <div className="flex gap-3">
            <label className="text-sm flex-1">
              Birthday
              <input type="date" className="mt-1 w-full border rounded px-2 py-1" value={form.birthdate || ''} onChange={e => handleChange('birthdate', e.target.value)} />
            </label>
            <label className="text-sm w-40">
              Gender
              <select className="mt-1 w-full border rounded px-2 py-1" value={form.gender || ''} onChange={e => handleChange('gender', e.target.value)}>
                <option value="">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>
          <label className="text-sm">
            Address
            <input className="mt-1 w-full border rounded px-2 py-1" value={form.address || ''} onChange={e => handleChange('address', e.target.value)} />
          </label>
          <label className="text-sm">
            Phone
            <input className="mt-1 w-full border rounded px-2 py-1" value={form.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-2 rounded border" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="px-4 py-2 rounded bg-violet-600 text-white" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}
