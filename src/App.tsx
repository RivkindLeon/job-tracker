import { useMemo } from 'react'
import { stages } from './data'
import { useJobTrackerState } from './hooks/useJobTrackerState'
import { Metric } from './components/Metric'
import { ApplicationForm } from './components/ApplicationForm'
import { ApplicationBoard } from './components/ApplicationBoard'
import { ApplicationDetail } from './components/ApplicationDetail'
import './App.css'

function App() {
  const {
    applicationItems,
    formState,
    isEditingSelectedApplication,
    editingFollowUpId,
    editState,
    followUpEditState,
    followUpFormState,
    followUpFilter,
    selectedApplication,
    selectedFollowUps,
    followUpSummary,
    visibleFollowUps,
    nextOpenFollowUp,
    heroMetrics,
    setSelectedApplicationId,
    handleFormChange,
    handleEditStateChange,
    handleFollowUpEditStateChange,
    handleFollowUpFormStateChange,
    handleCreateApplication,
    handleSaveApplicationEdits,
    handleCancelEdits,
    setIsEditingSelectedApplication,
    handleStartFollowUpEditing,
    handleSaveFollowUpEdits,
    handleCancelFollowUpEdits,
    handleCreateFollowUp,
    handleApplyFollowUpPreset,
    handleRescheduleFollowUp,
    handleToggleFollowUpCompletion,
    setFollowUpFilter,
  } = useJobTrackerState()

  const applicationsByStage = useMemo(
    () =>
      stages.map((stage) => ({
        stage,
        items: applicationItems.filter((app) => app.stage === stage),
      })),
    [applicationItems],
  )

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Job search cockpit</p>
          <h1>Track applications, stages, and follow-ups in one place.</h1>
          <p className="hero-copy">
            This first UI shell focuses on the day-to-day view a job seeker needs: what is active,
            what needs attention, and what context belongs to the selected application.
          </p>
        </div>
        <div className="hero-metrics">
          <Metric label="Active applications" value={heroMetrics.activeApplications.toString()} />
          <Metric label="Follow-ups due" value={heroMetrics.dueFollowUps.toString()} />
          <Metric label="Offers in play" value={heroMetrics.offersInPlay.toString()} />
        </div>
      </header>

      <main className="workspace">
        <section className="board-panel">
          <div className="section-heading">
            <div>
              <p className="section-label">Pipeline</p>
              <h2>Application board</h2>
            </div>
            <span className="pill">Local state flow</span>
          </div>

          <ApplicationForm
            formState={formState}
            stages={stages}
            onFormChange={handleFormChange}
            onSubmit={handleCreateApplication}
          />

          <ApplicationBoard
            applicationsByStage={applicationsByStage}
            selectedApplicationId={selectedApplication?.id}
            onSelectApplication={setSelectedApplicationId}
          />
        </section>

        <aside className="detail-panel">
          {selectedApplication ? (
            <ApplicationDetail
              application={selectedApplication}
              stages={stages}
              isEditing={isEditingSelectedApplication}
              editState={editState}
              followUps={selectedFollowUps}
              visibleFollowUps={visibleFollowUps}
              followUpSummary={followUpSummary}
              followUpFilter={followUpFilter}
              nextOpenFollowUp={nextOpenFollowUp}
              editingFollowUpId={editingFollowUpId}
              followUpEditState={followUpEditState}
              followUpFormState={followUpFormState}
              onStartEdit={() => setIsEditingSelectedApplication(true)}
              onSaveEdit={handleSaveApplicationEdits}
              onCancelEdit={handleCancelEdits}
              onEditStateChange={handleEditStateChange}
              onFollowUpFilterChange={setFollowUpFilter}
              onStartFollowUpEdit={handleStartFollowUpEditing}
              onSaveFollowUpEdit={handleSaveFollowUpEdits}
              onCancelFollowUpEdit={handleCancelFollowUpEdits}
              onFollowUpEditStateChange={handleFollowUpEditStateChange}
              onFollowUpFormStateChange={handleFollowUpFormStateChange}
              onCreateFollowUp={handleCreateFollowUp}
              onApplyFollowUpPreset={handleApplyFollowUpPreset}
              onRescheduleFollowUp={handleRescheduleFollowUp}
              onToggleFollowUpCompletion={handleToggleFollowUpCompletion}
            />
          ) : (
            <p className="empty-state">Add your first application to start the board.</p>
          )}
        </aside>
      </main>
    </div>
  )
}

export default App
