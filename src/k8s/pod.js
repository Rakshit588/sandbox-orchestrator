const { coreApi } = require('./client');

// Naya sandbox Pod create karta hai, ek unique sandboxId ke saath
async function createSandboxPod(sandboxId) {
  const podSpec = {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: {
      name: `sandbox-${sandboxId}`,
      // Ye label Service ke selector se match karega, isliye zaroori hai
      labels: { app: `sandbox-${sandboxId}` },
    },
    spec: {
      containers: [
        {
          name: 'sandbox-container',
          image: 'nginx:latest', // Abhi placeholder hai, Stage 6 me apni template image se replace karenge
          ports: [{ containerPort: 80 }],
        },
      ],
    },
  };

  const response = await coreApi.createNamespacedPod({
    namespace: 'default',
    body: podSpec,
  });
  return response;
}

// Diye gaye sandboxId ka Pod delete karta hai
async function deleteSandboxPod(sandboxId) {
  await coreApi.deleteNamespacedPod({
    name: `sandbox-${sandboxId}`,
    namespace: 'default',
  });
}

module.exports = { createSandboxPod, deleteSandboxPod };