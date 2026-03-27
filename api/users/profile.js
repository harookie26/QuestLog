import { connect } from '../../lib/db.js'
import User from '../../lib/models/User.js'
import Thread from '../../lib/models/Thread.js'
import Message from '../../lib/models/Message.js'

const ROLE_ADMINISTRATOR = 'Administrator'

function normalizeUser(value) {
  return String(value || '').trim().toLowerCase()
}

function normalizeRole(value) {
  return value === ROLE_ADMINISTRATOR ? ROLE_ADMINISTRATOR : 'Member'
}

function toCaseInsensitiveExactRegex(value) {
  return new RegExp(`^${String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
}

export default async function handler(req, res) {
  try {
    await connect()
  } catch (err) {
    console.error('DB connect error', err)
    return res.status(500).send('Database connection error')
  }

  try {
    if (req.method === 'GET') {
      const id = req.query?.id || req.query?._id
      const username = req.query?.username
      let user = null
      if (id) {
        user = await User.findById(id).lean()
      } else if (username) {
        user = await User.findOne({ username: new RegExp(`^${String(username) }$`, 'i') }).lean()
      } else {
        return res.status(400).send('id or username query parameter required')
      }
      if (!user) return res.status(404).send('User not found')
      return res.status(200).json(user)
    }

    if (req.method === 'PUT') {
      const body = req.body || {}
      const { _id } = body
      if (!_id) return res.status(400).send('_id is required')

      const currentUser = (body.currentUser || req.query?.currentUser || '').toString().trim()
      if (!currentUser) return res.status(401).send('currentUser is required')

      const actor = await User.findOne({ username: toCaseInsensitiveExactRegex(currentUser) }).select('username role').lean()
      if (!actor) return res.status(401).send('currentUser is required')

      const target = await User.findById(_id).lean()
      if (!target) return res.status(404).send('User not found')

      const isSelfEdit = normalizeUser(target.username) === normalizeUser(actor.username)
      const isAdmin = normalizeRole(actor.role) === ROLE_ADMINISTRATOR
      if (!isSelfEdit && !isAdmin) return res.status(403).send('Not authorized')

      // only allow editing of specific fields
      const allowed = ['displayName', 'name', 'birthdate', 'gender', 'address', 'phone']
      const update = {}
      for (const k of allowed) {
        if (Object.prototype.hasOwnProperty.call(body, k)) {
          if (typeof body[k] === 'string') update[k] = String(body[k]).trim()
          else update[k] = body[k]
        }
      }

      update.updatedAt = new Date()

      const user = await User.findById(_id)
      if (!user) return res.status(404).send('User not found')

      // apply updates
      for (const key of Object.keys(update)) {
        user[key] = update[key]
      }

      await user.save()
      const fresh = await User.findById(_id).lean()
      return res.status(200).json(fresh)
    }

    if (req.method === 'DELETE') {
      const body = req.body || {}
      const id = body._id || req.query?.id || req.query?._id
      if (!id) return res.status(400).send('_id is required')

      const currentUser = (body.currentUser || req.query?.currentUser || '').toString().trim()
      if (!currentUser) return res.status(401).send('currentUser is required')

      const actor = await User.findOne({ username: toCaseInsensitiveExactRegex(currentUser) }).select('username role').lean()
      if (!actor) return res.status(401).send('currentUser is required')

      const target = await User.findById(id).lean()
      if (!target) return res.status(404).send('User not found')

      const isSelfDelete = normalizeUser(target.username) === normalizeUser(actor.username)
      const isAdmin = normalizeRole(actor.role) === ROLE_ADMINISTRATOR
      if (!isSelfDelete && !isAdmin) return res.status(403).send('Not authorized')

      const targetUsername = String(target.username || '').trim()
      if (targetUsername) {
        const targetRegex = toCaseInsensitiveExactRegex(targetUsername)
        await Thread.updateMany({ author: targetRegex }, { $set: { author: 'Deleted User' } })
        await Message.updateMany({ author: targetRegex }, { $set: { author: 'Deleted User' } })
      }

      await User.findByIdAndDelete(id)
      return res.status(204).end()
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  } catch (err) {
    console.error('/api/users/profile error', err)
    return res.status(500).send('Server error')
  }
}
