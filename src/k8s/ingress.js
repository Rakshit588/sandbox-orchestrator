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
        ingressClassName: 'nginx', //konsa Ingress Controller use kare
      rules: [
        {
          // Ye subdomain jo humne Stage 2 me Acrylic DNS se resolve karna set kiya tha
          host: `${sandboxId}.preview.localhost`,
          http: {
            paths: [
              {
                path: '/',
                pathType: 'Prefix',
                backend: {
                  service: {
                    name: `sandbox-${sandboxId}`, // wahi Service jo humne banaya
                    port: { number: 80 },
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

module.exports = { createSandboxIngress };