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
      // shared volume define kar raha hu - saare containers isse mount karenge
      volumes: [
        { name: 'project-files', emptyDir: {} },
      ],
      containers: [
        {
          name: 'sandbox-container',
          image: 'sandbox-template:latest',
          ports: [{ containerPort: 5173 }],
          volumeMounts: [
            { name: 'project-files', mountPath: '/app' },
          ],
        },
        {
          name: 'comm-agent',
          image: 'sandbox-comm-agent:latest',
          ports: [{ containerPort: 4000 }],
          volumeMounts: [
            { name: 'project-files', mountPath: '/app' },
          ],
        },
        {
          name: 'sync-agent',
          image: 'sandbox-sync-agent:latest',
          volumeMounts: [
            { name: 'project-files', mountPath: '/app' },
          ],
          env: [
            { name: 'SANDBOX_ID', value: sandboxId },
            {
              name: 'AWS_ACCESS_KEY_ID',
              valueFrom: { secretKeyRef: { name: 'aws-credentials', key: 'AWS_ACCESS_KEY_ID' } },
            },
            {
              name: 'AWS_SECRET_ACCESS_KEY',
              valueFrom: { secretKeyRef: { name: 'aws-credentials', key: 'AWS_SECRET_ACCESS_KEY' } },
            },
            { name: 'AWS_REGION', value: 'eu-north-1' },
            { name: 'S3_BUCKET_NAME', value: 'instant-ide-sandbox-oggy2026' },
          ],
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