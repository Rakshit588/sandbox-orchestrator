const express = require('express');
const cors = require('cors');
const { coreApi } = require('./src/k8s/client');
// const { createTestPod } = require('./src/k8s/pod');
const { createSandboxPod } = require('./src/k8s/pod');
const { createSandboxService } = require('./src/k8s/service');
const { createSandboxIngress } = require('./src/k8s/ingress');

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

// Test route — ek actual Pod create karega cluster me
// app.post('/create-test-pod', async (req, res) => {
//   try {
//     const result = await createTestPod();
//     res.json({ message: 'Pod created!', podName: result.metadata.name });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

app.post('/sandboxes', async (req, res) => {
  try {
    // Ek random unique ID generate kar rahe hain har sandbox ke liye
    const sandboxId = Math.random().toString(36).substring(2, 8);

    await createSandboxPod(sandboxId);
    await createSandboxService(sandboxId);
    await createSandboxIngress(sandboxId);

    res.json({
      message: 'Sandbox created!',
      sandboxId,
      url: `http://${sandboxId}.preview.localhost`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});