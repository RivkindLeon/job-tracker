package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/RivkindLeon/job-tracker/server/db"
)

// newTestDB creates a temp directory, opens a fresh SQLite database with migrations
// and seed data, and returns the DB handle along with a cleanup function.
func newTestDB(t *testing.T) (*db.DB, func()) {
	t.Helper()

	dir, err := os.MkdirTemp("", "job-tracker-test-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}

	database, err := db.New(dir)
	if err != nil {
		os.RemoveAll(dir)
		t.Fatalf("failed to init test DB: %v", err)
	}

	if err := database.Seed(); err != nil {
		database.Close()
		os.RemoveAll(dir)
		t.Fatalf("failed to seed test DB: %v", err)
	}

	return database, func() {
		database.Close()
		_ = os.RemoveAll(dir)
	}
}

// newTestMux creates an http.Handler that mirrors the route setup in main.go,
// wired to the given database. Callers can use it with httptest.NewRecorder.
func newTestMux(database *db.DB) http.Handler {
	mux := http.NewServeMux()
	appHandler := NewAppHandler(database)
	fupHandler := NewFollowUpHandler(database)

	mux.HandleFunc("/api/applications", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			appHandler.ListApplications(w, r)
		case http.MethodPost:
			appHandler.CreateApplication(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/applications/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			appHandler.GetApplication(w, r)
		case http.MethodPut:
			appHandler.UpdateApplication(w, r)
		case http.MethodDelete:
			appHandler.DeleteApplication(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/followups/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			fupHandler.ListFollowUps(w, r)
		case http.MethodPost:
			fupHandler.CreateFollowUp(w, r)
		case http.MethodPut:
			fupHandler.UpdateFollowUp(w, r)
		case http.MethodDelete:
			fupHandler.DeleteFollowUp(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	return mux
}

// request sends an HTTP request through handler and returns the recorded response.
func request(t *testing.T, handler http.Handler, method, path, body string) *httptest.ResponseRecorder {
	t.Helper()

	var reqBody io.Reader
	if body != "" {
		reqBody = strings.NewReader(body)
	}
	req := httptest.NewRequest(method, path, reqBody)
	if body != "" {
		req.Header.Set("Content-Type", "application/json")
	}
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	return rr
}

// parseJSON unmarshals a JSON string into the provided value.
func parseJSON(t *testing.T, raw string, v any) {
	t.Helper()
	if err := json.Unmarshal([]byte(raw), v); err != nil {
		t.Fatalf("failed to parse JSON: %v\nbody: %s", err, raw)
	}
}

// ---------------------------------------------------------------------------
// Helper-utility tests
// ---------------------------------------------------------------------------

func TestExtractID(t *testing.T) {
	tests := []struct {
		path   string
		prefix string
		wantID int
		wantOK bool
	}{
		{"/api/applications/1", "/api/applications/", 1, true},
		{"/api/applications/42", "/api/applications/", 42, true},
		{"/api/applications/123/followups", "/api/applications/", 123, true},
		{"/api/applications/0", "/api/applications/", 0, true},
		{"/api/applications/abc", "/api/applications/", 0, false},
		{"/api/applications/", "/api/applications/", 0, false},
		{"/api/applications/-1", "/api/applications/", -1, true},
	}

	for _, tt := range tests {
		id, err := extractID(tt.path, tt.prefix)
		gotOK := err == nil
		if gotOK != tt.wantOK || (gotOK && id != tt.wantID) {
			t.Errorf("extractID(%q, %q) = (%d, %v), want (%d, ok=%v)",
				tt.path, tt.prefix, id, err, tt.wantID, tt.wantOK)
		}
	}
}

func TestExtractAppID(t *testing.T) {
	id, err := extractAppID("/api/followups/3")
	if err != nil || id != 3 {
		t.Errorf("extractAppID() = (%d, %v), want (3, nil)", id, err)
	}

	_, err = extractAppID("/api/followups/")
	if err == nil {
		t.Error("extractAppID() should fail on an empty path")
	}
}

func TestExtractFollowUpID(t *testing.T) {
	appID, fupID, err := extractFollowUpID("/api/followups/3/7")
	if err != nil || appID != 3 || fupID != 7 {
		t.Errorf("extractFollowUpID() = (%d, %d, %v), want (3, 7, nil)", appID, fupID, err)
	}

	_, _, err = extractFollowUpID("/api/followups/3")
	if err == nil {
		t.Error("extractFollowUpID() should fail when follow-up ID is missing")
	}
}