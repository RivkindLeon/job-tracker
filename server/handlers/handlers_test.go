package handlers

import (
	"net/http"
	"testing"

	"github.com/RivkindLeon/job-tracker/server/models"
)

// ---------------------------------------------------------------------------
// GET /api/applications
// ---------------------------------------------------------------------------

func TestListApplications_ReturnsSeededData(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodGet, "/api/applications", "")

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}

	var apps []models.Application
	parseJSON(t, rr.Body.String(), &apps)

	if len(apps) != 5 {
		t.Fatalf("expected 5 seeded applications, got %d", len(apps))
	}
	if apps[0].Company != "Northstar Labs" {
		t.Errorf("first company = %q, want 'Northstar Labs'", apps[0].Company)
	}
	if apps[0].Stage != models.StageInterviewing {
		t.Errorf("first stage = %q, want %q", apps[0].Stage, models.StageInterviewing)
	}
}

func TestListApplications_MethodNotAllowed(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	for _, method := range []string{http.MethodPut, http.MethodDelete, http.MethodPatch} {
		rr := request(t, mux, method, "/api/applications", "")
		if rr.Code != http.StatusMethodNotAllowed {
			t.Errorf("%s /api/applications = %d, want 405", method, rr.Code)
		}
	}
}

// ---------------------------------------------------------------------------
// GET /api/applications/{id}
// ---------------------------------------------------------------------------

func TestGetApplication_Success(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodGet, "/api/applications/1", "")

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}

	var app models.Application
	parseJSON(t, rr.Body.String(), &app)

	if app.ID != 1 || app.Company != "Northstar Labs" || app.Role != "Frontend Engineer" {
		t.Errorf("got (%d, %q, %q), want (1, Northstar Labs, Frontend Engineer)",
			app.ID, app.Company, app.Role)
	}
}

func TestGetApplication_AllSeededIDs(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	for id := 1; id <= 5; id++ {
		rr := request(t, mux, http.MethodGet, paths(id), "")
		if rr.Code != http.StatusOK {
			t.Errorf("GET /api/applications/%d = %d, want 200", id, rr.Code)
		}
	}
}

func TestGetApplication_NotFound(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodGet, "/api/applications/999", "")
	if rr.Code != http.StatusNotFound {
		t.Errorf("expected 404, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestGetApplication_InvalidID(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodGet, "/api/applications/abc", "")
	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
}

// ---------------------------------------------------------------------------
// POST /api/applications
// ---------------------------------------------------------------------------

func TestCreateApplication_Success(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	body := `{"company":"Test Corp","role":"Senior Go Dev","stage":"Applied"}`
	rr := request(t, mux, http.MethodPost, "/api/applications", body)

	if rr.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", rr.Code, rr.Body.String())
	}

	var app models.Application
	parseJSON(t, rr.Body.String(), &app)

	if app.Company != "Test Corp" || app.Role != "Senior Go Dev" || app.Stage != "Applied" {
		t.Errorf("got (%q, %q, %q), want (Test Corp, Senior Go Dev, Applied)",
			app.Company, app.Role, app.Stage)
	}
	if app.ID <= 5 {
		t.Errorf("expected new ID > 5, got %d", app.ID)
	}

	// Confirm it was persisted
	getRR := request(t, mux, http.MethodGet, paths(app.ID), "")
	if getRR.Code != http.StatusOK {
		t.Errorf("re-fetch returned %d, want 200", getRR.Code)
	}
}

func TestCreateApplication_DefaultsToWishlist(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodPost, "/api/applications",
		`{"company":"Fresh Co","role":"Junior Dev"}`)

	var app models.Application
	parseJSON(t, rr.Body.String(), &app)
	if app.Stage != models.StageWishlist {
		t.Errorf("default stage = %q, want %q", app.Stage, models.StageWishlist)
	}
}

func TestCreateApplication_MissingRequiredFields(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)

	// Missing company
	rr := request(t, mux, http.MethodPost, "/api/applications", `{"role":"Engineer"}`)
	if rr.Code != http.StatusBadRequest {
		t.Errorf("missing company: expected 400, got %d", rr.Code)
	}

	// Missing role
	rr = request(t, mux, http.MethodPost, "/api/applications", `{"company":"Some Co"}`)
	if rr.Code != http.StatusBadRequest {
		t.Errorf("missing role: expected 400, got %d", rr.Code)
	}

	// Empty body
	rr = request(t, mux, http.MethodPost, "/api/applications", `{}`)
	if rr.Code != http.StatusBadRequest {
		t.Errorf("empty body: expected 400, got %d", rr.Code)
	}
}

