const { coreApi } = require('./client');

// naya sandbox pod create kar raha hu - teen containers saath chalte hain isme
async function createSandboxPod(sandboxId) {
  const podSpec = {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: {
      name: `sandbox-${sandboxId}`,
      labels: { app: `sandbox-${sandboxId}` },
    },
    spec: {
      containers: [
        {
          name: 'sandbox-container',
          image: 'sandbox-template:latest',
          ports: [{ containerPort: 5173 }],
        },
        {
          name: 'comm-agent',
          image: 'sandbox-comm-agent:latest',
          ports: [{ containerPort: 4000 }],
        },
        {
          name: 'sync-agent',
          image: 'sandbox-sync-agent:latest',
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

async function deleteSandboxPod(sandboxId) {
  await coreApi.deleteNamespacedPod({
    name: `sandbox-${sandboxId}`,
    namespace: 'default',
  });
}

module.exports = { createSandboxPod, deleteSandboxPod };