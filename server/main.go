package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/RivkindLeon/job-tracker/server/db"
	"github.com/RivkindLeon/job-tracker/server/handlers"
)

func main() {
	// Database directory: use DATA_DIR env var or default to server directory
	dataDir := os.Getenv("DATA_DIR")
	if dataDir == "" {
		// Default: the directory where the binary is running
		exe, err := os.Executable()
		if err == nil {
			dataDir = filepath.Dir(exe)
		} else {
			dataDir = "."
		}
	}

	database, err := db.New(dataDir)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.Close()

	// Seed mock data
	if err := database.Seed(); err != nil {
		log.Printf("Warning: seed failed (data may already exist): %v", err)
	}

	appHandler := handlers.NewAppHandler(database)
	followUpHandler := handlers.NewFollowUpHandler(database)

	mux := http.NewServeMux()

	// Application routes
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

	// Follow-up routes
	mux.HandleFunc("/api/followups/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			followUpHandler.ListFollowUps(w, r)
		case http.MethodPost:
			followUpHandler.CreateFollowUp(w, r)
		case http.MethodPut:
			followUpHandler.UpdateFollowUp(w, r)
		case http.MethodDelete:
			followUpHandler.DeleteFollowUp(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// CORS middleware wrapper
	handler := corsMiddleware(mux)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Job Tracker API server starting on :%s", port)
	log.Printf("Database: %s/%s", dataDir, db.DBFileName)

	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

// corsMiddleware adds CORS headers for frontend development.
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}