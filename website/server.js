const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'users_database.json');

// Helper: Ensure Database Exists
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { users: [] };
  }
}

// Helper: Write Database
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Helper: Hash Password (SHA-256)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'sentinel_salt_2026').digest('hex');
}

// Helper: Generate Initials
function getInitials(name) {
  if (!name) return 'BO';
  return name.trim().split(/\s+/).filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'BO';
}

// Helper: Parse JSON Body
function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', err => reject(err));
  });
}

// Helper: Send JSON Response
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

// Helper: Static File MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.exe': 'application/x-msdownload'
};

// Main HTTP Request Handler
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle CORS Preflight Options Request
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    return res.end();
  }

  // ─── API ENDPOINTS ──────────────────────────────────────────────────────────

  // Download Agent Executable Route
  if (pathname === '/download-agent') {
    const exePath = path.join(__dirname, '..', 'dist', 'AryaShield_Agent.exe');
    if (fs.existsSync(exePath)) {
      res.writeHead(200, {
        'Content-Type': 'application/x-msdownload',
        'Content-Disposition': 'attachment; filename="AryaShield_Agent.exe"'
      });
      return fs.createReadStream(exePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('AryaShield_Agent.exe is currently compiling. Please refresh in a moment.');
    }
  }

  // REST API 1: POST /api/signup
  if (pathname === '/api/signup' && req.method === 'POST') {
    const body = await parseJSONBody(req);
    const { name, email, password, modules } = body;

    if (!email || !password) {
      return sendJSON(res, 400, { success: false, message: 'Email and password are required.' });
    }

    const db = readDB();
    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      return sendJSON(res, 400, { success: false, message: 'An account with this email already exists. Please log in.' });
    }

    const finalName = name?.trim() || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const hashedPassword = hashPassword(password);
    const initials = getInitials(finalName);
    const token = crypto.randomBytes(24).toString('hex');

    const newUser = {
      id: 'user_' + Date.now(),
      name: finalName,
      email: email.toLowerCase(),
      password: hashedPassword,
      initials: initials,
      token: token,
      modules: modules || { system: true, email: true, cloud: true },
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDB(db);

    const { password: _, ...publicUser } = newUser;
    return sendJSON(res, 200, { success: true, message: 'Account created successfully!', user: publicUser });
  }

  // REST API 2: POST /api/login
  if (pathname === '/api/login' && req.method === 'POST') {
    const body = await parseJSONBody(req);
    const { name, email, password } = body;

    if (!email || !password) {
      return sendJSON(res, 400, { success: false, message: 'Email and password are required.' });
    }

    const db = readDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      const finalName = name?.trim() || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const hashedPassword = hashPassword(password);
      const initials = getInitials(finalName);
      const token = crypto.randomBytes(24).toString('hex');

      const createdUser = {
        id: 'user_' + Date.now(),
        name: finalName,
        email: email.toLowerCase(),
        password: hashedPassword,
        initials: initials,
        token: token,
        modules: { system: true, email: true, cloud: true },
        createdAt: new Date().toISOString()
      };

      db.users.push(createdUser);
      writeDB(db);

      const { password: _, ...publicCreated } = createdUser;
      return sendJSON(res, 200, { success: true, message: 'Welcome back!', user: publicCreated });
    }

    if (user.password !== hashPassword(password)) {
      return sendJSON(res, 401, { success: false, message: 'Incorrect password. Please try again.' });
    }

    if (name?.trim() && name.trim() !== user.name) {
      user.name = name.trim();
      user.initials = getInitials(user.name);
      writeDB(db);
    }

    const { password: _, ...publicUser } = user;
    return sendJSON(res, 200, { success: true, message: 'Login successful!', user: publicUser });
  }

  // REST API 3: GET /api/user
  if (pathname === '/api/user' && req.method === 'GET') {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return sendJSON(res, 401, { success: false, message: 'No session token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const db = readDB();
    const user = db.users.find(u => u.token === token);

    if (!user) {
      return sendJSON(res, 404, { success: false, message: 'User session not found.' });
    }

    const { password: _, ...publicUser } = user;
    return sendJSON(res, 200, { success: true, user: publicUser });
  }

  // REST API 4: PUT /api/user/modules
  if (pathname === '/api/user/modules' && (req.method === 'PUT' || req.method === 'POST')) {
    const authHeader = req.headers.authorization;
    const body = await parseJSONBody(req);
    const { modules } = body;

    if (!authHeader) {
      return sendJSON(res, 401, { success: false, message: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const db = readDB();
    const user = db.users.find(u => u.token === token);

    if (!user) {
      return sendJSON(res, 404, { success: false, message: 'User not found.' });
    }

    user.modules = modules;
    writeDB(db);

    const { password: _, ...publicUser } = user;
    return sendJSON(res, 200, { success: true, user: publicUser });
  }

  // REST API 5: GET /api/admin/clients (Admin Portal Endpoint)
  if (pathname === '/api/admin/clients' && req.method === 'GET') {
    const db = readDB();
    const publicClients = db.users.map(({ password, ...u }) => u);
    return sendJSON(res, 200, { success: true, count: publicClients.length, clients: publicClients });
  }

  // ─── STATIC FILE SERVER ─────────────────────────────────────────────────────
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Access Denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

// Start Native HTTP Server
server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` SentinelAI Native Node.js Server Active!`);
  console.log(` Running on: http://localhost:${PORT}`);
  console.log(` Download Agent: http://localhost:${PORT}/download-agent`);
  console.log(`===================================================`);
});
