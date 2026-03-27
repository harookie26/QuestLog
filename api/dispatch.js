function getPathParts(req) {
  const raw = String(req.url || req.originalUrl || '')
  const pathname = raw.split('?')[0]
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length > 0 && parts[0] === 'api') parts.shift()
  return parts
}

async function resolveHandlerModule(base) {
  // Try index.js first, then catch-all
  try {
    return await import(`./${base}/index.js`)
  } catch (e) {
    try {
      return await import(`./${base}/[[...slug]].js`)
    } catch (e2) {
      return null
    }
  }
}

export default async function dispatch(req, res) {
  const parts = getPathParts(req)
  if (!parts || parts.length === 0) {
    return res.status(404).json({ error: 'Not found' })
  }

  const base = parts[0]
  const slugParts = parts.slice(1)

  const module = await resolveHandlerModule(base)
  if (!module) {
    return res.status(404).json({ error: 'Not found' })
  }

  const handler = module.default || module
  req.query = req.query || {}
  req.query.slug = slugParts.length ? slugParts : undefined
  
  // Set action param if first slug part exists (for [action].js handlers)
  if (slugParts.length > 0) {
    req.query.action = slugParts[0]
  }

  try {
    // allow handler to be async or sync
    return await handler(req, res)
  } catch (err) {
    console.error('Dispatch handler error', err)
    return res.status(500).send('Request failed')
  }
}
