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

// Routes
const CTF_FLAG = "CTF{n0de_js_w3b_m4st3r_2026}";

app.get('/', (req, res) => {
    // Check if the session exists and the user is authenticated
    if (req.session.loggedIn) {
        res.send(`
            <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
                <h1>Access Granted</h1>
                <p>Welcome back, Agent. Here is your secret flag:</p>
                <h2 style="color: #d9534f; background: #f9f9f9; display: inline-block; padding: 10px; border: 2px solid #d9534f;">
                    ${CTF_FLAG}
                </h2>
                <br><br>
                <a href="/logout">Secure Logout</a>
            </div>
        `);
    } else {
        // If not logged in, show the standard public home page
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (users[email] && users[email] === password) {
        req.session.loggedIn = true;
        res.redirect('/');
    } else {
        res.send('Invalid credentials. <a href="/login">Try again</a>');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
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