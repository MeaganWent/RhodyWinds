const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();


const app = express();
const PORT = 3000;

// =======================
// Middleware
// =======================

// Parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from /public folder
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: 'super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set true only if using HTTPS
}));
// =======================
// SQLite Setup (Intentionally Vulnerable)
// =======================

const db = new sqlite3.Database(':memory:');

db.serialize(() => {

    db.run(`
        CREATE TABLE products (
            id INTEGER PRIMARY KEY,
            name TEXT,
            price TEXT
        )
    `);

    db.run(`
        INSERT INTO products (name, price) VALUES
        ('RW-1000 Coastal Turbine', '$1,200,000'),
        ('RW-2000 Offshore Pro', '$2,800,000'),
        ('RW-3000 Industrial Max', '$4,500,000')
    `);

    // Hidden secrets table
    db.run(`
        CREATE TABLE secrets (
            id INTEGER PRIMARY KEY,
            flag TEXT
        )
    `);

    db.run(`
        INSERT INTO secrets (flag)
        VALUES ('CTF{wind_turbine_sql_exploit_2026}')
    `);
});

// =======================
// Mock User Database
// =======================
const users = {
    'admin@example.com': 'password123'
};

// =======================
// CTF Flag
// =======================
const CTF_FLAG = "CTF{n0de_js_w3b_m4st3r_2026}";

// =======================
// Routes
// =======================

// Home Route
app.get('/', (req, res) => {
    if (req.session.loggedIn) {
        return res.send(`
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
    }

    res.sendFile(path.join(__dirname, 'index.html'));
});

// Login Page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Login Handler
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (users[email] && users[email] === password) {
        req.session.loggedIn = true;
        return res.redirect('/');
    }

    res.send('Invalid credentials. <a href="/login">Try again</a>');
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Wallet Page
app.get('/wallet', (req, res) => {
    res.sendFile(path.join(__dirname, 'wallet.html'));
});

// Products Page
app.get('/products', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>RhodyWinds | Industrial Turbine Marketplace</title>
            <style>
                body {
                    font-family: 'Segoe UI', sans-serif;
                    margin: 0;
                    background: linear-gradient(to bottom, #e6f2ff, #ffffff);
                    color: #00334d;
                    text-align: center;
                }
                header {
                    background: #004d7a;
                    color: white;
                    padding: 25px;
                }
                .container {
                    margin-top: 40px;
                }
                input {
                    padding: 12px;
                    width: 300px;
                    border-radius: 25px;
                    border: 2px solid #004d7a;
                    font-size: 16px;
                }
                button {
                    padding: 12px 20px;
                    border-radius: 25px;
                    border: none;
                    background: #2e7d32;
                    color: white;
                    font-weight: bold;
                    cursor: pointer;
                    margin-left: 10px;
                }
                button:hover {
                    background: #1b5e20;
                }
                .fleet {
                    margin-top: 30px;
                }
                .card {
                    background: white;
                    width: 50%;
                    margin: 10px auto;
                    padding: 15px;
                    border-radius: 10px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                .back {
                    display: block;
                    margin-top: 30px;
                    text-decoration: none;
                    color: #004d7a;
                }
                .footer {
                    margin-top: 60px;
                    font-size: 0.8rem;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <header>
                <h1>⚓ RhodyWinds Industrial Turbine Marketplace</h1>
                <p>Engineering the Future of Offshore Wind in the Ocean State</p>
            </header>

            <div class="container">
                <h2>Featured Turbine Fleet</h2>

                <div class="fleet">
                    <div class="card">
                        <strong>RW-1000 Coastal Turbine</strong><br>
                        Ideal for shoreline installations in Narragansett Bay.
                    </div>
                    <div class="card">
                        <strong>RW-2000 Offshore Pro</strong><br>
                        Designed for deep Atlantic offshore deployment.
                    </div>
                    <div class="card">
                        <strong>RW-3000 Industrial Max</strong><br>
                        High-output system for large-scale grid integration.
                    </div>
                </div>

                <h2 style="margin-top:40px;">Search Our Fleet Registry</h2>
                <form method="POST">
                    <input name="search" placeholder="Try: RW-2000 or Offshore" />
                    <button type="submit">Search Fleet</button>
                </form>

                <a href="/" class="back">← Return to Corporate Homepage</a>
            </div>

            <div class="footer">
                &copy; 2026 RhodyWinds LLC | Newport, RI
            </div>
        </body>
        </html>
    `);
});


app.post('/products', (req, res) => {
    const { search } = req.body;

    const query = `
        SELECT id, name, price FROM products
        WHERE name LIKE '%${search}%'
    `;

    db.all(query, (err, rows) => {
        if (err) return res.send("Database error.");

        if (rows.length === 0) {
            return res.send("No turbines found.");
        }

        let output = "<h2>Search Results:</h2><ul>";

        rows.forEach(row => {
            output += `<li>${row.name} - ${row.price}</li>`;
        });

        output += "</ul><a href='/products'>Back</a>";

        res.send(output);
    });
});

// 404 Catch-All
app.use((req, res) => {
    res.status(404).send('404 - Page Not Found');
});

// =======================
// Start Server
// =======================
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});