const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const authorizedUsers = require('./users'); // We'll create this file later

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    scope: ['profile', 'email']
  },
  (accessToken, refreshToken, profile, done) => {
    // Check if the user's email is in the authorized list
    const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
    if (email && authorizedUsers.includes(email)) {
      return done(null, profile);
    } else {
      return done(null, false, { message: 'User not authorized.' });
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

module.exports = passport;
