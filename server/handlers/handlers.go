package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/RivkindLeon/job-tracker/server/db"
	"github.com/RivkindLeon/job-tracker/server/models"
)

// AppHandler handles application-related HTTP requests.
type AppHandler struct {
	db *db.DB
}

// NewAppHandler creates a new AppHandler.
func NewAppHandler(database *db.DB) *AppHandler {
	return &AppHandler{db: database}
}

// ListApplications handles GET /api/applications
func (h *AppHandler) ListApplications(w http.ResponseWriter, r *http.Request) {
	rows, err := h.db.Query(`
		SELECT id, company, role, stage, location, salary, applied_on,
		       next_step, resume, contact, contact_role, notes
		FROM applications
		ORDER BY id
	`)
	if err != nil {
		log.Printf("list applications query: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	apps := make([]models.Application, 0)
	for rows.Next() {
		var a models.Application
		if err := rows.Scan(&a.ID, &a.Company, &a.Role, &a.Stage, &a.Location,
			&a.Salary, &a.AppliedOn, &a.NextStep, &a.Resume, &a.Contact,
			&a.ContactRole, &a.Notes); err != nil {
			log.Printf("scan application: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		apps = append(apps, a)
	}

	writeJSON(w, http.StatusOK, apps)
}

// GetApplication handles GET /api/applications/{id}
func (h *AppHandler) GetApplication(w http.ResponseWriter, r *http.Request) {
	id, err := extractID(r.URL.Path, "/api/applications/")
	if err != nil {
		http.Error(w, "Invalid application ID", http.StatusBadRequest)
		return
	}

	var a models.Application
	err = h.db.QueryRow(`
		SELECT id, company, role, stage, location, salary, applied_on,
		       next_step, resume, contact, contact_role, notes
		FROM applications WHERE id = ?
	`, id).Scan(&a.ID, &a.Company, &a.Role, &a.Stage, &a.Location,
		&a.Salary, &a.AppliedOn, &a.NextStep, &a.Resume, &a.Contact,
		&a.ContactRole, &a.Notes)
	if err == sql.ErrNoRows {
		http.Error(w, "Application not found", http.StatusNotFound)
		return
	}
	if err != nil {
		log.Printf("get application: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, a)
}

// CreateApplication handles POST /api/applications
func (h *AppHandler) CreateApplication(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Company     string `json:"company"`
		Role        string `json:"role"`
		Stage       string `json:"stage"`
		Location    string `json:"location"`
		Salary      string `json:"salary"`
		AppliedOn   string `json:"appliedOn"`
		NextStep    string `json:"nextStep"`
		Resume      string `json:"resume"`
		Contact     string `json:"contact"`
		ContactRole string `json:"contactRole"`
		Notes       string `json:"notes"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}

	if input.Company == "" || input.Role == "" {
		http.Error(w, "company and role are required", http.StatusBadRequest)
		return
	}
	if input.Stage == "" {
		input.Stage = "Wishlist"
	}

	res, err := h.db.Exec(`
		INSERT INTO applications(company, role, stage, location, salary, applied_on,
		                         next_step, resume, contact, contact_role, notes)
		VALUES(?,?,?,?,?,?,?,?,?,?,?)
	`, input.Company, input.Role, input.Stage, input.Location, input.Salary,
		input.AppliedOn, input.NextStep, input.Resume, input.Contact,
		input.ContactRole, input.Notes)
	if err != nil {
		log.Printf("create application: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	newID, _ := res.LastInsertId()

	var a models.Application
	h.db.QueryRow(`
		SELECT id, company, role, stage, location, salary, applied_on,
		       next_step, resume, contact, contact_role, notes
		FROM applications WHERE id = ?
	`, newID).Scan(&a.ID, &a.Company, &a.Role, &a.Stage, &a.Location,
		&a.Salary, &a.AppliedOn, &a.NextStep, &a.Resume, &a.Contact,
		&a.ContactRole, &a.Notes)

	writeJSON(w, http.StatusCreated, a)
}

// UpdateApplication handles PUT /api/applications/{id}
func (h *AppHandler) UpdateApplication(w http.ResponseWriter, r *http.Request) {
	id, err := extractID(r.URL.Path, "/api/applications/")
	if err != nil {
		http.Error(w, "Invalid application ID", http.StatusBadRequest)
		return
	}

	var input struct {
		Company     string `json:"company"`
		Role        string `json:"role"`
		Stage       string `json:"stage"`
		Location    string `json:"location"`
		Salary      string `json:"salary"`
		AppliedOn   string `json:"appliedOn"`
		NextStep    string `json:"nextStep"`
		Resume      string `json:"resume"`
		Contact     string `json:"contact"`
		ContactRole string `json:"contactRole"`
		Notes       string `json:"notes"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}

	res, err := h.db.Exec(`
		UPDATE applications SET company=?, role=?, stage=?, location=?, salary=?,
		       applied_on=?, next_step=?, resume=?, contact=?, contact_role=?, notes=?
		WHERE id=?
	`, input.Company, input.Role, input.Stage, input.Location, input.Salary,
		input.AppliedOn, input.NextStep, input.Resume, input.Contact,
		input.ContactRole, input.Notes, id)
	if err != nil {
		log.Printf("update application: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Application not found", http.StatusNotFound)
		return
	}

	var a models.Application
	h.db.QueryRow(`
		SELECT id, company, role, stage, location, salary, applied_on,
		       next_step, resume, contact, contact_role, notes
		FROM applications WHERE id = ?
	`, id).Scan(&a.ID, &a.Company, &a.Role, &a.Stage, &a.Location,
		&a.Salary, &a.AppliedOn, &a.NextStep, &a.Resume, &a.Contact,
		&a.ContactRole, &a.Notes)

	writeJSON(w, http.StatusOK, a)
}

// DeleteApplication handles DELETE /api/applications/{id}
func (h *AppHandler) DeleteApplication(w http.ResponseWriter, r *http.Request) {
	id, err := extractID(r.URL.Path, "/api/applications/")
	if err != nil {
		http.Error(w, "Invalid application ID", http.StatusBadRequest)
		return
	}

	res, err := h.db.Exec("DELETE FROM applications WHERE id = ?", id)
	if err != nil {
		log.Printf("delete application: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Application not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// FollowUpHandler handles follow-up-related HTTP requests.
type FollowUpHandler struct {
	db *db.DB
}

// NewFollowUpHandler creates a new FollowUpHandler.
func NewFollowUpHandler(database *db.DB) *FollowUpHandler {
	return &FollowUpHandler{db: database}
}

// ListFollowUps handles GET /api/followups/{applicationId}
func (h *FollowUpHandler) ListFollowUps(w http.ResponseWriter, r *http.Request) {
	// Path: /api/followups/{applicationId}
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/followups/"), "/")
	if len(parts) == 0 || parts[0] == "" {
		http.Error(w, "Missing application ID", http.StatusBadRequest)
		return
	}

	appID, err := strconv.Atoi(parts[0])
	if err != nil {
		http.Error(w, "Invalid application ID", http.StatusBadRequest)
		return
	}

	rows, err := h.db.Query(`
		SELECT id, application_id, title, due_label, status, context
		FROM follow_ups
		WHERE application_id = ?
		ORDER BY
			CASE status
				WHEN 'due-today' THEN 0
				WHEN 'this-week' THEN 1
				WHEN 'waiting' THEN 2
				WHEN 'completed' THEN 3
			END,
			id
	`, appID)
	if err != nil {
		log.Printf("list followups query: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	fups := make([]models.FollowUp, 0)
	for rows.Next() {
		var f models.FollowUp
		if err := rows.Scan(&f.ID, &f.ApplicationID, &f.Title, &f.DueLabel,
			&f.Status, &f.Context); err != nil {
			log.Printf("scan followup: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		fups = append(fups, f)
	}

	writeJSON(w, http.StatusOK, fups)
}

// --- helpers ---

func extractID(path, prefix string) (int, error) {
	idStr := strings.TrimPrefix(path, prefix)
	// Remove trailing slash if present
	idStr = strings.TrimRight(idStr, "/")
	// Handle potential sub-paths (e.g., /api/applications/123/followups)
	if idx := strings.Index(idStr, "/"); idx != -1 {
		idStr = idStr[:idx]
	}
	return strconv.Atoi(idStr)
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if data != nil {
		json.NewEncoder(w).Encode(data)
	}
}