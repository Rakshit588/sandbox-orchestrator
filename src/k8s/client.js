const k8s = require('@kubernetes/client-node');

// Kubernetes config load kar rahe hain — jaise kubectl karta hai
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

// Alag-alag Kubernetes resources (Pods, Services) manage karne ke liye alag "API" objects milte hain
const coreApi = kc.makeApiClient(k8s.CoreV1Api);
const networkingApi = kc.makeApiClient(k8s.NetworkingV1Api);

module.exports = { coreApi, networkingApi };