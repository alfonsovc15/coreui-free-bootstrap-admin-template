// Middleware to check if a user is authenticated and authorized

/**
 * Checks if the user is authenticated.
 * This middleware assumes that the authentication strategy (e.g., Google OAuth callback)
 * has already verified if the user is authorized (e.g., by checking against a list of allowed emails).
 *
 * If authentication is successful, `req.user` will be populated by Passport.
 * If not, the user is redirected to the login page.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user) {
    // User is authenticated and req.user is present
    return next();
  }
  // User is not authenticated, redirect to login page
  // Optionally, you could store the intended URL in the session to redirect back after login
  // req.session.returnTo = req.originalUrl;
  res.redirect('/login');
}

module.exports = { isAuthenticated };
