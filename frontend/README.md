# Instant IDE — Frontend

This is the **control panel** for Instant IDE, a Kubernetes-based sandbox orchestration system. It's a React (Vite) application that lets users create, manage, and interact with isolated, containerized development environments ("sandboxes") running on a local Kubernetes cluster.

## What it does

- **Create/Restore Sandboxes** — spin up a new isolated dev environment, or restore a previous one from its S3 backup
- **Multi-Sandbox Tabs** — manage several active sandboxes at once, switch between them
- **Live Preview** — see the sandbox's running Vite dev server in an embedded iframe
- **Code Editor** — a full in-browser code editor (Monaco, the engine behind VS Code) to read, edit, create, and delete files inside the sandbox
- **Terminal** — a real, interactive terminal (via xterm.js + Socket.IO) connected to a live shell running inside the sandbox, with copy-paste support

## How it connects to the rest of the system

This frontend talks to two backend services:
- The **Orchestrator API** (`sandbox-orchestrator` root project) — for creating, deleting, restoring, and checking the status of sandboxes
- Each sandbox's own **Communication Agent** — for file operations and terminal access, reached via a per-sandbox subdomain (`<sandboxId>.agent.localhost`)

## Running locally

```bash
npm install
npm run dev
```

Requires the Orchestrator backend, a local Kubernetes cluster (with the Nginx Ingress Controller and `aws-credentials` secret set up), and local wildcard DNS resolution (`*.localhost`) to be running — see the main project README for full setup.