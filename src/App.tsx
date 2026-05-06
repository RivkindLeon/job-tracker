import { useMemo, useState } from 'react'
import { applications, followUps, stages, type FollowUpStatus } from './data'
import './App.css'

const followUpLabels: Record<FollowUpStatus, string> = {
  'due-today': 'Due today',
  'this-week': 'This week',
  waiting: 'Waiting',
}

function App() {
  const [selectedApplicationId, setSelectedApplicationId] = useState(applications[0]?.id ?? 0)

  const selectedApplication =
    applications.find((application) => application.id === selectedApplicationId) ?? applications[0]

  const applicationsByStage = useMemo(
    () =>
      stages.map((stage) => ({
        stage,
        items: applications.filter((application) => application.stage === stage),
      })),
    [],
  )

  const selectedFollowUps = followUps.filter(
    (followUp) => followUp.applicationId === selectedApplication.id,
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
          <Metric label="Active applications" value="4" />
          <Metric label="Follow-ups due" value="2" />
          <Metric label="Offers in play" value="1" />
        </div>
      </header>

      <main className="workspace">
        <section className="board-panel">
          <div className="section-heading">
            <div>
              <p className="section-label">Pipeline</p>
              <h2>Application board</h2>
            </div>
            <span className="pill">Mock data shell</span>
          </div>

          <div className="board-grid">
            {applicationsByStage.map((column) => (
              <article key={column.stage} className="stage-column">
                <div className="stage-header">
                  <h3>{column.stage}</h3>
                  <span>{column.items.length}</span>
                </div>
                <div className="stage-cards">
                  {column.items.map((application) => (
                    <button
                      key={application.id}
                      type="button"
                      className={`application-card ${
                        application.id === selectedApplication.id ? 'selected' : ''
                      }`}
                      onClick={() => setSelectedApplicationId(application.id)}
                    >
                      <strong>{application.role}</strong>
                      <span>{application.company}</span>
                      <small>{application.nextStep}</small>
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="detail-panel">
          <div className="section-heading">
            <div>
              <p className="section-label">Selected application</p>
              <h2>{selectedApplication.role}</h2>
            </div>
            <span className="pill muted">{selectedApplication.stage}</span>
          </div>

          <dl className="detail-grid">
            <Detail label="Company" value={selectedApplication.company} />
            <Detail label="Location" value={selectedApplication.location} />
            <Detail label="Compensation" value={selectedApplication.salary} />
            <Detail label="Applied on" value={selectedApplication.appliedOn} />
            <Detail label="Resume used" value={selectedApplication.resume} />
            <Detail
              label="Primary contact"
              value={`${selectedApplication.contact} · ${selectedApplication.contactRole}`}
            />
          </dl>

          <div className="note-card">
            <h3>Next step</h3>
            <p>{selectedApplication.nextStep}</p>
          </div>

          <div className="note-card">
            <h3>Application notes</h3>
            <p>{selectedApplication.notes}</p>
          </div>

          <div className="follow-up-list">
            <div className="follow-up-header">
              <h3>Follow-ups</h3>
              <span>{selectedFollowUps.length}</span>
            </div>

            {selectedFollowUps.length > 0 ? (
              selectedFollowUps.map((followUp) => (
                <div key={followUp.id} className="follow-up-item">
                  <div>
                    <strong>{followUp.title}</strong>
                    <p>{followUp.dueLabel}</p>
                  </div>
                  <span className={`status-chip ${followUp.status}`}>
                    {followUpLabels[followUp.status]}
                  </span>
                </div>
              ))
            ) : (
              <p className="empty-state">No follow-ups logged for this application yet.</p>
            )}
          </div>
        </aside>
      </main>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

export default App
