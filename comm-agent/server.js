const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PROJECT_ROOT = '/app';

// saari files ki list deta hai (recursively) - node_modules aur .git ko chhod ke
function listFiles(dir, base = '') {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;

    const relativePath = path.join(base, entry.name);
    if (entry.isDirectory()) {
      results.push({ name: entry.name, path: relativePath, type: 'folder' });
      results = results.concat(listFiles(path.join(dir, entry.name), relativePath));
    } else {
      results.push({ name: entry.name, path: relativePath, type: 'file' });
    }
  }
  return results;
}

// GET /files - project ki saari files/folders ki list deta hai
app.get('/files', (req, res) => {
  try {
    const files = listFiles(PROJECT_ROOT);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /file?path=... - ek specific file ka content deta hai
app.get('/file', (req, res) => {
  try {
    const filePath = path.join(PROJECT_ROOT, req.query.path);
    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /file - ek file ka content save karta hai
app.post('/file', (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    const fullPath = path.join(PROJECT_ROOT, filePath);
    fs.writeFileSync(fullPath, content, 'utf-8');
    res.json({ message: 'File saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /file?path=... - ek file ko delete karta hai
app.delete('/file', (req, res) => {
  try {
    const filePath = path.join(PROJECT_ROOT, req.query.path);
    fs.unlinkSync(filePath);
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

const PORT = 4000;

io.on('connection', (socket) => {
  console.log('New terminal connection:', socket.id);

  const shell = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: '/app',
    env: process.env,
  });

  shell.onData((data) => {
    socket.emit('output', data);
  });

  socket.on('input', (data) => {
    shell.write(data);
  });

  socket.on('disconnect', () => {
    console.log('Connection closed:', socket.id);
    shell.kill();
  });
});

server.listen(PORT, () => {
  console.log(`Communication agent running on http://localhost:${PORT}`);
});