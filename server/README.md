# Job Tracker Backend

A Go + SQLite backend for the Job Tracker application.

## Prerequisites

- Go 1.22+
- GCC (required by go-sqlite3 for CGO)
  - macOS: included with Xcode Command Line Tools
  - Ubuntu/Debian: `sudo apt install gcc`
  - Windows: included with MinGW or WSL

## Quick Start

```bash
# From the project root
go run ./server

# Or build and run
go build -o server/bin ./server
./server/bin
```

The server starts on port `8080` by default. Set the `PORT` environment variable to change it.

The database file (`job-tracker.db`) is created in the current working directory.
Set the `DATA_DIR` environment variable to specify a different location.

## API Endpoints

### Applications

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | `/api/applications`         | List all applications    |
| GET    | `/api/applications/{id}`    | Get a single application |
| POST   | `/api/applications`         | Create an application    |
| PUT    | `/api/applications/{id}`    | Update an application    |
| DELETE | `/api/applications/{id}`    | Delete an application    |

### Follow-ups

| Method | Endpoint                                     | Description                                 |
|--------|----------------------------------------------|---------------------------------------------|
| GET    | `/api/followups/{applicationId}`             | List follow-ups for an application          |
| POST   | `/api/followups/{applicationId}`             | Create a follow-up for an application       |
| PUT    | `/api/followups/{applicationId}/{followUpId}`| Update a follow-up                          |
| DELETE | `/api/followups/{applicationId}/{followUpId}`| Delete a follow-up                          |

## Example Usage

```bash
# List all applications
curl http://localhost:8080/api/applications

# Get a specific application
curl http://localhost:8080/api/applications/1

# Create a new application
curl -X POST http://localhost:8080/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Example Corp",
    "role": "Software Engineer",
    "stage": "Applied",
    "location": "Remote",
    "salary": "$100k",
    "appliedOn": "2026-06-15",
    "nextStep": "Wait for response",
    "resume": "General resume v1",
    "contact": "Jane Doe",
    "contactRole": "HR",
    "notes": "Exciting opportunity"
  }'

# Update an application
curl -X PUT http://localhost:8080/api/applications/1 \
  -H "Content-Type: application/json" \
  -d '{"stage": "Interviewing"}'

# Delete an application
curl -X DELETE http://localhost:8080/api/applications/1

# List follow-ups for an application
curl http://localhost:8080/api/followups/1

# Create a follow-up for an application
curl -X POST http://localhost:8080/api/followups/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Send thank-you note",
    "dueLabel": "Tomorrow morning",
    "status": "this-week",
    "context": "Post-interview follow-up"
  }'

# Update a follow-up
curl -X PUT http://localhost:8080/api/followups/1/2 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Send thank-you note",
    "dueLabel": "Completed yesterday",
    "status": "completed",
    "context": "Post-interview follow-up"
  }'

# Delete a follow-up
curl -X DELETE http://localhost:8080/api/followups/1/2
```

## Seed Data

On first run, the server seeds the database with 5 sample applications and 4 sample follow-ups matching the frontend mock data.

## CORS

The server includes a CORS middleware that allows all origins, making it easy to develop against the Vite frontend.