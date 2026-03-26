import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

type TagCount = { name: string; count: number }

export default function UserProfilePage() {
  const { username } = useParams<{ username?: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!username) return
    let mounted = true
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/users/profile?username=${encodeURIComponent(username)}`)
        if (!res.ok) {
          if (res.status === 404) {
            if (mounted) setUser(null)
            return
          }
          throw new Error('Failed')
        }
        const data = await res.json()
        if (mounted) setUser(data)
      } catch (err) {
        if (mounted) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchProfile()
    return () => { mounted = false }
  }, [username])

  if (!username && !loading) return <div className="max-w-4xl mx-auto p-8 text-center">No user specified</div>

  if (!user && !loading) return <div className="max-w-4xl mx-auto p-8 text-center">User not found</div>

  const topTags = Object.keys(user?.tagCounts || {}).map(name => ({ name, count: user.tagCounts[name] })).sort((a:any,b:any)=>b.count-a.count).slice(0,8)
  const topCategories = Object.keys(user?.categoryCounts || {}).map(name => ({ name, count: user.categoryCounts[name] })).sort((a:any,b:any)=>b.count-a.count).slice(0,8)

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="rounded-xl border-2 border-violet-200 p-6 bg-white">
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 rounded-xl bg-violet-100 overflow-hidden flex items-center justify-center text-4xl text-violet-800">{(user && user.username ? user.username.charAt(0).toUpperCase() : 'U')}</div>
              <div>
                <div className="text-3xl font-bold text-violet-800">{user?.displayName || user?.username || user?.email || 'User'}</div>
                <div className="text-sm text-violet-700">@{user?.username || (user?.email || '').split('@')[0]}</div>
                <div className="mt-3 flex gap-2">
                  <button className="px-4 py-2 rounded bg-white border border-violet-300 text-violet-800">SHARE PROFILE</button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="grid grid-cols-4 gap-4 text-center text-violet-800 font-semibold">
                <div>
                  <div className="text-2xl">{user?.threadsJoined || 0}</div>
                  <div className="text-xs text-violet-600">Threads Joined</div>
                </div>
                <div>
                  <div className="text-2xl">{user?.threadsStarted || 0}</div>
                  <div className="text-xs text-violet-600">Threads Started</div>
                </div>
                <div>
                  <div className="text-2xl">{user?.contributions || 0}</div>
                  <div className="text-xs text-violet-600">Thread Contributions</div>
                </div>
                <div>
                  <div className="text-2xl">{user?.muffins || 0}</div>
                  <div className="text-xs text-violet-600">Muffins Received</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm text-violet-700 font-semibold">TOP TAGS</h3>
              <div className="mt-3 flex flex-col gap-2">
                {topTags.length === 0 ? (
                  <div className="text-xs text-gray-500">No tags yet</div>
                ) : (
                  topTags.map(t => (
                    <div key={t.name} className="text-sm text-violet-800">#{t.name} <span className="text-xs text-gray-500">({t.count})</span></div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="md:flex-1">
          <div className="bg-white rounded-lg p-6 border border-violet-100">
            <h2 className="text-xl font-semibold text-violet-800">Personal Information</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-violet-900">
              <div><span className="font-semibold">NAME:</span> {user?.name || user?.displayName || '-'}</div>
              <div><span className="font-semibold">BIRTHDAY:</span> {user?.birthdate ? new Date(user.birthdate).toLocaleDateString() : '-'}</div>
              <div><span className="font-semibold">GENDER:</span> {user?.gender || '-'}</div>
              <div><span className="font-semibold">ADDRESS:</span> {user?.address || '-'}</div>
              <div><span className="font-semibold">EMAIL:</span> {user?.email ? '(hidden)' : '-'}</div>
              <div><span className="font-semibold">PHONE NUMBER:</span> {user?.phone || '-'}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 border border-violet-100">
              <h3 className="text-sm font-semibold text-violet-700">TOP CATEGORIES</h3>
              <div className="mt-3">
                {topCategories.length === 0 ? (
                  <div className="text-xs text-gray-500">No categories yet</div>
                ) : (
                  <ul className="list-disc list-inside text-violet-800">
                    {topCategories.map(c => (
                      <li key={c.name} className="text-sm">{c.name} <span className="text-xs text-gray-500">({c.count})</span></li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-violet-100">
              <h3 className="text-sm font-semibold text-violet-700">TOP GAMES</h3>
              <div className="mt-3">
                {(user?.topGames || []).length === 0 ? (
                  <div className="text-xs text-gray-500">No games yet</div>
                ) : (
                  <ul className="list-disc list-inside text-violet-800">
                    {(user?.topGames || []).slice(0, 6).map((g: string) => <li key={g} className="text-sm">{g}</li>)}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
