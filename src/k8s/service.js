const { coreApi } = require('./client');

// Ek Service create karta hai jo diye gaye Pod tak traffic route karega
async function createSandboxService(sandboxId) {
  const serviceSpec = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: `sandbox-${sandboxId}`,
    },
    spec: {
      // Selector — ye batata hai "kaunse Pods ko target karna hai"
      // Jo bhi Pod ka label 'app: sandbox-<id>' hoga, wahi is Service ke through accessible hoga
      selector: { app: `sandbox-${sandboxId}` },
      ports: [{ port: 80, targetPort: 80 }], // 5173 = Vite ka default dev server port
    },
  };

  const response = await coreApi.createNamespacedService({
    namespace: 'default',
    body: serviceSpec,
  });
  return response;
}

async function deleteSandboxService(sandboxId) {
  await coreApi.deleteNamespacedService({
    name: `sandbox-${sandboxId}`,
    namespace: 'default',
  });
}

module.exports = { createSandboxService, deleteSandboxService };