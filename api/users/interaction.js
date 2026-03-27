import { connect } from '../../lib/db.js'
import User from '../../lib/models/User.js'
import { getSessionUser } from '../../lib/auth/session.js'

export default async function handler(req, res) {
  try {
    await connect()
  } catch (err) {
    console.error('DB connect error', err)
    return res.status(500).send('Database connection error')
  }

  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST'])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const body = req.body || {}
    const type = (body.type || '').toString()
    const name = (body.name || '').toString().trim()
    const sessionUser = getSessionUser(req)

    if (!sessionUser || !sessionUser._id) return res.status(401).send('Not authenticated')
    if (!type || !['tag', 'category'].includes(type)) return res.status(400).send('type must be "tag" or "category"')
    if (!name) return res.status(400).send('name is required')

    const user = await User.findById(sessionUser._id)
    if (!user) return res.status(404).send('User not found')

    if (type === 'tag') {
      const counts = user.tagCounts || {}
      const prev = typeof counts[name] === 'number' ? counts[name] : 0
      counts[name] = prev + 1
      user.tagCounts = counts
    } else {
      const counts = user.categoryCounts || {}
      const prev = typeof counts[name] === 'number' ? counts[name] : 0
      counts[name] = prev + 1
      user.categoryCounts = counts
    }

    user.updatedAt = new Date()
    await user.save()

    return res.status(200).json({ tagCounts: user.tagCounts || {}, categoryCounts: user.categoryCounts || {} })
  } catch (err) {
    console.error('/api/users/interaction error', err)
    return res.status(500).send('Server error')
  }
}
