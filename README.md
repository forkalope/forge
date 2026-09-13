# Forkalope

Forkalope is an open-source, self-hostable software forge designed around a simple idea: Git collaboration should be able to live on a network of independently operated machines with local disks.

The first version is intentionally a single, boring application:

```text
Browser (React + TypeScript)
          │ HTTP
          ▼
     Go monolith
       ├── PostgreSQL        mutable metadata
       ├── bare Git repos    source control
       └── local blob store  attachments, releases, artifacts
```

The storage boundary is designed for peer replication later. S3/R2 can be added as an optional adapter, but cloud object storage is not a requirement for a normal installation.

## Repository layout

```text
.
├── cmd/forkalope/       Go executable and HTTP server
├── internal/             server-owned packages
│   ├── httpapi/           HTTP handlers and routing
│   └── storage/           local content-addressed blob storage
├── web/                  React + TypeScript application
├── docs/                 architecture notes and decisions
├── migrations/           PostgreSQL migrations
└── Makefile              common development commands
```

## Requirements

- Go 1.23+
- Node.js 20+
- npm 10+
- PostgreSQL 16+ (not required for the initial health-check server)

## Quick start

```bash
make dev
```

In separate terminals, the individual commands are:

```bash
# Terminal 1: Go API
go run ./cmd/forkalope --addr :8080 --data-dir ./.forkalope

# Terminal 2: React development server
cd web
npm install
npm run dev
```

The web app runs at <http://localhost:5173>. The Go API is available at <http://localhost:8080>, including:

- `GET /healthz` — process health
- `GET /api/v1/health` — API health and storage status
- `GET /api/v1/meta` — product and architecture metadata

For a production-style run, build the frontend and start the Go server:

```bash
make build
./bin/forkalope --addr :8080 --data-dir /var/lib/forkalope
```

The server serves `web/dist` when it exists and falls back to the API-only mode when it does not.

## Development principles

- Keep the first deployment as one Go executable.
- Use normal Git repositories and Git tooling; do not invent a new VCS.
- Keep mutable collaborative state in PostgreSQL.
- Store non-Git files by SHA-256 on local disk so replicas can verify transfers.
- Add peer replication only after the local storage boundary is useful on its own.
- Prefer a modular monolith over premature services.

## Current status

This repository contains the initial monorepo foundation: a working Go HTTP server, a React/TypeScript shell, a local content-addressed blob store, and the first architecture notes. Authentication, repositories, issues, pull requests, PostgreSQL persistence, and peer replication are intentionally next steps rather than hidden assumptions in the scaffold.

## License

See [LICENSE](./LICENSE).
