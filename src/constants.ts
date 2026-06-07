import type { FollowUpStatus } from './types'

export const followUpSchedulePresets: Record<Exclude<FollowUpStatus, 'completed'>, string> = {
  'due-today': 'Today · 17:00',
  'this-week': 'This week · Choose a day',
  waiting: 'Waiting on recruiter response',
}

export const followUpLabels: Record<FollowUpStatus, string> = {
  'due-today': 'Due today',
  'this-week': 'This week',
  waiting: 'Waiting',
  completed: 'Completed',
}

export const followUpStatusPriority: Record<FollowUpStatus, number> = {
  'due-today': 0,
  'this-week': 1,
  waiting: 2,
  completed: 3,
}

export const FALLBACK_PLACEHOLDERS = {
  location: 'Location to confirm',
  salary: 'Compensation not captured yet',
  nextStep: 'Define the next step for this opportunity',
  resume: 'Resume to attach',
  contact: 'Contact to add',
  contactRole: 'Role to confirm',
  notes: 'No notes added yet.',
  followUpTitle: 'Follow-up task',
  followUpDueLabel: 'Schedule follow-up date',
  followUpContext: 'General follow-up',
} as const
