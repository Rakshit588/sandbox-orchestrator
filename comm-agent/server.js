const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const cors = require('cors');

const app = express();
app.use(cors());

// socket.io ko normal express server ke upar chalana padta hai, isliye http server bana raha hu
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }, // abhi ke liye saare origins allow kar raha hu, baad me restrict karunga
});

const PORT = 4000;

// jab koi naya browser connect kare socket.io se
io.on('connection', (socket) => {
  console.log('New terminal connection:', socket.id);

  // ek naya real shell process spawn kar raha hu - windows pe powershell.exe use karunga
  const shell = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env,
  });

  // jab bhi shell se koi output aaye, socket ke through browser ko bhej do
  shell.onData((data) => {
    socket.emit('output', data);
  });

  // jab browser se input aaye, shell ko bhej do
  socket.on('input', (data) => {
    shell.write(data);
  });

  // jab connection close ho, shell process bhi kill kar do (cleanup)
  socket.on('disconnect', () => {
    console.log('Connection closed:', socket.id);
    shell.kill();
  });
});

server.listen(PORT, () => {
  console.log(`Communication agent running on http://localhost:${PORT}`);
});