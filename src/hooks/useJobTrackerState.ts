import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type {
  Application,
  ApplicationEditState,
  ApplicationFormState,
  FollowUp,
  FollowUpEditState,
  FollowUpFilter,
  FollowUpFormState,
  FollowUpStatus,
} from '../types'
import { followUpSchedulePresets } from '../constants'
import { applications as initialApplications, followUps as initialFollowUps } from '../data'
import { useFollowUpPriority } from './useFollowUpPriority'

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

function getEmptyFollowUpEditState(): FollowUpEditState {
  return {
    title: '',
    dueLabel: '',
    status: 'due-today',
    context: '',
  }
}

function getEmptyFollowUpFormState(): FollowUpFormState {
  return {
    title: '',
    dueLabel: '',
    status: 'due-today',
    context: '',
  }
}

function trimOrDefault(value: string, fallback: string): string {
  const trimmed = value.trim()
  return trimmed || fallback
}

export function useJobTrackerState() {
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

  const selectedFollowUps = followUpItems.filter(
    (followUp) => followUp.applicationId === selectedApplication?.id,
  )

  const editingFollowUp =
    selectedFollowUps.find((followUp) => followUp.id === editingFollowUpId) ?? null

  const sortedSelectedFollowUps = useFollowUpPriority(selectedFollowUps)

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

  const visibleFollowUps = useMemo(() => {
    if (followUpFilter === 'completed') {
      return sortedSelectedFollowUps.filter((followUp) => followUp.status === 'completed')
    }
    if (followUpFilter === 'open') {
      return sortedSelectedFollowUps.filter((followUp) => followUp.status !== 'completed')
    }
    return sortedSelectedFollowUps
  }, [followUpFilter, sortedSelectedFollowUps])

  const nextOpenFollowUp =
    sortedSelectedFollowUps.find((followUp) => followUp.status !== 'completed') ?? null

  const handleFormChange = <Key extends keyof ApplicationFormState>(
    key: Key,
    value: ApplicationFormState[Key],
  ) => {
    setFormState((current) => ({ ...current, [key]: value }))
  }

  const handleEditStateChange = <Key extends keyof ApplicationEditState>(
    key: Key,
    value: ApplicationEditState[Key],
  ) => {
    setEditState((current) => ({ ...current, [key]: value }))
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
    setFollowUpFormState((current) => ({ ...current, [key]: value }))
  }

  const getNextId = (items: { id: number }[]) =>
    items.reduce((max, item) => Math.max(max, item.id), 0) + 1

  const handleCreateApplication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const newId = getNextId(applicationItems)

    const newApplication: Application = {
      id: newId,
      company: trimOrDefault(formState.company, ''),
      role: trimOrDefault(formState.role, ''),
      stage: formState.stage,
      location: trimOrDefault(formState.location, 'Location to confirm'),
      salary: trimOrDefault(formState.salary, 'Compensation not captured yet'),
      appliedOn:
        formState.stage === 'Wishlist' ? 'Not applied yet' : new Date().toISOString().slice(0, 10),
      nextStep: trimOrDefault(formState.nextStep, 'Define the next step for this opportunity'),
      resume: 'Resume to attach',
      contact: trimOrDefault(formState.contact, 'Contact to add'),
      contactRole: trimOrDefault(formState.contactRole, 'Role to confirm'),
      notes: trimOrDefault(formState.notes, 'No notes added yet.'),
    }

    setApplicationItems((current) => [newApplication, ...current])
    setSelectedApplicationId(newId)

    const trimmedFollowUpTitle = formState.followUpTitle.trim()
    if (trimmedFollowUpTitle) {
      const newFollowUpId = getNextId(followUpItems)
      const newFollowUp: FollowUp = {
        id: newFollowUpId,
        applicationId: newId,
        title: trimmedFollowUpTitle,
        dueLabel: trimOrDefault(formState.followUpDueLabel, 'Schedule follow-up date'),
        status: 'due-today',
        context: 'Initial outreach',
      }
      setFollowUpItems((current) => [newFollowUp, ...current])
    }

    setFormState(defaultFormState)
  }

  const handleSaveApplicationEdits = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedApplication) return

    setApplicationItems((current) =>
      current.map((application) => {
        if (application.id !== selectedApplication.id) return application

        const nextStage = editState.stage
        const nextAppliedOn =
          application.appliedOn === 'Not applied yet' && nextStage !== 'Wishlist'
            ? new Date().toISOString().slice(0, 10)
            : application.appliedOn !== 'Not applied yet' && nextStage === 'Wishlist'
              ? 'Not applied yet'
              : application.appliedOn

        return {
          ...application,
          company: trimOrDefault(editState.company, ''),
          role: trimOrDefault(editState.role, ''),
          stage: nextStage,
          location: trimOrDefault(editState.location, 'Location to confirm'),
          salary: trimOrDefault(editState.salary, 'Compensation not captured yet'),
          appliedOn: nextAppliedOn,
          nextStep: trimOrDefault(editState.nextStep, 'Define the next step for this opportunity'),
          contact: trimOrDefault(editState.contact, 'Contact to add'),
          contactRole: trimOrDefault(editState.contactRole, 'Role to confirm'),
          notes: trimOrDefault(editState.notes, 'No notes added yet.'),
        }
      }),
    )
    setIsEditingSelectedApplication(false)
  }

  const handleCancelEdits = () => {
    if (!selectedApplication) return
    setEditState(getEditStateFromApplication(selectedApplication))
    setIsEditingSelectedApplication(false)
  }

  const handleStartFollowUpEditing = (followUp: FollowUp) => {
    setEditingFollowUpId(followUp.id)
    setFollowUpEditState({
      title: followUp.title,
      dueLabel: followUp.dueLabel,
      status: followUp.status,
      context: followUp.context,
    })
  }

  const handleSaveFollowUpEdits = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingFollowUp) return

    setFollowUpItems((current) =>
      current.map((followUp) =>
        followUp.id === editingFollowUp.id
          ? {
              ...followUp,
              title: trimOrDefault(followUpEditState.title, 'Follow-up task'),
              dueLabel: trimOrDefault(followUpEditState.dueLabel, 'Schedule follow-up date'),
              status: followUpEditState.status,
              context: trimOrDefault(followUpEditState.context, 'General follow-up'),
            }
          : followUp,
      ),
    )
    setEditingFollowUpId(null)
    setFollowUpEditState(getEmptyFollowUpEditState())
  }

  const handleCancelFollowUpEdits = () => {
    if (!editingFollowUp) return
    setFollowUpEditState({
      title: editingFollowUp.title,
      dueLabel: editingFollowUp.dueLabel,
      status: editingFollowUp.status,
      context: editingFollowUp.context,
    })
    setEditingFollowUpId(null)
  }

  const handleCreateFollowUp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedApplication) return

    const newFollowUp: FollowUp = {
      id: getNextId(followUpItems),
      applicationId: selectedApplication.id,
      title: trimOrDefault(followUpFormState.title, 'Follow-up task'),
      dueLabel: trimOrDefault(
        followUpFormState.dueLabel,
        followUpSchedulePresets[followUpFormState.status],
      ),
      status: followUpFormState.status,
      context: trimOrDefault(followUpFormState.context, 'General follow-up'),
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
          ? { ...item, status, dueLabel: followUpSchedulePresets[status] }
          : item,
      ),
    )
  }

  const handleToggleFollowUpCompletion = (followUp: FollowUp) => {
    setFollowUpItems((current) =>
      current.map((item) => {
        if (item.id !== followUp.id) return item
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

  const heroMetrics = useMemo(() => {
    const activeApplications = applicationItems.filter(
      (application) => application.stage !== 'Closed',
    ).length
    const dueFollowUps = followUpItems.filter((followUp) => followUp.status === 'due-today').length
    const offersInPlay = applicationItems.filter(
      (application) => application.stage === 'Offer',
    ).length
    return { activeApplications, dueFollowUps, offersInPlay }
  }, [applicationItems, followUpItems])

  return {
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
    editingFollowUp,
    followUpSummary,
    visibleFollowUps,
    nextOpenFollowUp,
    heroMetrics,
    setSelectedApplicationId,
    setFormState,
    setIsEditingSelectedApplication,
    setEditingFollowUpId,
    setEditState,
    setFollowUpEditState,
    setFollowUpFormState,
    setFollowUpFilter,
    handleFormChange,
    handleEditStateChange,
    handleFollowUpEditStateChange,
    handleFollowUpFormStateChange,
    handleCreateApplication,
    handleSaveApplicationEdits,
    handleCancelEdits,
    handleStartFollowUpEditing,
    handleSaveFollowUpEdits,
    handleCancelFollowUpEdits,
    handleCreateFollowUp,
    handleApplyFollowUpPreset,
    handleRescheduleFollowUp,
    handleToggleFollowUpCompletion,
  }
}
