require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const session = require('express-session');
const passport = require('./config/passport'); // Your passport configuration
const authRoutes = require('./routes/auth'); // Your authentication routes
const path = require('path'); // Needed for sending files

const app = express();
const PORT = process.env.PORT || 3000;

const fs = require('fs'); // Required for file system operations

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true, // Save new sessions that haven't been modified (true is okay for now)
  cookie: { secure: false } // For development, set to true if using HTTPS
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session()); // Persistent login sessions

// Mount authentication routes (e.g., /login, /logout, /auth/google)
app.use('/', authRoutes);

// const { isAuthenticated } must be defined before it's used.
const { isAuthenticated } = require('./utils/auth_middleware'); // Import the middleware

// --- HTML File Serving Logic ---
const distDir = path.join(__dirname, 'dist');

// Function to recursively find HTML files
function findHtmlFiles(dir, filelist = []) {
  const files = fs.readdirSync(dir); // Use synchronous version for setup
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findHtmlFiles(filePath, filelist);
    } else if (file.endsWith('.html') && file !== 'login.html') {
      // Store path relative to distDir for routing, and full path for sendFile
      filelist.push({
        routePath: '/' + path.relative(distDir, filePath).replace(/\\/g, '/'), // Ensure forward slashes for routes
        absolutePath: filePath
      });
    }
  });
  return filelist;
}

// Serve login.html without authentication
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(distDir, 'login.html'));
});
// Also handle /login if user directly tries to access it and it's not handled by authRoutes for rendering a page
// This might be redundant if authRoutes's /login already serves login.html or a login form.
// For now, assuming dist/login.html is the target.
app.get('/login', (req, res) => {
    // Check if user is already authenticated, if so, redirect to home
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    // Check for messages from Passport (e.g., authentication failure)
    const messages = req.session.messages || [];
    req.session.messages = [];
    let errorMessage = '';
    if (messages.length > 0) {
        errorMessage = messages[messages.length - 1];
        if (typeof errorMessage === 'object' && errorMessage.message) {
            errorMessage = errorMessage.message;
        } else if (typeof errorMessage !== 'string') {
            errorMessage = 'Authentication failed. Please ensure your email is authorized.';
        }
    }
    // If you want to render dist/login.html instead of the one in authRoutes:
    res.sendFile(path.join(distDir, 'login.html'));
    // Note: If dist/login.html needs to show `errorMessage`, it must have client-side JS to handle it,
    // or this should be a proper template render. The current `routes/auth.js` /login does this with server-sent HTML.
    // For simplicity, we are just sending the static file here.
});


// Find and serve all other HTML files (excluding login.html) with authentication
const htmlFilesToProtect = findHtmlFiles(distDir);
htmlFilesToProtect.forEach(fileInfo => {
  // Special case for index.html to be served from '/'
  if (fileInfo.routePath === '/index.html') {
    app.get('/', isAuthenticated, (req, res) => {
      res.sendFile(fileInfo.absolutePath);
    });
  }
  app.get(fileInfo.routePath, isAuthenticated, (req, res) => {
    res.sendFile(fileInfo.absolutePath);
  });
});

// If index.html was not found (e.g. dist/ is empty or no index.html),
// ensure '/' is still protected and serves index.html (it will fail if file doesn't exist)
// This is a fallback for the main route if not covered by the loop (e.g. if index.html was in htmlFilesToProtect)
if (!htmlFilesToProtect.find(f => f.routePath === '/index.html')) {
    app.get('/', isAuthenticated, (req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
    });
}


// --- Static Assets and Other Routes ---

// Serve other static assets from 'dist' (CSS, JS, images, vendors, etc.)
// This should come AFTER specific HTML routes.
app.use(express.static(distDir));

// Example protected profile route (already exists)
app.get('/profile', isAuthenticated, (req, res) => {
  // If isAuthenticated middleware passes, req.user is guaranteed to be available
  res.send(`
    <h1>Profile</h1>
    <p>This is a protected area.</p>
    <p>User: ${JSON.stringify(req.user, null, 2)}</p>
    <a href="/">Home</a>
  `);
});

// API route for dashboard data, protected
const { getBigQueryClient } = require('./utils/bigquery_client');

app.get('/api/dashboard-data', isAuthenticated, async (req, res) => {
  try {
    // TODO: Implement actual BigQuery query
    // For now, returning placeholder data
    // const bqClient = getBigQueryClient();
    // const [rows] = await bqClient.query({ query: "SELECT * FROM your_table LIMIT 10" });
    const placeholderData = {
      totalUsers: 150,
      salesToday: 2500,
      revenueGrowth: "15%",
      sampleChartData: [10, 41, 35, 51, 49, 62, 69, 91, 148]
    };
    res.json(placeholderData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Ensure your Google OAuth credentials are set up with the following callback URL:');
  console.log(`http://localhost:${PORT}/auth/google/callback`);
});

module.exports = app; // For potential testing or further extension