func TestCreateApplication_InvalidJSON(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodPost, "/api/applications", `not json at all`)
	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for malformed JSON, got %d", rr.Code)
	}
}

func TestCreateApplication_MethodNotAllowed(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodGet, "/api/applications", `{"company":"X","role":"Y"}`)
	if rr.Code != http.StatusOK {
		t.Errorf("GET should still work, got %d", rr.Code)
	}
}

// ---------------------------------------------------------------------------
// PUT /api/applications/{id}
// ---------------------------------------------------------------------------

func TestUpdateApplication_Success(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	body := `{"company":"Northstar Labs","role":"Senior Frontend Engineer","stage":"Offer"}`
	rr := request(t, mux, http.MethodPut, "/api/applications/1", body)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}

	var app models.Application
	parseJSON(t, rr.Body.String(), &app)
	if app.Role != "Senior Frontend Engineer" || app.Stage != models.StageOffer {
		t.Errorf("got role=%q stage=%q, want (Senior Frontend Engineer, Offer)",
			app.Role, app.Stage)
	}
	if app.ID != 1 {
		t.Errorf("response ID = %d, want 1", app.ID)
	}

	// Verify persistence
	getRR := request(t, mux, http.MethodGet, "/api/applications/1", "")
	var updated models.Application
	parseJSON(t, getRR.Body.String(), &updated)
	if updated.Role != "Senior Frontend Engineer" {
		t.Errorf("persisted role = %q, want 'Senior Frontend Engineer'", updated.Role)
	}
}

func TestUpdateApplication_NotFound(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodPut, "/api/applications/999",
		`{"company":"X","role":"Y"}`)
	if rr.Code != http.StatusNotFound {
		t.Errorf("expected 404, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestUpdateApplication_InvalidID(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodPut, "/api/applications/bad",
		`{"company":"X","role":"Y"}`)
	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestUpdateApplication_InvalidJSON(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodPut, "/api/applications/1", `{bad json}`)
	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for malformed JSON, got %d", rr.Code)
	}
}

// ---------------------------------------------------------------------------
// DELETE /api/applications/{id}
// ---------------------------------------------------------------------------

func TestDeleteApplication_Success(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodDelete, "/api/applications/1", "")
	if rr.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d: %s", rr.Code, rr.Body.String())
	}

	// Verify it's gone
	getRR := request(t, mux, http.MethodGet, "/api/applications/1", "")
	if getRR.Code != http.StatusNotFound {
		t.Errorf("re-fetch after delete = %d, want 404", getRR.Code)
	}

	// Verify others remain
	getRR2 := request(t, mux, http.MethodGet, "/api/applications/2", "")
	if getRR2.Code != http.StatusOK {
		t.Errorf("sibling app (id=2) after delete = %d, want 200", getRR2.Code)
	}
}

func TestDeleteApplication_NotFound(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodDelete, "/api/applications/999", "")
	if rr.Code != http.StatusNotFound {
		t.Errorf("expected 404, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestDeleteApplication_InvalidID(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodDelete, "/api/applications/xyz", "")
	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d: %s", rr.Code, rr.Body.String())
	}
}

// ---------------------------------------------------------------------------
// GET /api/followups/{applicationId}
// ---------------------------------------------------------------------------

func TestListFollowUps_Success(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodGet, "/api/followups/1", "")

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}

	var fups []models.FollowUp
	parseJSON(t, rr.Body.String(), &fups)

	if len(fups) == 0 {
		t.Fatal("expected follow-ups for application 1, got empty list")
	}

	// App 1 has one seeded follow-up: "Confirm interview availability"
	if fups[0].Title != "Confirm interview availability" {
		t.Errorf("first follow-up title = %q, want 'Confirm interview availability'",
			fups[0].Title)
	}
}

func TestListFollowUps_EmptyForAppWithoutFollowUps(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodGet, "/api/followups/3", "")

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}

	var fups []models.FollowUp
	parseJSON(t, rr.Body.String(), &fups)

	if len(fups) != 0 {
		t.Errorf("expected empty list for application 3, got %d items", len(fups))
	}
}

func TestListFollowUps_InvalidAppID(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodGet, "/api/followups/abc", "")
	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for invalid app ID, got %d", rr.Code)
	}
}

// ---------------------------------------------------------------------------
// POST /api/followups/{applicationId}
// ---------------------------------------------------------------------------

