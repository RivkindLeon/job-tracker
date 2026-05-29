import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  applications as initialApplications,
  followUps as initialFollowUps,
  stages,
  type Application,
  type FollowUp,
  type FollowUpStatus,
} from './data'
import { Metric } from './components/Metric'
import { ApplicationForm, type ApplicationFormState } from './components/ApplicationForm'
import { ApplicationBoard } from './components/ApplicationBoard'
import { ApplicationDetail, type ApplicationEditState } from './components/ApplicationDetail'
import {
  type FollowUpFilter,
  type FollowUpEditState,
  type FollowUpFormState,
} from './components/FollowUpList'
import { followUpSchedulePresets } from './constants'
import { useFollowUpPriority } from './hooks/useFollowUpPriority'
import './App.css'

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

function App() {
  const [applicationItems, setApplicationItems] = useState(initialApplications)
  const [followUpItems, setFollowUpItems] = useState(initialFollowUps)
  const [selectedApplicationId, setSelectedApplicationId] = useState(
    initialApplications[0]?.id ?? 0,
  )
  const [formState, setFormState] = useState(defaultFormState)
  const [isEditingSelectedApplication, setIsEditingSelectedApplication] = useState(false)
  const [editingFollowUpId, setEditingFollowUpId] = useState<number | null>(null)
  const [editState, setEditState] = useState<ApplicationEditState>(() =>
    initialApplications[0]
      ? getEditStateFromApplication(initialApplications[0])
      : getEmptyEditState(),
  )
  const [followUpEditState, setFollowUpEditState] =
    useState<FollowUpEditState>(getEmptyFollowUpEditState)
  const [followUpFormState, setFollowUpFormState] =
    useState<FollowUpFormState>(getEmptyFollowUpFormState)
  const [followUpFilter, setFollowUpFilter] = useState<FollowUpFilter>('open')

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

  const editingFollowUp =
    selectedFollowUps.find((followUp) => followUp.id === editingFollowUpId) ?? null

  const followUpSummary = useMemo(() => {
    const completedCount = selectedFollowUps.filter(
      (followUp) => followUp.status === 'completed',
    ).length
    const openCount = selectedFollowUps.length - completedCount

    return {
      all: selectedFollowUps.length,
      open: openCount,
      completed: completedCount,
    }
  }, [selectedFollowUps])

  const sortedSelectedFollowUps = useFollowUpPriority(selectedFollowUps)

  const visibleFollowUps = useMemo(() => {
    const filteredFollowUps =
      followUpFilter === 'completed'
        ? sortedSelectedFollowUps.filter((followUp) => followUp.status === 'completed')
        : followUpFilter === 'open'
          ? sortedSelectedFollowUps.filter((followUp) => followUp.status !== 'completed')
          : sortedSelectedFollowUps

    return filteredFollowUps
  }, [followUpFilter, sortedSelectedFollowUps])

  const nextOpenFollowUp =
    sortedSelectedFollowUps.find((followUp) => followUp.status !== 'completed') ?? null

  const heroMetrics = useMemo(() => {
    const activeApplications = applicationItems.filter(
      (application) => application.stage !== 'Closed',
    ).length
    const dueFollowUps = followUpItems.filter((followUp) => followUp.status === 'due-today').length
    const offersInPlay = applicationItems.filter(
      (application) => application.stage === 'Offer',
    ).length

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
      appliedOn:
        formState.stage === 'Wishlist' ? 'Not applied yet' : new Date().toISOString().slice(0, 10),
      nextStep: formState.nextStep.trim() || 'Define the next step for this opportunity',
      resume: 'Resume to attach',
      contact: formState.contact.trim() || 'Contact to add',
      contactRole: formState.contactRole.trim() || 'Role to confirm',
      notes: formState.notes.trim() || 'No notes added yet.',
    }

    setApplicationItems((current) => [newApplication, ...current])
    setSelectedApplicationId(newApplicationId)

    if (trimmedFollowUpTitle) {
      const newFollowUpId =
        followUpItems.reduce((maxId, followUp) => Math.max(maxId, followUp.id), 0) + 1
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

    const newFollowUpId =
      followUpItems.reduce((maxId, followUp) => Math.max(maxId, followUp.id), 0) + 1
    const newFollowUp: FollowUp = {
      id: newFollowUpId,
      applicationId: selectedApplication.id,
      title: followUpFormState.title.trim() || 'Follow-up task',
      dueLabel:
        followUpFormState.dueLabel.trim() || followUpSchedulePresets[followUpFormState.status],
      status: followUpFormState.status,
    }

    setFollowUpItems((current) => [newFollowUp, ...current])
    setFollowUpFormState(getEmptyFollowUpFormState())
  }

  const handleApplyFollowUpPreset = (status: FollowUpFormState['status']) => {
    setFollowUpFormState((current) => ({
      ...current,
      status,
      dueLabel: followUpSchedulePresets[status],
    }))
  }

  const handleRescheduleFollowUp = (
    followUpId: number,
    status: Exclude<FollowUpStatus, 'completed'>,
  ) => {
    setFollowUpItems((current) =>
      current.map((item) =>
        item.id === followUpId
          ? {
              ...item,
              status,
              dueLabel: followUpSchedulePresets[status],
            }
          : item,
      ),
    )
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
