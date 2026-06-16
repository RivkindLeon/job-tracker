package models

// ApplicationStage represents the stage of a job application.
type ApplicationStage string

const (
	StageWishlist     ApplicationStage = "Wishlist"
	StageApplied      ApplicationStage = "Applied"
	StageInterviewing ApplicationStage = "Interviewing"
	StageOffer        ApplicationStage = "Offer"
	StageClosed       ApplicationStage = "Closed"
)

// Application represents a job application entry.
type Application struct {
	ID         int              `json:"id"`
	Company    string           `json:"company"`
	Role       string           `json:"role"`
	Stage      ApplicationStage `json:"stage"`
	Location   string           `json:"location"`
	Salary     string           `json:"salary"`
	AppliedOn  string           `json:"appliedOn"`
	NextStep   string           `json:"nextStep"`
	Resume     string           `json:"resume"`
	Contact    string           `json:"contact"`
	ContactRole string          `json:"contactRole"`
	Notes      string           `json:"notes"`
}