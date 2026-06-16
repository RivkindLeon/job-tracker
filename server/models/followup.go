package models

// FollowUpStatus represents the status of a follow-up task.
type FollowUpStatus string

const (
	FollowUpDueToday  FollowUpStatus = "due-today"
	FollowUpThisWeek  FollowUpStatus = "this-week"
	FollowUpWaiting   FollowUpStatus = "waiting"
	FollowUpCompleted FollowUpStatus = "completed"
)

// FollowUp represents a follow-up task associated with a job application.
type FollowUp struct {
	ID            int            `json:"id"`
	ApplicationID int            `json:"applicationId"`
	Title         string         `json:"title"`
	DueLabel      string         `json:"dueLabel"`
	Status        FollowUpStatus `json:"status"`
	Context       string         `json:"context"`
}