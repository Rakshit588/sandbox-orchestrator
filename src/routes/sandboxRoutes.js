const express = require('express');
const router = express.Router();

const { createSandboxPod, deleteSandboxPod } = require('../k8s/pod');
const { createSandboxService, deleteSandboxService } = require('../k8s/service');
const { createSandboxIngress, deleteSandboxIngress } = require('../k8s/ingress');

// naya sandbox banata hai - random id generate karke pod, service, aur ingress teeno create karta hai
router.post('/', async (req, res) => {
  try {
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

// sandbox delete karta hai - pod, service, aur ingress teeno hata deta hai
router.delete('/:sandboxId', async (req, res) => {
  try {
    const { sandboxId } = req.params;

    await deleteSandboxPod(sandboxId);
    await deleteSandboxService(sandboxId);
    await deleteSandboxIngress(sandboxId);

    res.json({ message: 'Sandbox deleted!', sandboxId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;