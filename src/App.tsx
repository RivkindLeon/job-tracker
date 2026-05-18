import { useEffect, useMemo, useState, type FormEvent } from 'react'
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
  completed: 'Completed',
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

type ApplicationEditState = {
  company: string
  role: string
  stage: ApplicationStage
  location: string
  salary: string
  nextStep: string
  contact: string
  contactRole: string
  notes: string
}

type FollowUpEditState = {
  title: string
  dueLabel: string
  status: FollowUpStatus
}

type FollowUpFormState = {
  title: string
  dueLabel: string
  status: Exclude<FollowUpStatus, 'completed'>
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

function getEditStateFromApplication(application: Application): ApplicationEditState {
  return {
    company: application.company,
    role: application.role,
    stage: application.stage,
    location: application.location,
    salary: application.salary,
    nextStep: application.nextStep,
    contact: application.contact,
    contactRole: application.contactRole,
    notes: application.notes,
  }
}

function App() {
  const [applicationItems, setApplicationItems] = useState(initialApplications)
  const [followUpItems, setFollowUpItems] = useState(initialFollowUps)
  const [selectedApplicationId, setSelectedApplicationId] = useState(initialApplications[0]?.id ?? 0)
  const [formState, setFormState] = useState(defaultFormState)
  const [isEditingSelectedApplication, setIsEditingSelectedApplication] = useState(false)
  const [editingFollowUpId, setEditingFollowUpId] = useState<number | null>(null)
  const [editState, setEditState] = useState<ApplicationEditState>(() =>
    initialApplications[0] ? getEditStateFromApplication(initialApplications[0]) : getEmptyEditState(),
  )
  const [followUpEditState, setFollowUpEditState] = useState<FollowUpEditState>(getEmptyFollowUpEditState)
  const [followUpFormState, setFollowUpFormState] = useState<FollowUpFormState>(getEmptyFollowUpFormState)

  const selectedApplication =
    applicationItems.find((application) => application.id === selectedApplicationId) ??
    applicationItems[0]

  useEffect(() => {
    if (!selectedApplication) {
      setIsEditingSelectedApplication(false)
      setEditingFollowUpId(null)
      setEditState(getEmptyEditState())
      setFollowUpEditState(getEmptyFollowUpEditState())
      setFollowUpFormState(getEmptyFollowUpFormState())
      return
    }

    setIsEditingSelectedApplication(false)
    setEditingFollowUpId(null)
    setEditState(getEditStateFromApplication(selectedApplication))
    setFollowUpEditState(getEmptyFollowUpEditState())
    setFollowUpFormState(getEmptyFollowUpFormState())
  }, [selectedApplication])

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
  const editingFollowUp = selectedFollowUps.find((followUp) => followUp.id === editingFollowUpId) ?? null

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

  const handleEditStateChange = <Key extends keyof ApplicationEditState>(
    key: Key,
    value: ApplicationEditState[Key],
  ) => {
    setEditState((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleFollowUpEditStateChange = <Key extends keyof FollowUpEditState>(
    key: Key,
    value: FollowUpEditState[Key],
  ) => {
    setFollowUpEditState((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleFollowUpFormStateChange = <Key extends keyof FollowUpFormState>(
    key: Key,
    value: FollowUpFormState[Key],
  ) => {
    setFollowUpFormState((current) => ({
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

  const handleSaveApplicationEdits = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedApplication) {
      return
    }

    setApplicationItems((current) =>
      current.map((application) => {
        if (application.id !== selectedApplication.id) {
          return application
        }

        const nextStage = editState.stage
        const nextAppliedOn =
          application.appliedOn === 'Not applied yet' && nextStage !== 'Wishlist'
            ? new Date().toISOString().slice(0, 10)
            : application.appliedOn !== 'Not applied yet' && nextStage === 'Wishlist'
              ? 'Not applied yet'
              : application.appliedOn

        return {
          ...application,
          company: editState.company.trim(),
          role: editState.role.trim(),
          stage: nextStage,
          location: editState.location.trim() || 'Location to confirm',
          salary: editState.salary.trim() || 'Compensation not captured yet',
          appliedOn: nextAppliedOn,
          nextStep: editState.nextStep.trim() || 'Define the next step for this opportunity',
          contact: editState.contact.trim() || 'Contact to add',
          contactRole: editState.contactRole.trim() || 'Role to confirm',
          notes: editState.notes.trim() || 'No notes added yet.',
        }
      }),
    )

    setIsEditingSelectedApplication(false)
  }

  const handleCancelEdits = () => {
    if (!selectedApplication) {
      return
    }

    setEditState(getEditStateFromApplication(selectedApplication))
    setIsEditingSelectedApplication(false)
  }

  const handleStartFollowUpEditing = (followUp: FollowUp) => {
    setEditingFollowUpId(followUp.id)
    setFollowUpEditState(getEditStateFromFollowUp(followUp))
  }

  const handleSaveFollowUpEdits = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!editingFollowUp) {
      return
    }

    setFollowUpItems((current) =>
      current.map((followUp) =>
        followUp.id === editingFollowUp.id
          ? {
              ...followUp,
              title: followUpEditState.title.trim() || 'Follow-up task',
              dueLabel: followUpEditState.dueLabel.trim() || 'Schedule follow-up date',
              status: followUpEditState.status,
            }
          : followUp,
      ),
    )

    setEditingFollowUpId(null)
    setFollowUpEditState(getEmptyFollowUpEditState())
  }

  const handleCancelFollowUpEdits = () => {
    if (!editingFollowUp) {
      return
    }

    setFollowUpEditState(getEditStateFromFollowUp(editingFollowUp))
    setEditingFollowUpId(null)
  }

  const handleCreateFollowUp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedApplication) {
      return
    }

    const newFollowUpId = followUpItems.reduce((maxId, followUp) => Math.max(maxId, followUp.id), 0) + 1
    const newFollowUp: FollowUp = {
      id: newFollowUpId,
      applicationId: selectedApplication.id,
      title: followUpFormState.title.trim() || 'Follow-up task',
      dueLabel: followUpFormState.dueLabel.trim() || 'Schedule follow-up date',
      status: followUpFormState.status,
    }

    setFollowUpItems((current) => [newFollowUp, ...current])
    setFollowUpFormState(getEmptyFollowUpFormState())
  }

  const handleToggleFollowUpCompletion = (followUp: FollowUp) => {
    setFollowUpItems((current) =>
      current.map((item) => {
        if (item.id !== followUp.id) {
          return item
        }

        const isCompleted = item.status === 'completed'

        return {
          ...item,
          status: isCompleted ? 'due-today' : 'completed',
          dueLabel: isCompleted
            ? item.dueLabel.startsWith('Completed')
              ? 'Schedule follow-up date'
              : item.dueLabel
            : item.dueLabel.startsWith('Completed')
              ? item.dueLabel
              : `Completed · ${new Date().toISOString().slice(0, 10)}`,
        }
      }),
    )
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

              {isEditingSelectedApplication ? (
                <form className="detail-edit-form" onSubmit={handleSaveApplicationEdits}>
                  <div className="detail-edit-form-heading">
                    <div>
                      <h3>Edit application</h3>
                      <p>Correct details or move the opportunity to a new stage without leaving the board.</p>
                    </div>
                    <div className="detail-edit-actions">
                      <button type="button" className="secondary-action" onClick={handleCancelEdits}>
                        Cancel
                      </button>
                      <button type="submit" className="primary-action">
                        Save changes
                      </button>
                    </div>
                  </div>

                  <div className="detail-edit-grid">
                    <label>
                      Company
                      <input
                        value={editState.company}
                        onChange={(event) => handleEditStateChange('company', event.target.value)}
                        required
                      />
                    </label>
                    <label>
                      Role
                      <input
                        value={editState.role}
                        onChange={(event) => handleEditStateChange('role', event.target.value)}
                        required
                      />
                    </label>
                    <label>
                      Stage
                      <select
                        value={editState.stage}
                        onChange={(event) =>
                          handleEditStateChange('stage', event.target.value as ApplicationStage)
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
                        value={editState.location}
                        onChange={(event) => handleEditStateChange('location', event.target.value)}
                      />
                    </label>
                    <label>
                      Compensation
                      <input
                        value={editState.salary}
                        onChange={(event) => handleEditStateChange('salary', event.target.value)}
                      />
                    </label>
                    <label>
                      Next step
                      <input
                        value={editState.nextStep}
                        onChange={(event) => handleEditStateChange('nextStep', event.target.value)}
                      />
                    </label>
                    <label>
                      Contact
                      <input
                        value={editState.contact}
                        onChange={(event) => handleEditStateChange('contact', event.target.value)}
                      />
                    </label>
                    <label>
                      Contact role
                      <input
                        value={editState.contactRole}
                        onChange={(event) => handleEditStateChange('contactRole', event.target.value)}
                      />
                    </label>
                    <label className="application-form-note">
                      Notes
                      <textarea
                        value={editState.notes}
                        onChange={(event) => handleEditStateChange('notes', event.target.value)}
                        rows={4}
                      />
                    </label>
                  </div>
                </form>
              ) : (
                <>
                  <div className="detail-panel-actions">
                    <button
                      type="button"
                      className="secondary-action"
                      onClick={() => setIsEditingSelectedApplication(true)}
                    >
                      Edit application
                    </button>
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

                    <form className="follow-up-create-form" onSubmit={handleCreateFollowUp}>
                      <div className="follow-up-create-fields">
                        <label>
                          Title
                          <input
                            value={followUpFormState.title}
                            onChange={(event) =>
                              handleFollowUpFormStateChange('title', event.target.value)
                            }
                            placeholder="Send thank-you note"
                            required
                          />
                        </label>
                        <label>
                          Timing
                          <input
                            value={followUpFormState.dueLabel}
                            onChange={(event) =>
                              handleFollowUpFormStateChange('dueLabel', event.target.value)
                            }
                            placeholder="Tomorrow · 10:00"
                          />
                        </label>
                        <label>
                          Status
                          <select
                            value={followUpFormState.status}
                            onChange={(event) =>
                              handleFollowUpFormStateChange(
                                'status',
                                event.target.value as FollowUpFormState['status'],
                              )
                            }
                          >
                            <option value="due-today">Due today</option>
                            <option value="this-week">This week</option>
                            <option value="waiting">Waiting</option>
                          </select>
                        </label>
                      </div>
                      <button type="submit" className="primary-action">
                        Add follow-up
                      </button>
                    </form>

                    {selectedFollowUps.length > 0 ? (
                      selectedFollowUps.map((followUp) => {
                        const isEditingFollowUp = followUp.id === editingFollowUpId

                        return isEditingFollowUp ? (
                          <form key={followUp.id} className="follow-up-item follow-up-edit-form" onSubmit={handleSaveFollowUpEdits}>
                            <div className="follow-up-edit-fields">
                              <label>
                                Title
                                <input
                                  value={followUpEditState.title}
                                  onChange={(event) =>
                                    handleFollowUpEditStateChange('title', event.target.value)
                                  }
                                  required
                                />
                              </label>
                              <label>
                                Timing
                                <input
                                  value={followUpEditState.dueLabel}
                                  onChange={(event) =>
                                    handleFollowUpEditStateChange('dueLabel', event.target.value)
                                  }
                                />
                              </label>
                              <label>
                                Status
                                <select
                                  value={followUpEditState.status}
                                  onChange={(event) =>
                                    handleFollowUpEditStateChange(
                                      'status',
                                      event.target.value as FollowUpStatus,
                                    )
                                  }
                                >
                                  {Object.entries(followUpLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                      {label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>
                            <div className="follow-up-edit-actions">
                              <button type="button" className="secondary-action" onClick={handleCancelFollowUpEdits}>
                                Cancel
                              </button>
                              <button type="submit" className="primary-action">
                                Save follow-up
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div key={followUp.id} className="follow-up-item">
                            <div>
                              <strong>{followUp.title}</strong>
                              <p>{followUp.dueLabel}</p>
                            </div>
                            <div className="follow-up-item-actions">
                              <span className={`status-chip ${followUp.status}`}>
                                {followUpLabels[followUp.status]}
                              </span>
                              <button
                                type="button"
                                className="secondary-action follow-up-edit-button"
                                onClick={() => handleToggleFollowUpCompletion(followUp)}
                              >
                                {followUp.status === 'completed' ? 'Reopen' : 'Complete'}
                              </button>
                              <button
                                type="button"
                                className="secondary-action follow-up-edit-button"
                                onClick={() => handleStartFollowUpEditing(followUp)}
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="empty-state">No follow-ups logged for this application yet.</p>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="empty-state">Add your first application to start the board.</p>
          )}
        </aside>
      </main>
    </div>
  )
}

function getEmptyEditState(): ApplicationEditState {
  return {
    company: '',
    role: '',
    stage: 'Applied',
    location: '',
    salary: '',
    nextStep: '',
    contact: '',
    contactRole: '',
    notes: '',
  }
}

function getEditStateFromFollowUp(followUp: FollowUp): FollowUpEditState {
  return {
    title: followUp.title,
    dueLabel: followUp.dueLabel,
    status: followUp.status,
  }
}

function getEmptyFollowUpEditState(): FollowUpEditState {
  return {
    title: '',
    dueLabel: '',
    status: 'due-today',
  }
}

function getEmptyFollowUpFormState(): FollowUpFormState {
  return {
    title: '',
    dueLabel: '',
    status: 'due-today',
  }
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
