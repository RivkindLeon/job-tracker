# Job Tracker — Makefile
# Coordinates frontend (React+Vite) and backend (Go+SQLite) development.

.PHONY: all build build-server build-frontend \
        test test-server test-frontend \
        lint vet fmt fmt-check \
        dev dev-server dev-frontend \
        clean help

# ── Default ────────────────────────────────────────────────────────────────
all: vet fmt-check lint test build
	@echo "✅ All checks passed"

# ── Build ──────────────────────────────────────────────────────────────────
build-server:
	cd server && go build -o bin/job-tracker-server .

build-frontend:
	npm run build

build: build-server build-frontend
	@echo "✅ Build complete"

# ── Test ───────────────────────────────────────────────────────────────────
test-server:
	cd server && go test ./... -count=1

test-frontend:
	npm run test:run

test: test-server test-frontend
	@echo "✅ All tests passed"

# ── Lint / Vet / Format ────────────────────────────────────────────────────
lint:
	npm run lint

vet:
	cd server && go vet ./...

fmt:
	cd server && go fmt ./...
	npm run format

fmt-check:
	cd server && gofmt -l . | grep -q . && { echo "❌ Go files not formatted (run 'make fmt')"; exit 1; } || true
	npm run format:check

# ── Run ────────────────────────────────────────────────────────────────────
# Starts the backend server (port 8080 by default, override with PORT=).
dev-server:
	cd server && go run . -port=${PORT}

# Starts the Vite dev server (port 5173 by default).
dev-frontend:
	npm run dev

# Starts both servers in parallel (requires `make` jobserver support).
dev:
	@echo "Starting backend on :${PORT} and frontend on :5173..."
	$(MAKE) dev-server &
	$(MAKE) dev-frontend &
	wait

# ── Clean ──────────────────────────────────────────────────────────────────
clean:
	rm -rf server/bin/
	rm -f server/job-tracker.db
	rm -rf dist/
	rm -rf build/
	rm -rf coverage/
	rm -rf node_modules/.cache/
	@echo "✅ Clean complete"

# ── Help ───────────────────────────────────────────────────────────────────
help:
	@echo "Job Tracker — available targets:"
	@echo ""
	@echo "  all           Run all checks (vet, fmt-check, lint, test, build)"
	@echo "  build         Build server binary + frontend bundle"
	@echo "  test          Run server + frontend tests"
	@echo "  lint          Run ESLint (frontend)"
	@echo "  vet           Run go vet (server)"
	@echo "  fmt           Format Go + frontend code"
	@echo "  fmt-check     Check formatting (Go + frontend)"
	@echo "  dev-server    Start Go backend server (PORT env var, default 8080)"
	@echo "  dev-frontend  Start Vite dev server"
	@echo "  dev           Start both servers in parallel"
	@echo "  clean         Remove build artifacts and databases"
	@echo "  help          Show this message"