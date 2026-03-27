import handler from './threads/[[...slug]].js'

function getPathParts(req) {
  const raw = String(req.url || req.originalUrl || '')
  const pathname = raw.split('?')[0]
  const parts = pathname.split('/').filter(Boolean) // ['api','threads',...]
  // drop the leading 'api'
  if (parts.length > 0 && parts[0] === 'api') parts.shift()
  return parts
}

export default function dispatch(req, res) {
  const parts = getPathParts(req)
  // if first segment is 'threads', translate the remaining segments into slug
  if (parts.length > 0 && parts[0] === 'threads') {
    const slugParts = parts.slice(1) // may be [] for /api/threads
    req.query = req.query || {}
    // set undefined for empty to keep existing handler behavior
    req.query.slug = slugParts.length ? slugParts : undefined
    return handler(req, res)
  }

  // default: let the handler attempt to resolve (useful if you add more catch-alls)
  req.query = req.query || {}
  req.query.slug = parts.length ? parts : undefined
  return handler(req, res)
}
