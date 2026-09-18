# ⚡ Instant IDE

A Kubernetes-based sandbox orchestration system — a self-hosted, simplified analogue of platforms like CodeSandbox or StackBlitz. Create isolated, browser-accessible development environments on demand, complete with a live code editor, terminal, live preview, and automatic cloud backup.

## What it does

Click "Create Sandbox" and the system:
1. Dynamically provisions a Kubernetes Pod containing a live Vite + React dev server, a terminal agent, and a file-sync agent
2. Exposes it at a unique subdomain via Nginx Ingress
3. Gives you a full in-browser IDE experience — edit code (Monaco Editor), see live preview, use a real terminal, and have every change automatically backed up to AWS S3

Sandboxes can also be **restored** from their S3 backup into a fresh Pod, and multiple sandboxes can run concurrently, managed via tabs.

## Architecture
Browser (React frontend)
│
├── Orchestrator API (Express + @kubernetes/client-node)
│ └── creates/deletes Pod + Service + Ingress per sandbox
│
└── Per-sandbox Pod (3 containers, sharing one Kubernetes Volume at /app):
├── sandbox-container → Vite dev server (the live app)
├── comm-agent → terminal (Socket.IO + node-pty) + file read/write/list APIs
└── sync-agent → watches /app (chokidar), uploads changes to S3


Routing: Nginx Ingress Controller maps `<id>.preview.localhost` → the dev server, and `<id>.agent.localhost` → the terminal/file API.

## Tech Stack

- **Containers & Orchestration:** Docker, Kubernetes (via Docker Desktop), Nginx Ingress Controller
- **Backend:** Node.js, Express, `@kubernetes/client-node`
- **Real-time:** Socket.IO, node-pty (terminal), Chokidar (file watching)
- **Cloud Storage:** AWS S3, AWS IAM, Kubernetes Secrets
- **Frontend:** React, Vite, Monaco Editor, xterm.js
- **Local Networking:** Acrylic DNS Proxy (wildcard `*.localhost` resolution)

## Project Structure
sandbox-orchestrator/
├── index.js, src/ # Orchestrator API
├── template/ # Default Vite+React project loaded into every sandbox
├── comm-agent/ # Terminal + file API service
├── sync-agent/ # File watcher + S3 sync service
└── frontend/ # The control panel UI


## Setup

Requires: Docker Desktop with Kubernetes enabled, Node.js 20+, an AWS account with an S3 bucket, and local wildcard DNS resolution for `*.localhost` (see project report for full setup steps — this involves installing the Nginx Ingress Controller, creating an `aws-credentials` Kubernetes Secret, and building the three Docker images used by each sandbox container).

```bash
# Orchestrator
npm install && npm run dev

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

## Known Limitations

- No custom RBAC (Role-Based Access Control) — uses the default Kubernetes service account
- The `POST /sandboxes` endpoint has no authentication — fine for local single-user development, would need protection before exposing publicly

## Team

Built as a B.Tech final-year college major project.