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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// 1. The Admin Login Route (Phase 1)
app.get('/control', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin_login.html'));
});

// 2. Handle Phase 1: User/Pass Login
app.post('/admin-login-phase1', (req, res) => {
    const { username, password } = req.body;
    // Phase 1 Credentials
    if (username === 'block_island_wind' && password === 'riwind26') {
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

// --- ADD THE HARDER CHALLENGE HERE ---
app.all('/system-diagnostics', (req, res) => {
    const method = req.method;
    const bypassHeader = req.get('X-Maintenance-Bypass');

    // 1. Block the standard POST request from the index page
    if (method === 'POST') {
        res.set('X-Hint', 'Industrial protocols require GET for diagnostic readouts.');
        return res.status(405).send('<h1>405 Method Not Allowed</h1><p>Check system headers for instructions.</p>');
    }

    // 2. Check if they switched to GET but forgot the header
    if (method === 'GET' && bypassHeader !== 'true') {
        return res.status(401).send('<h1>401 Unauthorized</h1><p>Missing "X-Maintenance-Bypass" authorization header.</p>');
    }

    // 3. Success condition
    if (method === 'GET' && bypassHeader === 'true') {
        return res.send("ACCESS GRANTED: CTF{RHODY_WIND_HEADER_HUNTER_2026}");
    }
});


app.listen(3000, () => console.log('Server running at http://localhost:3000'));