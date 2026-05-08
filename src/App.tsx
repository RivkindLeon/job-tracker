import { useMemo, useState, type FormEvent } from 'react'
import {
  applications as initialApplications,
  followUps as initialFollowUps,
  stages,
  type Application,
  type ApplicationStage,
  type FollowUp,
  type FollowUpStatus,
} from './data'
import './App.css'

const followUpLabels: Record<FollowUpStatus, string> = {
  'due-today': 'Due today',
  'this-week': 'This week',
  waiting: 'Waiting',
}

type ApplicationFormState = {
  company: string
  role: string
  stage: ApplicationStage
  location: string
  salary: string
  nextStep: string
  contact: string
  contactRole: string
  notes: string
  followUpTitle: string
  followUpDueLabel: string
}

const defaultFormState: ApplicationFormState = {
  company: '',
  role: '',
  stage: 'Applied',
  location: '',
  salary: '',
  nextStep: '',
  contact: '',
  contactRole: '',
  notes: '',
  followUpTitle: '',
  followUpDueLabel: '',
}

function App() {
  const [applicationItems, setApplicationItems] = useState(initialApplications)
  const [followUpItems, setFollowUpItems] = useState(initialFollowUps)
  const [selectedApplicationId, setSelectedApplicationId] = useState(initialApplications[0]?.id ?? 0)
  const [formState, setFormState] = useState(defaultFormState)

  const selectedApplication =
    applicationItems.find((application) => application.id === selectedApplicationId) ??
    applicationItems[0]

  const applicationsByStage = useMemo(
    () =>
      stages.map((stage) => ({
        stage,
        items: applicationItems.filter((application) => application.stage === stage),
      })),
    [applicationItems],
  )

  const selectedFollowUps = followUpItems.filter(
    (followUp) => followUp.applicationId === selectedApplication?.id,
  )

  const heroMetrics = useMemo(() => {
    const activeApplications = applicationItems.filter((application) => application.stage !== 'Closed').length
    const dueFollowUps = followUpItems.filter((followUp) => followUp.status === 'due-today').length
    const offersInPlay = applicationItems.filter((application) => application.stage === 'Offer').length

    return {
      activeApplications,
      dueFollowUps,
      offersInPlay,
    }
  }, [applicationItems, followUpItems])

  const handleFormChange = <Key extends keyof ApplicationFormState>(
    key: Key,
    value: ApplicationFormState[Key],
  ) => {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleCreateApplication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const newApplicationId =
      applicationItems.reduce((maxId, application) => Math.max(maxId, application.id), 0) + 1

    const trimmedFollowUpTitle = formState.followUpTitle.trim()
    const trimmedFollowUpDueLabel = formState.followUpDueLabel.trim()

    const newApplication: Application = {
      id: newApplicationId,
      company: formState.company.trim(),
      role: formState.role.trim(),
      stage: formState.stage,
      location: formState.location.trim() || 'Location to confirm',
      salary: formState.salary.trim() || 'Compensation not captured yet',
      appliedOn: formState.stage === 'Wishlist' ? 'Not applied yet' : new Date().toISOString().slice(0, 10),
      nextStep: formState.nextStep.trim() || 'Define the next step for this opportunity',
      resume: 'Resume to attach',
      contact: formState.contact.trim() || 'Contact to add',
      contactRole: formState.contactRole.trim() || 'Role to confirm',
      notes: formState.notes.trim() || 'No notes added yet.',
    }

    setApplicationItems((current) => [newApplication, ...current])
    setSelectedApplicationId(newApplicationId)

    if (trimmedFollowUpTitle) {
      const newFollowUpId = followUpItems.reduce((maxId, followUp) => Math.max(maxId, followUp.id), 0) + 1
      const newFollowUp: FollowUp = {
        id: newFollowUpId,
        applicationId: newApplicationId,
        title: trimmedFollowUpTitle,
        dueLabel: trimmedFollowUpDueLabel || 'Schedule follow-up date',
        status: 'due-today',
      }

      setFollowUpItems((current) => [newFollowUp, ...current])
    }

    setFormState(defaultFormState)
  }

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

          <form className="application-form" onSubmit={handleCreateApplication}>
            <div className="application-form-heading">
              <div>
                <h3>Add application</h3>
                <p>Capture a new opportunity and attach the first follow-up in one step.</p>
              </div>
              <button type="submit" className="primary-action">
                Save application
              </button>
            </div>

            <div className="application-form-grid">
              <label>
                Company
                <input
                  value={formState.company}
                  onChange={(event) => handleFormChange('company', event.target.value)}
                  placeholder="Northwind Systems"
                  required
                />
              </label>
              <label>
                Role
                <input
                  value={formState.role}
                  onChange={(event) => handleFormChange('role', event.target.value)}
                  placeholder="Frontend Engineer"
                  required
                />
              </label>
              <label>
                Stage
                <select
                  value={formState.stage}
                  onChange={(event) =>
                    handleFormChange('stage', event.target.value as ApplicationStage)
                  }
                >
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Location
                <input
                  value={formState.location}
                  onChange={(event) => handleFormChange('location', event.target.value)}
                  placeholder="Remote · EU"
                />
              </label>
              <label>
                Compensation
                <input
                  value={formState.salary}
                  onChange={(event) => handleFormChange('salary', event.target.value)}
                  placeholder="€70k - €85k"
                />
              </label>
              <label>
                Next step
                <input
                  value={formState.nextStep}
                  onChange={(event) => handleFormChange('nextStep', event.target.value)}
                  placeholder="Send portfolio follow-up"
                />
              </label>
              <label>
                Contact
                <input
                  value={formState.contact}
                  onChange={(event) => handleFormChange('contact', event.target.value)}
                  placeholder="Mina Shah"
                />
              </label>
              <label>
                Contact role
                <input
                  value={formState.contactRole}
                  onChange={(event) => handleFormChange('contactRole', event.target.value)}
                  placeholder="Recruiter"
                />
              </label>
              <label>
                First follow-up
                <input
                  value={formState.followUpTitle}
                  onChange={(event) => handleFormChange('followUpTitle', event.target.value)}
                  placeholder="Share tailored resume"
                />
              </label>
              <label>
                Follow-up timing
                <input
                  value={formState.followUpDueLabel}
                  onChange={(event) => handleFormChange('followUpDueLabel', event.target.value)}
                  placeholder="Tomorrow · 09:00"
                />
              </label>
              <label className="application-form-note">
                Notes
                <textarea
                  value={formState.notes}
                  onChange={(event) => handleFormChange('notes', event.target.value)}
                  placeholder="Why this role matters, prep reminders, or resume tailoring notes"
                  rows={4}
                />
              </label>
            </div>
          </form>

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
                        application.id === selectedApplication?.id ? 'selected' : ''
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
          {selectedApplication ? (
            <>
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
            </>
          ) : (
            <p className="empty-state">Add your first application to start the board.</p>
          )}
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
