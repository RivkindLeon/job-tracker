package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

// ---------------------------------------------------------------------------
// corsMiddleware — unit tests for the CORS wrapper
// ---------------------------------------------------------------------------

func TestCORSHeadersPresentOnAllResponses(t *testing.T) {
	tests := []struct {
		name   string
		method string
		path   string
	}{
		{"GET request", http.MethodGet, "/api/applications"},
		{"POST request", http.MethodPost, "/api/applications"},
		{"PUT request", http.MethodPut, "/api/applications/1"},
		{"DELETE request", http.MethodDelete, "/api/applications/1"},
		{"OPTIONS request", http.MethodOptions, "/api/applications"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusOK)
			})

			handler := corsMiddleware(inner)
			req := httptest.NewRequest(tt.method, tt.path, nil)
			rr := httptest.NewRecorder()
			handler.ServeHTTP(rr, req)

			if got := rr.Header().Get("Access-Control-Allow-Origin"); got != "*" {
				t.Errorf("Access-Control-Allow-Origin = %q, want %q", got, "*")
			}

			allowedMethods := rr.Header().Get("Access-Control-Allow-Methods")
			if allowedMethods == "" {
				t.Error("Access-Control-Allow-Methods header is empty")
			}

			allowedHeaders := rr.Header().Get("Access-Control-Allow-Headers")
			if allowedHeaders == "" {
				t.Error("Access-Control-Allow-Headers header is empty")
			}
		})
	}
}

func TestCORSPreflightReturns200WithoutCallingNext(t *testing.T) {
	nextCalled := false

	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		nextCalled = true
		w.WriteHeader(http.StatusOK)
	})

	handler := corsMiddleware(inner)
	req := httptest.NewRequest(http.MethodOptions, "/api/applications", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("OPTIONS = %d, want %d", rr.Code, http.StatusOK)
	}

	if nextCalled {
		t.Error("OPTIONS request should not call the next handler, but it did")
	}
}

func TestCORSPassesThroughNonOptionsRequests(t *testing.T) {
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Custom", "reached")
		w.WriteHeader(http.StatusOK)
	})

	handler := corsMiddleware(inner)

	for _, method := range []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodPatch} {
		t.Run(method, func(t *testing.T) {
			req := httptest.NewRequest(method, "/api/applications", nil)
			rr := httptest.NewRecorder()
			handler.ServeHTTP(rr, req)

			if rr.Code != http.StatusOK {
				t.Errorf("%s = %d, want %d", method, rr.Code, http.StatusOK)
			}

			if rr.Header().Get("X-Custom") != "reached" {
				t.Errorf("%s: next handler was not reached", method)
			}
		})
	}
}

func TestCORSPreflightHeaders(t *testing.T) {
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	handler := corsMiddleware(inner)
	req := httptest.NewRequest(http.MethodOptions, "/api/followups/1", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	// Verify all three CORS headers on the preflight response
	if got := rr.Header().Get("Access-Control-Allow-Origin"); got != "*" {
		t.Errorf("Access-Control-Allow-Origin = %q, want %q", got, "*")
	}
	if got := rr.Header().Get("Access-Control-Allow-Methods"); got != "GET, POST, PUT, DELETE, OPTIONS" {
		t.Errorf("Access-Control-Allow-Methods = %q, want %q", got, "GET, POST, PUT, DELETE, OPTIONS")
	}
	if got := rr.Header().Get("Access-Control-Allow-Headers"); got != "Content-Type, Authorization" {
		t.Errorf("Access-Control-Allow-Headers = %q, want %q", got, "Content-Type, Authorization")
	}
}

func TestCORSPreflightEmptyBody(t *testing.T) {
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("should not be reached"))
	})

	handler := corsMiddleware(inner)
	req := httptest.NewRequest(http.MethodOptions, "/api/applications", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Body.Len() != 0 {
		t.Errorf("OPTIONS response body = %q, want empty", rr.Body.String())
	}
}