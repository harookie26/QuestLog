import actionHandler from './[action].js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    let body = {};
    try {
      body = req.body || {};
    } catch {
      body = {};
    }
    const hasOtp = typeof body.otp === 'string' && String(body.otp).trim().length > 0;
    const hasPassword = typeof body.password === 'string' && String(body.password).trim().length > 0;
    const hasIdentifier = typeof body.identifier === 'string' && String(body.identifier).trim().length > 0;
    
    // If it's a login request (has identifier and password but no otp), don't intercept
    if (hasIdentifier && hasPassword && !hasOtp) {
      req.query = {
        ...(req.query || {}),
        action: 'login'
      };
    } else {
      // Legacy endpoint for signup flow
      const action = hasOtp && !hasPassword ? 'verify-otp' : 'send-otp';
      req.query = {
        ...(req.query || {}),
        action
      };
      res.setHeader('X-Deprecated-Endpoint', 'Use /api/users/send-otp and /api/users/verify-otp');
    }
  }

  return actionHandler(req, res);
}
