function getPathParts(req) {
  const raw = String(req.url || req.originalUrl || '')
  const pathname = raw.split('?')[0]
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length > 0 && parts[0] === 'api') parts.shift()
  return parts
}

async function tryImport(path) {
  try {
    return await import(path)
  } catch {
    return null
  }
}

async function resolveHandlerModule(base) {
  // Try catch-all first, then index.js.
  return (await tryImport(`./${base}/[[...slug]].js`)) || (await tryImport(`./${base}/index.js`))
}

export default async function dispatch(req, res) {
  const parts = getPathParts(req)
  if (!parts || parts.length === 0) {
    return res.status(404).json({ error: 'Not found' })
  }

  const base = parts[0]
  const slugParts = parts.slice(1)

  let module = null

  if (slugParts.length === 1) {
    module = await tryImport(`./${base}/${slugParts[0]}.js`)
  }

  if (!module && slugParts.length > 0) {
    module = await tryImport(`./${base}/[action].js`)
    if (module) {
      req.query = req.query || {}
      req.query.action = slugParts[0]
    }
  }

  if (!module) {
    module = await resolveHandlerModule(base)
  }

  if (!module) {
    return res.status(404).json({ error: 'Not found' })
  }

  const handler = module.default || module
  req.query = req.query || {}
  req.query.slug = slugParts.length ? slugParts : undefined

  try {
    // allow handler to be async or sync
    return await handler(req, res)
  } catch (err) {
    console.error('Dispatch handler error', err)
    return res.status(500).send('Request failed')
  }
}
