const { networkingApi } = require('./client');

// Ek Ingress rule create karta hai jo subdomain traffic ko sahi Service tak route kare
async function createSandboxIngress(sandboxId) {
  const ingressSpec = {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'Ingress',
    metadata: {
      name: `sandbox-${sandboxId}`,
    },
    spec: {
      ingressClassName: 'nginx',
      rules: [
        {
          // preview subdomain - sandbox ke andar chal rahe vite server ke liye
          host: `${sandboxId}.preview.localhost`,
          http: {
            paths: [
              {
                path: '/',
                pathType: 'Prefix',
                backend: {
                  service: {
                    name: `sandbox-${sandboxId}`,
                    port: { number: 80 }, // service ka preview port
                  },
                },
              },
            ],
          },
        },
        {
          // agent subdomain - comm-agent (terminal) ke liye
          host: `${sandboxId}.agent.localhost`,
          http: {
            paths: [
              {
                path: '/',
                pathType: 'Prefix',
                backend: {
                  service: {
                    name: `sandbox-${sandboxId}`,
                    port: { number: 4000 }, // service ka agent port
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };

  const response = await networkingApi.createNamespacedIngress({
    namespace: 'default',
    body: ingressSpec,
  });
  return response;
}

async function deleteSandboxIngress(sandboxId) {
  await networkingApi.deleteNamespacedIngress({
    name: `sandbox-${sandboxId}`,
    namespace: 'default',
  });
}

module.exports = { createSandboxIngress, deleteSandboxIngress };