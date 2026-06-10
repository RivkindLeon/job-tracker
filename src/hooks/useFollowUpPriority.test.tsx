import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { FollowUp } from '../types'
import { useFollowUpPriority } from './useFollowUpPriority'

describe('useFollowUpPriority', () => {
  it('sorts follow-ups from most urgent to least urgent without mutating the source list', () => {
    const followUps: FollowUp[] = [
      {
        id: 4,
        applicationId: 1,
        title: 'Archive notes',
        dueLabel: 'Completed last week',
        status: 'completed',
        context: 'Retrospective',
      },
      {
        id: 2,
        applicationId: 1,
        title: 'Nudge recruiter',
        dueLabel: 'Friday',
        status: 'this-week',
        context: 'Follow-up',
      },
      {
        id: 3,
        applicationId: 1,
        title: 'Wait for feedback',
        dueLabel: 'Waiting on response',
        status: 'waiting',
        context: 'Interview',
      },
      {
        id: 1,
        applicationId: 1,
        title: 'Confirm availability',
        dueLabel: 'Today',
        status: 'due-today',
        context: 'Interview coordination',
      },
    ]

    const originalOrder = followUps.map((followUp) => followUp.id)
    const { result } = renderHook(() => useFollowUpPriority(followUps))

    expect(result.current.map((followUp) => followUp.id)).toEqual([1, 2, 3, 4])
    expect(followUps.map((followUp) => followUp.id)).toEqual(originalOrder)
  })
})
