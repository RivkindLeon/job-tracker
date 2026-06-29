import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
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
import {
  createFollowUp as apiCreateFollowUp,
  fetchFollowUps as apiFetchFollowUps,
  updateFollowUp as apiUpdateFollowUp,
  checkApiHealth,
} from '../api'

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
  const [apiAvailable, setApiAvailable] = useState(false)
  const [apiLoading, setApiLoading] = useState(false)

  // Check backend health once on mount
  useEffect(() => {
    let cancelled = false
    checkApiHealth().then((ok) => {
      if (!cancelled) setApiAvailable(ok)
    })
    return () => {
      cancelled = true
    }
  }, [])

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

  // Fetch follow-ups from the backend when the selected application changes
  const lastFetchedAppRef = useRef<number | null>(null)

  useEffect(() => {
    if (!apiAvailable || !selectedApplication) return
    if (lastFetchedAppRef.current === selectedApplication.id) return

    lastFetchedAppRef.current = selectedApplication.id
    setApiLoading(true)

    apiFetchFollowUps(selectedApplication.id)
      .then((apiFollowUps) => {
        setFollowUpItems((current) => {
          const other = current.filter((f) => f.applicationId !== selectedApplication.id)
          const mapped = apiFollowUps.map((af) => ({
            id: af.id,
            applicationId: af.applicationId,
            title: af.title,
            dueLabel: af.dueLabel,
            status: af.status as FollowUpStatus,
            context: af.context,
          }))
          const priorityOrder: Record<string, number> = {
            'due-today': 0,
            'this-week': 1,
            waiting: 2,
            completed: 3,
          }
          mapped.sort((a, b) => priorityOrder[a.status] - priorityOrder[b.status])
          return [...other, ...mapped]
        })
      })
      .catch(() => {
        lastFetchedAppRef.current = null
      })
      .finally(() => setApiLoading(false))
  }, [apiAvailable, selectedApplication])

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

  const handleSaveFollowUpEdits = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!editingFollowUp) return

      const updated = applyFollowUpEdits(editingFollowUp, followUpEditState)

      // Optimistic local update
      setFollowUpItems((current) =>
        current.map((followUp) => (followUp.id === editingFollowUp.id ? updated : followUp)),
      )
      setEditingFollowUpId(null)
      setFollowUpEditState(getEmptyFollowUpEditState())

      // Persist to backend (fire-and-forget; failure falls back to local state)
      if (apiAvailable) {
        apiUpdateFollowUp(updated.applicationId, updated.id, {
          title: updated.title,
          dueLabel: updated.dueLabel,
          status: updated.status,
          context: updated.context,
        }).catch(() => {
          // Revert on failure
          setFollowUpItems((current) =>
            current.map((f) => (f.id === editingFollowUp.id ? editingFollowUp : f)),
          )
        })
      }
    },
    [editingFollowUp, followUpEditState, apiAvailable],
  )

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

  const handleCreateFollowUp = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!selectedApplication) return

      const newFollowUp = buildFollowUpFromForm(
        followUpFormState,
        selectedApplication.id,
        getNextId(followUpItems),
      )

      // Optimistic local update
      setFollowUpItems((current) => [newFollowUp, ...current])
      setFollowUpFormState(getEmptyFollowUpFormState())

      // Persist to backend
      if (apiAvailable) {
        apiCreateFollowUp(selectedApplication.id, {
          title: newFollowUp.title,
          dueLabel: newFollowUp.dueLabel,
          status: newFollowUp.status,
          context: newFollowUp.context,
        })
          .then((created) => {
            // Replace optimistic ID with server-assigned ID
            setFollowUpItems((current) =>
              current.map((f) =>
                f.id === newFollowUp.id && f.applicationId === selectedApplication.id
                  ? { ...f, id: created.id }
                  : f,
              ),
            )
          })
          .catch(() => {
            // Revert on failure
            setFollowUpItems((current) => current.filter((f) => f.id !== newFollowUp.id))
          })
      }
    },
    [selectedApplication, followUpFormState, followUpItems, apiAvailable],
  )

  const handleApplyFollowUpPreset = (status: FollowUpFormState['status']) => {
    setFollowUpFormState((current) => ({
      ...current,
      status,
      dueLabel: getFollowUpSchedulePreset(status),
    }))
  }

  const handleRescheduleFollowUp = useCallback(
    (followUpId: number, status: Exclude<FollowUpStatus, 'completed'>) => {
      const original = followUpItems.find((f) => f.id === followUpId)

      // Optimistic local update
      setFollowUpItems((current) =>
        current.map((item) => (item.id === followUpId ? rescheduleFollowUp(item, status) : item)),
      )

      // Persist to backend
      if (apiAvailable && original) {
        const rescheduled = rescheduleFollowUp(original, status)
        apiUpdateFollowUp(rescheduled.applicationId, rescheduled.id, {
          title: rescheduled.title,
          dueLabel: rescheduled.dueLabel,
          status: rescheduled.status,
          context: rescheduled.context,
        }).catch(() => {
          // Revert on failure
          setFollowUpItems((current) => current.map((f) => (f.id === followUpId ? original : f)))
        })
      }
    },
    [followUpItems, apiAvailable],
  )

  const handleToggleFollowUpCompletion = useCallback(
    (followUp: FollowUp) => {
      const toggled = toggleFollowUpCompletion(followUp)

      // Optimistic local update
      setFollowUpItems((current) =>
        current.map((item) => (item.id === followUp.id ? toggled : item)),
      )

      // Persist to backend
      if (apiAvailable) {
        apiUpdateFollowUp(toggled.applicationId, toggled.id, {
          title: toggled.title,
          dueLabel: toggled.dueLabel,
          status: toggled.status,
          context: toggled.context,
        }).catch(() => {
          // Revert on failure
          setFollowUpItems((current) => current.map((f) => (f.id === followUp.id ? followUp : f)))
        })
      }
    },
    [apiAvailable],
  )

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
    apiAvailable,
    apiLoading,
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
