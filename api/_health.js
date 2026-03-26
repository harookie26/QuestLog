import { connect } from '../lib/db.js'

export default async function handler(req, res) {
  try {
    await connect()
  } catch (err) {
    console.error('DB connect error', err)
    return res.status(500).json({ ok: false, db: false, error: String(err && err.message ? err.message : err) })
  }

  // Echo basic request info so we can verify routing and methods
  return res.status(200).json({ ok: true, db: true, method: req.method, url: req.url })
}
