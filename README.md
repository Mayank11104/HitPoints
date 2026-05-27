<div align="center">

# 🎯 HitPoints

### A Lightweight Browser-Based API & WebSocket Testing Tool

*Like Postman — but simpler, faster, and with WebSocket testing built-in.*

[![Built with React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Styled with Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Dockerized](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![CI/CD](https://img.shields.io/badge/GitLab_CI-Automated-FC6D26?logo=gitlab&logoColor=white)](https://gitlab.com)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Docker](#docker)
- [Deployment Guide](#deployment-guide)
  - [Architecture](#architecture)
  - [Application Packaging](#application-packaging)
  - [CI/CD Pipeline Design](#cicd-pipeline-design)
  - [Repository Strategy](#repository-strategy)
  - [Runner-to-Application Connectivity](#runner-to-application-connectivity)
  - [Problems Encountered and Fixes](#problems-encountered-and-fixes)
  - [Final Working State](#final-working-state)
  - [Reproducible Deployment Steps](#reproducible-deployment-steps)
  - [Operational Notes](#operational-notes)

---

## Overview

**HitPoints** is a pure-frontend, zero-backend API testing tool that runs entirely in the browser. No database, no login, no server — just a React app that lets developers test REST APIs and WebSocket connections with a premium, Postman-inspired dark UI.

All request history and settings are persisted locally via `localStorage`, making the entire app a single static deployment that can be served from any CDN or container.

---

## Features

### ⚡ REST API Client
- **Method selector** — GET, POST, PUT, DELETE, PATCH with color-coded badges
- **URL bar** with accent glow on focus
- **Headers editor** — dynamic key-value rows with add/remove
- **JSON body editor** — with one-click auto-format button
- **Response panel** — syntax-highlighted JSON with colored keys, strings, numbers, booleans, and nulls
- **Animated stat cards** — Status code (color-coded 2xx/4xx/5xx), response time (ms), response size (bytes) — all with count-up animations
- **Copy response** — one-click clipboard copy
- **CORS proxy support** — toggle a reverse proxy prefix for cross-origin requests

### 🔌 WebSocket Client
- **Connect/Disconnect** toggle with live connection badge
- **Connection states** — Disconnected (gray), Connecting (pulsing amber), Connected (breathing green), Error (shaking red)
- **Message composer** — textarea with JSON validation button (✓/✗ feedback)
- **Real-time message log** — IN messages (emerald, left-aligned), OUT messages (indigo, right-aligned), system events (centered, italic)
- **Live search filter** — filter messages in real-time
- **Auto-scroll toggle** — with manual override

### 📜 Request History
- Last **20 requests** saved in `localStorage`
- One-click **auto-fill** — click any history item to reload the entire form
- **Clear history** button
- Shimmer hover effect on history cards

### 🎨 Design System
- **Postman-inspired dark theme** — `#000000` base, `#E0531F` orange accent
- **13 keyframe animations** — slideIn, fadeIn, pulse, breathe, shake, shimmer, radar ping, ring pulse, etc.
- **Glassmorphism cards** — backdrop blur, subtle borders
- **Custom scrollbars** — thin, minimal, dark-themed
- **Fully responsive** — mobile overlay sidebar, stacked inputs on small screens, desktop split-pane layout
- **WCAG 2.2 AA accessible** — focus-visible rings, aria roles, keyboard navigation, semantic HTML

---

## Tech Stack

| Layer | Technology |
|---|---|
| **UI Framework** | React 19 |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS v4 (`@theme` design tokens) |
| **Icons** | Lucide React |
| **Typography** | Inter + JetBrains Mono (Google Fonts) |
| **Persistence** | localStorage |
| **Container** | Docker (multi-stage: Node 22 Alpine → Nginx Alpine) |
| **Web Server** | Nginx 1.27 (unprivileged) |
| **CI/CD** | GitLab CI |
| **Hosting** | AWS EC2 (Ubuntu) |
| **Registry** | Docker Hub |

---

## Project Structure

```
hitpoints/
├── index.html                    # Entry HTML with Google Fonts + SEO meta
├── Dockerfile                    # Multi-stage production build
├── nginx.conf                    # Production Nginx config
├── .dockerignore                 # Minimal Docker build context
├── .gitlab-ci.yml                # 3-stage CI/CD pipeline
├── package.json
├── vite.config.js
│
├── public/
│   └── logo.svg                  # Custom HitPoints crosshair logo
│
└── src/
    ├── main.jsx                  # React entry point
    ├── index.css                 # Tailwind v4 @theme tokens + keyframes
    ├── App.jsx                   # Root state management
    │
    ├── pages/
    │   └── Home.jsx              # Responsive layout (sidebar + tabs + content)
    │
    ├── components/
    │   ├── Sidebar.jsx           # Logo, history list, CORS proxy settings
    │   ├── RestClient.jsx        # Full REST API testing client
    │   ├── WebSocketClient.jsx   # Full WebSocket testing client
    │   ├── ResponseStats.jsx     # Animated stat cards (Status, Time, Size)
    │   └── CorsToast.jsx         # CORS error notification toast
    │
    ├── hooks/
    │   └── useCountUp.js         # Animated number counting hook (rAF)
    │
    └── utils/
        ├── helpers.js            # JSON syntax highlighting, method config
        └── storage.js            # localStorage read/write wrappers
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Install & Run

```bash
# Clone the repository
git clone https://github.com/your-username/hitpoints.git
cd hitpoints

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Test It

| Type | URL | Expected |
|---|---|---|
| **GET** | `https://jsonplaceholder.typicode.com/posts/1` | JSON post object |
| **POST** | `https://jsonplaceholder.typicode.com/posts` | Created post with ID |
| **WebSocket** | `wss://ws.postman-echo.com/raw` | Echoes back any message |

### Build for Production

```bash
npm run build
# Output → dist/
```

---

## Docker

### Build & Run Locally

```bash
# Build the image
docker build -t hitpoints .

# Run on port 8080
docker run -d -p 8080:8080 --name hitpoints hitpoints

# Open http://localhost:8080
```

### What the Dockerfile Does

| Stage | Base Image | Purpose |
|---|---|---|
| **Builder** | `node:22-alpine` | `npm ci` + `npm run build` → generates `dist/` |
| **Production** | `nginxinc/nginx-unprivileged:1.27-alpine` | Serves static assets via Nginx |

### Production Nginx Features

- **Security headers** — X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- **Gzip compression** — level 6 for all text, JS, CSS, JSON, SVG
- **Smart caching** — hashed Vite assets get `1 year immutable`, `index.html` gets `no-cache`
- **SPA routing** — `try_files` fallback to `index.html`
- **Non-root execution** — runs as user 101
- **Health check** — `wget` probe every 30s

---

## Deployment Guide

### Architecture

The final deployment architecture uses **two EC2 instances** and one container registry:

```
┌──────────────┐       ┌───────────────┐       ┌──────────────┐
│   Developer  │──────▶│    GitLab     │──────▶│  Runner EC2  │
│  (git push)  │       │  (pipeline)   │       │ (shell exec) │
└──────────────┘       └───────────────┘       └──────┬───────┘
                                                      │
                                               docker build
                                               docker push
                                                      │
                                                      ▼
                       ┌───────────────┐       ┌──────────────┐
                       │  Docker Hub   │◀──────│  Push image  │
                       │  (registry)   │       │  (SHA + latest)│
                       └───────┬───────┘       └──────────────┘
                               │
                          docker pull
                               │
                               ▼
                       ┌───────────────┐
                       │   App EC2     │
                       │  (port 80)    │
                       │  hitpoints    │
                       │  container    │
                       └───────────────┘
```

| Component | Role |
|---|---|
| **Runner EC2** | Self-managed GitLab Runner (shell executor). Builds, pushes, and deploys. |
| **Application EC2** | Runs Docker. Hosts the HitPoints container behind Nginx. |
| **Docker Hub** | Stores versioned images tagged with commit SHA and `latest`. |
| **GitLab** | Stores CI/CD pipeline definition. Triggers on pushes to `main`. |

### Deployment Flow

1. Code is pushed to GitLab
2. GitLab triggers the pipeline
3. The self-hosted runner builds the Docker image
4. The image is pushed to Docker Hub (SHA tag + latest tag)
5. The runner connects to the application EC2 via SSH
6. The application EC2 pulls the new image
7. The existing container is stopped and removed
8. A new container starts with port mapping `80:8080` and a health check

---

### Application Packaging

The application uses a **multi-stage Docker build**:

- **Stage 1** — `node:22-alpine` installs dependencies and generates the production build
- **Stage 2** — `nginxinc/nginx-unprivileged:1.27-alpine` serves the static files

> **Note:** The production image was changed from `nginx:1.27-alpine` with a manually created non-root user to the official unprivileged Nginx image, because the original setup caused runtime permission issues with the Nginx PID file.

Nginx is configured to:
- Listen on port **8080**
- Serve the built static frontend
- Apply **security headers** (X-Frame-Options, X-XSS-Protection, nosniff, Referrer-Policy, Permissions-Policy)
- Enable **gzip compression**
- Cache static assets **aggressively** (1 year immutable for hashed files)
- Disable aggressive caching for `index.html`
- Support **SPA routing** with `try_files` fallback

---

### CI/CD Pipeline Design

The `.gitlab-ci.yml` defines three stages:

```yaml
stages:
  - build
  - push
  - deploy
```

#### Stage 1: Build

Runs `docker build --pull` on the self-hosted runner to create two image tags:
- **Commit-specific tag** — `$DOCKER_USERNAME/hitpoints:$CI_COMMIT_SHORT_SHA`
- **Rolling latest tag** — `$DOCKER_USERNAME/hitpoints:latest`

Immutable commit SHA tags provide traceable, auditable deployments.

#### Stage 2: Push

Logs in to Docker Hub using GitLab CI/CD variables and pushes both tags:

| Variable | Value |
|---|---|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub **personal access token** (not account password) |

#### Stage 3: Deploy

SSHs from the runner EC2 into the application EC2 and executes:

1. `docker login` on the application EC2
2. `docker pull` the exact SHA-tagged image
3. `docker stop` and `docker rm` the existing container
4. `docker run -d -p 80:8080 --restart unless-stopped` the new container

> Deploy is restricted to the **`main` branch** only.

---

### Repository Strategy

The project uses **dual remotes** for immediate pipeline triggering:

| Remote | Target | Purpose |
|---|---|---|
| `origin` | GitHub | Primary source repository |
| `gitlab` | GitLab | CI/CD trigger (pushed directly) |

GitLab pull mirroring was abandoned because it updates on a schedule (not instantly), making the pipeline unreliable for immediate deployments. Pushing directly to both remotes solved this.

---

### Runner-to-Application Connectivity

SSH key-based authentication connects the runner to the application EC2:

- **Private key** stored on the runner machine at `/home/gitlab-runner/.ssh/id_ed25519`
- **Public key** added to the application EC2 at `~/.ssh/authorized_keys`

Manual connectivity test before pipeline automation:

```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@<APP_EC2_IP> "whoami && hostname"
```

---

### Problems Encountered and Fixes

#### Problem 1: GitLab pull mirror did not update immediately

GitLab pull mirrors update on a schedule, not instantly after upstream pushes.

**Fix:** Push directly to GitLab from the local machine instead of relying on pull mirroring.

---

#### Problem 2: GitLab Runner could not access Docker

The shell executor ran as `gitlab-runner`, which lacked Docker socket permissions.

**Fix:**
```bash
sudo usermod -aG docker gitlab-runner
sudo systemctl restart docker
sudo systemctl restart gitlab-runner
```

---

#### Problem 3: SSH key not found in the deploy job

`~/.ssh/id_ed25519` resolved to the `gitlab-runner` user's home, not the `ubuntu` user's.

**Fix:** Copy the SSH key into `/home/gitlab-runner/.ssh/` with correct ownership and permissions.

---

#### Problem 4: Container entered a restart loop

```
open() "/run/nginx.pid" failed (13: Permission denied)
```

The standard Nginx image failed when running as a custom non-root user.

**Fix:** Switch to `nginxinc/nginx-unprivileged:1.27-alpine` and align the Dockerfile with non-root execution.

---

#### Problem 5: Container stayed unhealthy

Health check `wget` failed with `Connection refused` when using `localhost`.

**Fix:** Change the health check target from `localhost` to `127.0.0.1:8080` to avoid address resolution issues.

---

### Final Working State

The deployment reached a stable state with:

- ✅ **Healthy** container status
- ✅ Host port **80** mapped to container port **8080**
- ✅ GitLab CI/CD automating the entire delivery flow
- ✅ Docker Hub storing versioned images
- ✅ Runner deploying to a separate EC2 via SSH

```
CONTAINER ID   IMAGE                              STATUS                    PORTS
abc123def456   mayank004/hitpoints:<commit-sha>    Up 5 minutes (healthy)    0.0.0.0:80->8080/tcp
```

---

### Reproducible Deployment Steps

#### 1. Provision Infrastructure

- Create a **Runner EC2** instance
- Create a **Application EC2** instance
- Install **Docker** on both instances
- Register **GitLab Runner** on the runner EC2 using the `shell` executor

#### 2. Configure Runner Permissions

```bash
sudo usermod -aG docker gitlab-runner
sudo systemctl restart docker
sudo systemctl restart gitlab-runner
```

#### 3. Configure SSH Deployment Path

- Place the runner's **public key** in the application EC2 `~/.ssh/authorized_keys`
- Ensure the **private key** is at `/home/gitlab-runner/.ssh/id_ed25519` with correct permissions

#### 4. Set GitLab CI/CD Variables

| Variable | Value |
|---|---|
| `DOCKER_USERNAME` | Your Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub personal access token |

#### 5. Add `.gitlab-ci.yml`

Three-stage pipeline: `build_image` → `push_image` → `deploy_ec2`

#### 6. Build and Deploy

```bash
# Push to GitLab to trigger pipeline
git push gitlab main

# On the application EC2, verify:
docker ps
docker logs hitpoints --tail 50
```

Open the application EC2 public IP in a browser to confirm the service loads.

---

### Operational Notes

- **Commit SHA tagging** is safer than deploying only `latest` because it provides traceable image versions
- **Shell executors** use the runner machine's filesystem directly, so user permissions and SSH key placement matter more than in containerized runners
- **Repository mirroring** is not a reliable immediate trigger mechanism when deployment speed matters
- **Health checks** should be verified manually inside the container before assuming the application is broken

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by [Mayank](https://github.com/Mayank11104)**

</div>
