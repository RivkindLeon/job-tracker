import { FALLBACK_PLACEHOLDERS, followUpSchedulePresets } from '../constants'
import type {
  Application,
  ApplicationEditState,
  ApplicationFormState,
  FollowUp,
  FollowUpEditState,
  FollowUpFormState,
  FollowUpStatus,
} from '../types'

export const defaultFormState: ApplicationFormState = {
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

export function getEditStateFromApplication(application: Application): ApplicationEditState {
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

export function getEmptyEditState(): ApplicationEditState {
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

export function getEmptyFollowUpEditState(): FollowUpEditState {
  return {
    title: '',
    dueLabel: '',
    status: 'due-today',
    context: '',
  }
}

export function getEmptyFollowUpFormState(): FollowUpFormState {
  return {
    title: '',
    dueLabel: '',
    status: 'due-today',
    context: '',
  }
}

export function trimOrDefault(value: string, fallback: string): string {
  const trimmed = value.trim()
  return trimmed || fallback
}

export function getNextId(items: { id: number }[]) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

export function buildApplicationFromForm(
  formState: ApplicationFormState,
  newId: number,
): Application {
  return {
    id: newId,
    company: trimOrDefault(formState.company, ''),
    role: trimOrDefault(formState.role, ''),
    stage: formState.stage,
    location: trimOrDefault(formState.location, FALLBACK_PLACEHOLDERS.location),
    salary: trimOrDefault(formState.salary, FALLBACK_PLACEHOLDERS.salary),
    appliedOn:
      formState.stage === 'Wishlist' ? 'Not applied yet' : new Date().toISOString().slice(0, 10),
    nextStep: trimOrDefault(formState.nextStep, FALLBACK_PLACEHOLDERS.nextStep),
    resume: FALLBACK_PLACEHOLDERS.resume,
    contact: trimOrDefault(formState.contact, FALLBACK_PLACEHOLDERS.contact),
    contactRole: trimOrDefault(formState.contactRole, FALLBACK_PLACEHOLDERS.contactRole),
    notes: trimOrDefault(formState.notes, FALLBACK_PLACEHOLDERS.notes),
  }
}

export function buildInitialFollowUpFromForm(
  formState: ApplicationFormState,
  applicationId: number,
  followUpId: number,
): FollowUp | null {
  const trimmedFollowUpTitle = formState.followUpTitle.trim()
  if (!trimmedFollowUpTitle) {
    return null
  }

  return {
    id: followUpId,
    applicationId,
    title: trimmedFollowUpTitle,
    dueLabel: trimOrDefault(formState.followUpDueLabel, FALLBACK_PLACEHOLDERS.followUpDueLabel),
    status: 'due-today',
    context: 'Initial outreach',
  }
}

export function applyApplicationEdits(
  application: Application,
  editState: ApplicationEditState,
): Application {
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
    location: trimOrDefault(editState.location, FALLBACK_PLACEHOLDERS.location),
    salary: trimOrDefault(editState.salary, FALLBACK_PLACEHOLDERS.salary),
    appliedOn: nextAppliedOn,
    nextStep: trimOrDefault(editState.nextStep, FALLBACK_PLACEHOLDERS.nextStep),
    contact: trimOrDefault(editState.contact, FALLBACK_PLACEHOLDERS.contact),
    contactRole: trimOrDefault(editState.contactRole, FALLBACK_PLACEHOLDERS.contactRole),
    notes: trimOrDefault(editState.notes, FALLBACK_PLACEHOLDERS.notes),
  }
}

export function applyFollowUpEdits(
  followUp: FollowUp,
  followUpEditState: FollowUpEditState,
): FollowUp {
  return {
    ...followUp,
    title: trimOrDefault(followUpEditState.title, FALLBACK_PLACEHOLDERS.followUpTitle),
    dueLabel: trimOrDefault(followUpEditState.dueLabel, FALLBACK_PLACEHOLDERS.followUpDueLabel),
    status: followUpEditState.status,
    context: trimOrDefault(followUpEditState.context, FALLBACK_PLACEHOLDERS.followUpContext),
  }
}

export function buildFollowUpFromForm(
  followUpFormState: FollowUpFormState,
  applicationId: number,
  followUpId: number,
): FollowUp {
  return {
    id: followUpId,
    applicationId,
    title: trimOrDefault(followUpFormState.title, FALLBACK_PLACEHOLDERS.followUpTitle),
    dueLabel: trimOrDefault(
      followUpFormState.dueLabel,
      followUpSchedulePresets[followUpFormState.status],
    ),
    status: followUpFormState.status,
    context: trimOrDefault(followUpFormState.context, FALLBACK_PLACEHOLDERS.followUpContext),
  }
}

export function getFollowUpSchedulePreset(status: Exclude<FollowUpStatus, 'completed'>): string {
  return followUpSchedulePresets[status]
}

export function rescheduleFollowUp(
  followUp: FollowUp,
  status: Exclude<FollowUpStatus, 'completed'>,
): FollowUp {
  return {
    ...followUp,
    status,
    dueLabel: getFollowUpSchedulePreset(status),
  }
}

export function toggleFollowUpCompletion(followUp: FollowUp): FollowUp {
  const isCompleted = followUp.status === 'completed'

  return {
    ...followUp,
    status: isCompleted ? 'due-today' : 'completed',
    dueLabel: isCompleted
      ? followUp.dueLabel.startsWith('Completed')
        ? FALLBACK_PLACEHOLDERS.followUpDueLabel
        : followUp.dueLabel
      : followUp.dueLabel.startsWith('Completed')
        ? followUp.dueLabel
        : `Completed · ${new Date().toISOString().slice(0, 10)}`,
  }
}
