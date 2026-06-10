import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type {
  ApplicationEditState,
  ApplicationFormState,
  FollowUp,
  FollowUpEditState,
  FollowUpFilter,
  FollowUpFormState,
  FollowUpStatus,
} from '../types'
import { applications as initialApplications, followUps as initialFollowUps } from '../data'
import { useFollowUpPriority } from './useFollowUpPriority'
import {
  applyApplicationEdits,
  applyFollowUpEdits,
  buildApplicationFromForm,
  buildFollowUpFromForm,
  buildInitialFollowUpFromForm,
  defaultFormState,
  getEditStateFromApplication,
  getEmptyEditState,
  getEmptyFollowUpEditState,
  getEmptyFollowUpFormState,
  getFollowUpSchedulePreset,
  getNextId,
  rescheduleFollowUp,
  toggleFollowUpCompletion,
} from './jobTrackerStateHelpers'

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

  const handleCreateApplication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const newId = getNextId(applicationItems)
    const newApplication = buildApplicationFromForm(formState, newId)

    setApplicationItems((current) => [newApplication, ...current])
    setSelectedApplicationId(newId)

    const initialFollowUp = buildInitialFollowUpFromForm(formState, newId, getNextId(followUpItems))
    if (initialFollowUp) {
      setFollowUpItems((current) => [initialFollowUp, ...current])
    }

    setFormState(defaultFormState)
  }

  const handleSaveApplicationEdits = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedApplication) return

    setApplicationItems((current) =>
      current.map((application) => {
        if (application.id !== selectedApplication.id) return application

        return applyApplicationEdits(application, editState)
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
          ? applyFollowUpEdits(followUp, followUpEditState)
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

    const newFollowUp = buildFollowUpFromForm(
      followUpFormState,
      selectedApplication.id,
      getNextId(followUpItems),
    )

    setFollowUpItems((current) => [newFollowUp, ...current])
    setFollowUpFormState(getEmptyFollowUpFormState())
  }

  const handleApplyFollowUpPreset = (status: FollowUpFormState['status']) => {
    setFollowUpFormState((current) => ({
      ...current,
      status,
      dueLabel: getFollowUpSchedulePreset(status),
    }))
  }

  const handleRescheduleFollowUp = (
    followUpId: number,
    status: Exclude<FollowUpStatus, 'completed'>,
  ) => {
    setFollowUpItems((current) =>
      current.map((item) => (item.id === followUpId ? rescheduleFollowUp(item, status) : item)),
    )
  }

  const handleToggleFollowUpCompletion = (followUp: FollowUp) => {
    setFollowUpItems((current) =>
      current.map((item) => {
        if (item.id !== followUp.id) return item
        return toggleFollowUpCompletion(item)
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
