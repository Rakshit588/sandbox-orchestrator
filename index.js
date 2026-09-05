const express = require('express');
const cors = require('cors');
const { coreApi } = require('./src/k8s/client');

const app = express();
const PORT = 3000;

// CORS enable kar rahe hain saare origins ke liye.
app.use(cors());
app.use(express.json());

// Test route — jab koi browser me localhost:3000 kholega, ye response milega
app.get('/', (req, res) => {
  res.send('Sandbox Orchestrator is running!');
});

// Test route — Kubernetes cluster se saare nodes ki list mangwa rahe hain
// Isse confirm hoga ki humara backend cluster se sahi se baat kar pa raha hai
app.get('/test-k8s', async (req, res) => {
  try {
    const response = await coreApi.listNode();
    res.json(response.items.map(node => node.metadata.name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});