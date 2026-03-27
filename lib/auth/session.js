import crypto from 'crypto';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'questlog_session';
const ACCESS_TOKEN_TTL_SECONDS = Number.parseInt(process.env.SESSION_TOKEN_TTL_SECONDS || '', 10) || (60 * 60 * 8);
const PERSISTENT_TOKEN_TTL_SECONDS = Number.parseInt(process.env.SESSION_PERSISTENT_TOKEN_TTL_SECONDS || '', 10) || (60 * 60 * 24 * 30);

function base64UrlEncode(value) {
  const input = typeof value === 'string' ? value : JSON.stringify(value);
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(value) {
  const normalized = String(value || '')
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const pad = normalized.length % 4;
  const padded = pad ? normalized + '='.repeat(4 - pad) : normalized;
  return Buffer.from(padded, 'base64').toString('utf8');
}

function getSecret() {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (secret && String(secret).trim()) return String(secret).trim();
  return 'dev-only-insecure-secret-change-me';
}

function signJwt(payload, expiresInSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(fullPayload);
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(unsignedToken)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${unsignedToken}.${signature}`;
}

function verifyJwt(token) {
  try {
    const [encodedHeader, encodedPayload, signature] = String(token || '').split('.');
    if (!encodedHeader || !encodedPayload || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', getSecret())
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signature !== expectedSignature) return null;

    const payloadRaw = base64UrlDecode(encodedPayload);
    const payload = JSON.parse(payloadRaw);
    if (!payload || typeof payload !== 'object') return null;

    if (typeof payload.exp !== 'number') return null;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) return null;

    return payload;
  } catch {
    return null;
  }
}

function parseCookies(req) {
  const cookieHeader = req?.headers?.cookie;
  const out = {};
  if (!cookieHeader || typeof cookieHeader !== 'string') return out;

  const chunks = cookieHeader.split(';');
  for (const chunk of chunks) {
    const idx = chunk.indexOf('=');
    if (idx === -1) continue;
    const key = chunk.slice(0, idx).trim();
    const value = chunk.slice(idx + 1).trim();
    if (!key) continue;
    out[key] = decodeURIComponent(value);
  }
  return out;
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  }
  if (options.expires) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }

  parts.push(`Path=${options.path || '/'}`);

  if (options.httpOnly !== false) {
    parts.push('HttpOnly');
  }

  const sameSite = options.sameSite || 'Lax';
  parts.push(`SameSite=${sameSite}`);

  if (options.secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function appendSetCookie(res, cookieValue) {
  const prev = res.getHeader('Set-Cookie');
  if (!prev) {
    res.setHeader('Set-Cookie', cookieValue);
    return;
  }

  if (Array.isArray(prev)) {
    res.setHeader('Set-Cookie', [...prev, cookieValue]);
    return;
  }

  res.setHeader('Set-Cookie', [String(prev), cookieValue]);
}

function toAuthUser(user) {
  return {
    _id: String(user._id),
    username: user.username,
    email: user.email,
    role: user.role || 'Member'
  };
}

function createSessionToken(user, keepSignedIn) {
  const authUser = toAuthUser(user);
  const ttl = keepSignedIn ? PERSISTENT_TOKEN_TTL_SECONDS : ACCESS_TOKEN_TTL_SECONDS;
  const token = signJwt(
    {
      sub: authUser._id,
      username: authUser.username,
      email: authUser.email,
      role: authUser.role
    },
    ttl
  );

  return { token, ttl, authUser };
}

export function setSessionCookie(res, user, keepSignedIn = false) {
  const secure = process.env.NODE_ENV === 'production';
  const { token, ttl, authUser } = createSessionToken(user, keepSignedIn);
  const cookie = serializeCookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: 'Lax',
    path: '/',
    maxAge: keepSignedIn ? ttl : undefined
  });
  appendSetCookie(res, cookie);
  return authUser;
}

export function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === 'production';
  const cookie = serializeCookie(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure,
    sameSite: 'Lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0)
  });
  appendSetCookie(res, cookie);
}

export function getSessionUser(req) {
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) return null;

  const payload = verifyJwt(token);
  if (!payload) return null;

  if (!payload.sub || !payload.username || !payload.email) return null;

  return {
    _id: String(payload.sub),
    username: String(payload.username),
    email: String(payload.email),
    role: String(payload.role || 'Member')
  };
}
