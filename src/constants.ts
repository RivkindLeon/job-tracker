import type { FollowUpStatus } from './data'

export const followUpSchedulePresets: Record<Exclude<FollowUpStatus, 'completed'>, string> = {
  'due-today': 'Today · 17:00',
  'this-week': 'This week · Choose a day',
  waiting: 'Waiting on recruiter response',
}
