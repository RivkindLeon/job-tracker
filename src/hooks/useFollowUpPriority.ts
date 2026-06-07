import { useMemo } from 'react'
import type { FollowUp } from '../types'
import { followUpStatusPriority } from '../constants'

export function useFollowUpPriority(followUps: FollowUp[]) {
  return useMemo(
    () =>
      [...followUps].sort(
        (left, right) => followUpStatusPriority[left.status] - followUpStatusPriority[right.status],
      ),
    [followUps],
  )
}
