const express = require('express');
const passport = require('passport');

const router = express.Router();

// Initiates the Google OAuth 2.0 authentication flow
router.get('/auth/google',
  passport.authenticate('google'));

// Google OAuth 2.0 callback route
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', failureMessage: true }),
  (req, res) => {
    // Successful authentication, redirect home or to a dashboard.
    // For now, just send a success message.
    res.redirect('/');
  }
);

// A simple logout route
router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// A simple login page route (can be expanded later)
// This is where users are redirected if authentication fails
router.get('/login', (req, res) => {
  // Check for authentication failure messages
  const messages = req.session.messages || [];
  req.session.messages = []; // Clear messages after displaying

  let errorMessage = '';
  if (messages.length > 0) {
    // passport-google-oauth20 sets the message in failureMessage: true
    // The actual message from the strategy (e.g., "User not authorized.") might not be directly available here
    // depending on passport's flash message configuration.
    // For simplicity, we'll show a generic message or the last message.
    errorMessage = messages[messages.length - 1];
    if (typeof errorMessage === 'object' && errorMessage.message) {
        errorMessage = errorMessage.message;
    } else if (typeof errorMessage !== 'string') {
        // Fallback for unexpected message format
        errorMessage = 'Authentication failed. Please ensure your email is authorized.';
    }
  }

  res.send(`
    <h1>Login</h1>
    ${errorMessage ? `<p style="color: red;">${errorMessage}</p>` : ''}
    <a href="/auth/google">Login with Google</a>
  `);
});

module.exports = router;
