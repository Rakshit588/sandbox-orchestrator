const { coreApi } = require('./client');

// naya sandbox pod create kar raha hu - teen containers saath chalte hain isme
// restoreFrom (optional) - agar diya hai, to sync-agent us purane sandbox ki files S3 se restore karega
async function createSandboxPod(sandboxId, restoreFrom = null) {
  const syncAgentEnv = [
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
  ];

  // agar restoreFrom diya hai, to ek extra env variable add kar raha hu
  if (restoreFrom) {
    syncAgentEnv.push({ name: 'RESTORE_FROM', value: restoreFrom });
  }

  const podSpec = {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: {
      name: `sandbox-${sandboxId}`,
      labels: { app: `sandbox-${sandboxId}` },
    },
    spec: {
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
          env: syncAgentEnv,
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