import { useMemo } from 'react'
import type { FollowUp, FollowUpStatus } from '../data'

const followUpStatusPriority: Record<FollowUpStatus, number> = {
  'due-today': 0,
  'this-week': 1,
  waiting: 2,
  completed: 3,
}

export function useFollowUpPriority(followUps: FollowUp[]) {
  return useMemo(
    () =>
      [...followUps].sort(
        (left, right) => followUpStatusPriority[left.status] - followUpStatusPriority[right.status],
      ),
    [followUps],
  )
}
