import actionHandler from './[action].js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const rawAction = Array.isArray(req?.query?.action) ? req.query.action[0] : req?.query?.action;
    const explicitAction = String(rawAction || '').trim();
    const allowedExplicitActions = new Set([
      'login',
      'signup',
      'request-password-reset',
      'reset-password',
      'logout'
    ]);

    // If route already resolved an explicit action (e.g. /api/users/signup), honor it.
    if (allowedExplicitActions.has(explicitAction)) {
      req.query = {
        ...(req.query || {}),
        action: explicitAction
      };
      return actionHandler(req, res);
    }

    let body = {};
    try {
      body = req.body || {};
    } catch {
      body = {};
    }
    const hasUsername = typeof body.username === 'string' && String(body.username).trim().length > 0;
    const hasPassword = typeof body.password === 'string' && String(body.password).trim().length > 0;
    const hasIdentifier = typeof body.identifier === 'string' && String(body.identifier).trim().length > 0;
    const hasEmail = typeof body.email === 'string' && String(body.email).trim().length > 0;
    const hasResetToken = typeof body.resetToken === 'string' && String(body.resetToken).trim().length > 0;
    const hasNewPassword = typeof body.newPassword === 'string' && String(body.newPassword).trim().length > 0;
    const hasConfirmPassword = typeof body.confirmPassword === 'string' && String(body.confirmPassword).trim().length > 0;
    
    // If it's a login request (has identifier and password), route to login.
    if (hasIdentifier && hasPassword) {
      req.query = {
        ...(req.query || {}),
        action: 'login'
      };
    }
    // If it's a signup request, route to signup.
    else if (hasUsername && hasEmail && hasPassword) {
      req.query = {
        ...(req.query || {}),
        action: 'signup'
      };
    }
    // If it's a password reset request (email only), route to request-password-reset.
    else if (hasEmail && !hasPassword && !hasResetToken && !hasNewPassword && !hasConfirmPassword) {
      req.query = {
        ...(req.query || {}),
        action: 'request-password-reset'
      };
    }
    // If it's a reset password request (email + resetToken + newPassword + confirmPassword), route to reset-password.
    else if (hasEmail && hasResetToken && hasNewPassword && hasConfirmPassword) {
      req.query = {
        ...(req.query || {}),
        action: 'reset-password'
      };
    }
    // Default to signup for unmatched user payloads.
    else {
      req.query = {
        ...(req.query || {}),
        action: 'signup'
      };
    }
  }

  if (req.method === 'GET') {
    const rawAction = Array.isArray(req?.query?.action) ? req.query.action[0] : req?.query?.action;
    const explicitAction = String(rawAction || '').trim();
    if (explicitAction === 'me') {
      req.query = {
        ...(req.query || {}),
        action: 'me'
      };
    }
  }

  return actionHandler(req, res);
}
