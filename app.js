const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'super-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Mock User Database
const users = { 'admin@example.com': 'password123' };


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// 1. The Admin Login Route (Phase 1)
app.get('/control-room-hidden-alpha', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin_login.html'));
});

// 2. Handle Phase 1: User/Pass Login
app.post('/admin-login-phase1', (req, res) => {
    const { username, password } = req.body;
    // Phase 1 Credentials
    if (username === 'admin_root' && password === 'block_island_wind') {
        req.session.adminAuthenticated = true; 
        res.redirect('/admin-access-key'); // Send them to the second gate
    } else {
        res.status(403).send('Invalid Admin Credentials.');
    }
});

// 3. The Access Key Page (Phase 2)
app.get('/admin-access-key', (req, res) => {
    if (req.session.adminAuthenticated) {
        res.sendFile(path.join(__dirname, 'access_key.html'));
    } else {
        res.redirect('/control-room-hidden-alpha');
    }
});

// 4. Handle Phase 2: The Secret Key
app.post('/verify-key', (req, res) => {
    if (!req.session.adminAuthenticated) return res.redirect('/control-room-hidden-alpha');

    const { access_key } = req.body;
    if (access_key === 'RI-GRID-9901') {
        req.session.isAdmin = true; // Final clearance granted
        res.redirect('/admin-panel');
    } else {
        res.send('INVALID KEY. Access Logged. <a href="/admin-access-key">Try again</a>');
    }
});

// 5. The actual page that holds the flag
app.get('/admin-panel', (req, res) => {
    if (req.session.isAdmin) {
        res.sendFile(path.join(__dirname, 'admin.html'));
    } else {
        res.status(403).send('Access Forbidden: Level 5 Admin Clearance Required.');
    }
});


app.listen(3000, () => console.log('Server running at http://localhost:3000'));