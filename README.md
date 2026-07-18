# Job Tracker

A public project for exploring a product that helps job seekers, especially software developers, track applications, resumes, stages, interviews, companies, contacts, and follow-ups.

## Who it is for
- job seekers
- software developers looking for a more structured job search workflow

## Problem
Job searching often becomes fragmented across spreadsheets, email threads, CV versions, interview stages, and follow-up reminders.

## Current status
React + TypeScript + Vite frontend with a Go + SQLite backend. Applications and follow-ups are managed through a REST API with local persistence.

## Local development

### Prerequisites
- [Node.js](https://nodejs.org/) 22+
- [Go](https://go.dev/) 1.22+
- `make` (available by default on macOS and most Linux distributions)

### Setup
```bash
npm install
```

### Common commands
Run `make` (or `make help`) to see all available targets:

```
make          Run all checks (vet, fmt-check, lint, test, build)
make build    Build server binary + frontend bundle
make test     Run server + frontend tests
make lint     Run ESLint (frontend)
make vet      Run go vet (server)
make fmt      Format Go + frontend code
make dev      Start both servers in parallel
make clean    Remove build artifacts and databases
```

Full-stack development:
```bash
make dev
# Backend → http://localhost:8080
# Frontend → http://localhost:5173
```

### Manual targets (without make)
```bash
npm run dev        # Vite dev server (frontend only)
cd server && go run .  # Go backend server
```

## Validation
- `make vet` — Go code analysis
- `make fmt-check` — formatting (Go + Prettier)
- `make lint` — TypeScript/React code style
- `make test` — all server + frontend tests
- `make build` — production builds for both
- All validation runs in CI on every pull request and push to `main`

## Repository visibility
This repository is public.

## Current documents
- `docs/idea.md` - short product framing
- `docs/product-brief.md` - users, problems, v0 outcome, entities, and flow
- `docs/roadmap.md` - phase-based next steps
- `docs/scope.md` - current boundaries

## Repository visibility
This repository is public.

## Current documents
- `docs/idea.md` - short product framing
- `docs/product-brief.md` - users, problems, v0 outcome, entities, and flow
- `docs/roadmap.md` - phase-based next steps
- `docs/scope.md` - current boundaries
