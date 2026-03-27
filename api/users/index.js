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
    const hasEmail = typeof body.email === 'string' && String(body.email).trim().length > 0;
    const hasResetToken = typeof body.resetToken === 'string' && String(body.resetToken).trim().length > 0;
    
    // If it's a login request (has identifier and password but no otp), route to login
    if (hasIdentifier && hasPassword && !hasOtp) {
      req.query = {
        ...(req.query || {}),
        action: 'login'
      };
    }
    // If it's a password reset request (email only), route to request-password-reset
    else if (hasEmail && !hasOtp && !hasPassword && !hasResetToken) {
      req.query = {
        ...(req.query || {}),
        action: 'request-password-reset'
      };
    }
    // If it's a password reset verify request (email + otp but no password/resetToken), route to verify-password-reset-otp
    else if (hasEmail && hasOtp && !hasPassword && !hasResetToken) {
      req.query = {
        ...(req.query || {}),
        action: 'verify-password-reset-otp'
      };
    }
    // If it's a reset password request (email + resetToken + password), route to reset-password
    else if (hasEmail && hasResetToken && hasPassword) {
      req.query = {
        ...(req.query || {}),
        action: 'reset-password'
      };
    }
    // Legacy endpoint for signup flow
    else {
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