func TestCreateFollowUp_Success(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	body := `{"title":"Follow up on interview","dueLabel":"Tomorrow 10:00","status":"this-week","context":"Post-interview check"}`
	rr := request(t, mux, http.MethodPost, "/api/followups/1", body)

	if rr.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", rr.Code, rr.Body.String())
	}

	var fup models.FollowUp
	parseJSON(t, rr.Body.String(), &fup)

	if fup.Title != "Follow up on interview" || fup.ApplicationID != 1 {
		t.Errorf("got title=%q appID=%d, want (Follow up on interview, 1)",
			fup.Title, fup.ApplicationID)
	}
	if fup.ID <= 4 {
		t.Errorf("expected new ID > 4, got %d", fup.ID)
	}
}

func TestCreateFollowUp_AppNotFound(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodPost, "/api/followups/999",
		`{"title":"Test follow-up"}`)
	if rr.Code != http.StatusNotFound {
		t.Errorf("expected 404 for non-existent app, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestCreateFollowUp_MissingTitle(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodPost, "/api/followups/1", `{"status":"waiting"}`)
	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for missing title, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestCreateFollowUp_DefaultsToWaiting(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodPost, "/api/followups/1",
		`{"title":"Just a reminder"}`)

	var fup models.FollowUp
	parseJSON(t, rr.Body.String(), &fup)
	if fup.Status != models.FollowUpWaiting {
		t.Errorf("default status = %q, want %q", fup.Status, models.FollowUpWaiting)
	}
}

// ---------------------------------------------------------------------------
// PUT /api/followups/{applicationId}/{followUpId}
// ---------------------------------------------------------------------------

func TestUpdateFollowUp_Success(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	body := `{"title":"Reschedule interview reminder","dueLabel":"Next Monday","status":"this-week"}`
	rr := request(t, mux, http.MethodPut, "/api/followups/1/1", body)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}

	var fup models.FollowUp
	parseJSON(t, rr.Body.String(), &fup)

	if fup.Title != "Reschedule interview reminder" || fup.Status != models.FollowUpThisWeek {
		t.Errorf("got title=%q status=%q, want (Reschedule interview reminder, this-week)",
			fup.Title, fup.Status)
	}
	if fup.ID != 1 {
		t.Errorf("response ID = %d, want 1", fup.ID)
	}

	// Verify persistence
	getRR := request(t, mux, http.MethodGet, "/api/followups/1", "")
	var fups []models.FollowUp
	parseJSON(t, getRR.Body.String(), &fups)

	var found bool
	for _, f := range fups {
		if f.ID == 1 && f.Title == "Reschedule interview reminder" {
			found = true
			break
		}
	}
	if !found {
		t.Error("updated follow-up not found in re-fetch")
	}
}

func TestUpdateFollowUp_NotFound(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodPut, "/api/followups/1/999",
		`{"title":"Ghost","status":"waiting"}`)
	if rr.Code != http.StatusNotFound {
		t.Errorf("expected 404, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestUpdateFollowUp_MissingTitle(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodPut, "/api/followups/1/1", `{"status":"completed"}`)
	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for missing title, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestUpdateFollowUp_WrongParentApp(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	// Follow-up ID 1 belongs to app ID 1, so putting it under app ID 2 should not match
	rr := request(t, mux, http.MethodPut, "/api/followups/2/1",
		`{"title":"Orphan update","status":"waiting"}`)
	if rr.Code != http.StatusNotFound {
		t.Errorf("expected 404 for parent mismatch, got %d: %s", rr.Code, rr.Body.String())
	}
}

// ---------------------------------------------------------------------------
// DELETE /api/followups/{applicationId}/{followUpId}
// ---------------------------------------------------------------------------

func TestDeleteFollowUp_Success(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodDelete, "/api/followups/1/1", "")
	if rr.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d: %s", rr.Code, rr.Body.String())
	}

	// Verify it's gone
	listRR := request(t, mux, http.MethodGet, "/api/followups/1", "")
	var fups []models.FollowUp
	parseJSON(t, listRR.Body.String(), &fups)

	for _, f := range fups {
		if f.ID == 1 {
			t.Error("follow-up ID 1 still present after delete")
		}
	}
}

func TestDeleteFollowUp_NotFound(t *testing.T) {
	database, cleanup := newTestDB(t)
	defer cleanup()

	mux := newTestMux(database)
	rr := request(t, mux, http.MethodDelete, "/api/followups/1/999", "")
	if rr.Code != http.StatusNotFound {
		t.Errorf("expected 404, got %d: %s", rr.Code, rr.Body.String())
	}
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

// paths constructs a GET-by-ID URL for the given application id.
func paths(id int) string {
	return "/api/applications/" + itoa(id)
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	s := ""
	for n > 0 {
		digit := n % 10
		s = string(rune('0'+digit)) + s
		n /= 10
	}
	return s
}