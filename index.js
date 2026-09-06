const express = require('express');
const cors = require('cors');

const sandboxRoutes = require('./src/routes/sandboxRoutes');

const app = express();
const PORT = 3000;

// CORS enable kar rahe hain saare origins ke liye.
app.use(cors());
app.use(express.json());

// Test route — jab koi browser me localhost:3000 kholega, ye response milega
app.get('/', (req, res) => {
  res.send('Sandbox Orchestrator is running!');
});

// saare /sandboxes wale routes yaha mount ho rahe hain
app.use('/sandboxes', sandboxRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});