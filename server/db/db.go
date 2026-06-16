package db

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

// DB path constant
// DBFileName is the SQLite database filename.
const DBFileName = "job-tracker.db"

// DB holds the database connection pool.
type DB struct {
	*sql.DB
}

// New opens (or creates) the SQLite database at the given directory
// and runs migrations.
func New(dir string) (*DB, error) {
	dbPath := filepath.Join(dir, DBFileName)

	// Ensure the directory exists
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("create db dir: %w", err)
	}

	sqldb, err := sql.Open("sqlite3", dbPath+"?_journal_mode=WAL&_foreign_keys=on")
	if err != nil {
		return nil, fmt.Errorf("open db: %w", err)
	}

	if err := sqldb.Ping(); err != nil {
		return nil, fmt.Errorf("ping db: %w", err)
	}

	db := &DB{sqldb}
	if err := db.migrate(); err != nil {
		return nil, fmt.Errorf("migrate: %w", err)
	}

	return db, nil
}

// migrate creates tables if they don't exist.
func (db *DB) migrate() error {
	schema := `
	CREATE TABLE IF NOT EXISTS applications (
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		company    TEXT NOT NULL,
		role       TEXT NOT NULL,
		stage      TEXT NOT NULL DEFAULT 'Wishlist',
		location   TEXT NOT NULL DEFAULT '',
		salary     TEXT NOT NULL DEFAULT '',
		applied_on TEXT NOT NULL DEFAULT '',
		next_step  TEXT NOT NULL DEFAULT '',
		resume     TEXT NOT NULL DEFAULT '',
		contact    TEXT NOT NULL DEFAULT '',
		contact_role TEXT NOT NULL DEFAULT '',
		notes      TEXT NOT NULL DEFAULT ''
	);

	CREATE TABLE IF NOT EXISTS follow_ups (
		id             INTEGER PRIMARY KEY AUTOINCREMENT,
		application_id INTEGER NOT NULL,
		title          TEXT NOT NULL,
		due_label      TEXT NOT NULL DEFAULT '',
		status         TEXT NOT NULL DEFAULT 'waiting',
		context        TEXT NOT NULL DEFAULT '',
		FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
	);
	`
	_, err := db.Exec(schema)
	return err
}

// Seed inserts the default mock data if the applications table is empty.
func (db *DB) Seed() error {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM applications").Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		return nil // already seeded
	}

	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	apps := []struct {
		company, role, stage, location, salary, appliedOn, nextStep, resume, contact, contactRole, notes string
	}{
		{"Northstar Labs", "Frontend Engineer", "Interviewing", "Remote · EU", "€70k - €85k", "2026-05-01", "Technical interview on Thursday", "Frontend-focused resume v3", "Mina Shah", "Recruiter", "Strong TypeScript focus and a take-home follow-up already scheduled."},
		{"Orbit Commerce", "Product Engineer", "Applied", "Berlin / Hybrid", "€65k - €78k", "2026-05-04", "Send a portfolio follow-up if no reply by Friday", "Product-generalist resume v2", "Hiring Team", "Careers inbox", "Good fit for cross-functional work, but the process is still early."},
		{"Atlas Health", "UI Platform Developer", "Wishlist", "Remote · UK", "£60k - £72k", "Not applied yet", "Tailor CV for accessibility and design systems work", "Needs a healthcare-focused variant", "Open role", "No contact yet", "Interesting mission-driven team, but application prep is still pending."},
		{"Signal Forge", "Senior React Engineer", "Offer", "Remote · US overlap", "$145k - $160k", "2026-04-18", "Review written offer and compare benefits", "Senior frontend resume v4", "Daniel Kim", "Engineering Manager", "Strong process momentum. Need a compensation comparison before responding."},
		{"Bright Ledger", "Full Stack Engineer", "Closed", "Remote · CET", "€58k - €70k", "2026-04-09", "Archive notes and reuse tailored resume snippets elsewhere", "Full-stack resume v1", "Amelia Ford", "Talent Partner", "Closed after the first screen due to backend depth mismatch."},
	}

	stmt, err := tx.Prepare(`INSERT INTO applications(company, role, stage, location, salary, applied_on, next_step, resume, contact, contact_role, notes) VALUES(?,?,?,?,?,?,?,?,?,?,?)`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, a := range apps {
		if _, err := stmt.Exec(a.company, a.role, a.stage, a.location, a.salary, a.appliedOn, a.nextStep, a.resume, a.contact, a.contactRole, a.notes); err != nil {
			return err
		}
	}

	followups := []struct {
		appID   int
		title, dueLabel, status, context string
	}{
		{1, "Confirm interview availability", "Today · 18:00", "due-today", "Interview coordination"},
		{2, "Nudge with portfolio link", "Friday morning", "this-week", "Portfolio follow-up"},
		{4, "Prepare offer comparison notes", "Waiting on benefits PDF", "waiting", "Offer review"},
		{5, "Archive interview takeaways", "Completed last week", "completed", "Retrospective notes"},
	}

	fstmt, err := tx.Prepare(`INSERT INTO follow_ups(application_id, title, due_label, status, context) VALUES(?,?,?,?,?)`)
	if err != nil {
		return err
	}
	defer fstmt.Close()

	for _, f := range followups {
		if _, err := fstmt.Exec(f.appID, f.title, f.dueLabel, f.status, f.context); err != nil {
			return err
		}
	}

	return tx.Commit()
}