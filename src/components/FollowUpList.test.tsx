import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { ComponentProps, FormEvent } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FollowUpList } from './FollowUpList'
import type { FollowUp, FollowUpEditState, FollowUpFormState } from '../types'

const followUps: FollowUp[] = [
  {
    id: 1,
    applicationId: 10,
    title: 'Send take-home update',
    dueLabel: 'Today · 17:00',
    status: 'due-today',
    context: 'Take-home',
  },
  {
    id: 2,
    applicationId: 10,
    title: 'Wait for recruiter reply',
    dueLabel: 'Waiting on recruiter response',
    status: 'waiting',
    context: 'Recruiter loop',
  },
  {
    id: 3,
    applicationId: 10,
    title: 'Archive notes',
    dueLabel: 'Completed · 2026-06-01',
    status: 'completed',
    context: 'Retrospective',
  },
]

const followUpEditState: FollowUpEditState = {
  title: 'Send take-home update',
  dueLabel: 'Today · 17:00',
  status: 'due-today',
  context: 'Take-home',
}

const followUpFormState: FollowUpFormState = {
  title: '',
  dueLabel: '',
  status: 'due-today',
  context: '',
}

function createProps(overrides: Partial<ComponentProps<typeof FollowUpList>> = {}) {
  return {
    followUps,
    visibleFollowUps: followUps,
    followUpSummary: {
      all: 3,
      open: 2,
      completed: 1,
    },
    followUpFilter: 'open' as const,
    nextOpenFollowUp: followUps[0],
    editingFollowUpId: null,
    followUpEditState,
    followUpFormState,
    onFilterChange: vi.fn(),
    onStartEdit: vi.fn(),
    onSaveEdit: vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault()),
    onCancelEdit: vi.fn(),
    onEditStateChange: vi.fn(),
    onFormStateChange: vi.fn(),
    onCreateFollowUp: vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault()),
    onApplyPreset: vi.fn(),
    onReschedule: vi.fn(),
    onToggleCompletion: vi.fn(),
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('FollowUpList', () => {
  it('renders the planning snapshot and forwards quick actions for visible follow-ups', () => {
    const props = createProps()
    render(<FollowUpList {...props} />)

    expect(screen.getAllByText('Send take-home update')).toHaveLength(2)
    expect(screen.getByText('Due today · Today · 17:00 · Take-home')).toBeTruthy()
    expect(screen.getByText('Due today 1')).toBeTruthy()
    expect(screen.getByText('This week 0')).toBeTruthy()
    expect(screen.getByText('Waiting 1')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Completed 1' }))
    expect(props.onFilterChange).toHaveBeenCalledWith('completed')

    fireEvent.click(screen.getAllByRole('button', { name: 'Week' })[0])
    expect(props.onReschedule).toHaveBeenCalledWith(1, 'this-week')

    fireEvent.click(screen.getAllByRole('button', { name: 'Complete' })[0])
    expect(props.onToggleCompletion).toHaveBeenCalledWith(followUps[0])

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0])
    expect(props.onStartEdit).toHaveBeenCalledWith(followUps[0])
  })

  it('renders the edit form and forwards edit interactions for the selected follow-up', () => {
    const props = createProps({
      editingFollowUpId: 1,
      visibleFollowUps: followUps.slice(0, 1),
    })

    render(<FollowUpList {...props} />)

    const editForm = screen.getByRole('button', { name: 'Save follow-up' }).closest('form')!
    const editFormQueries = within(editForm)

    fireEvent.change(editFormQueries.getByLabelText('Title'), {
      target: { value: 'Share take-home draft' },
    })
    expect(props.onEditStateChange).toHaveBeenCalledWith('title', 'Share take-home draft')

    fireEvent.change(editFormQueries.getByLabelText('Status'), {
      target: { value: 'waiting' },
    })
    expect(props.onEditStateChange).toHaveBeenCalledWith('status', 'waiting')

    fireEvent.click(editFormQueries.getByRole('button', { name: 'Cancel' }))
    expect(props.onCancelEdit).toHaveBeenCalled()

    fireEvent.submit(editForm)
    expect(props.onSaveEdit).toHaveBeenCalled()
  })

  it('shows the right empty-state copy for empty applications and filtered views', () => {
    const emptyProps = createProps({
      followUps: [],
      visibleFollowUps: [],
      followUpSummary: { all: 0, open: 0, completed: 0 },
      nextOpenFollowUp: null,
    })
    const { rerender } = render(<FollowUpList {...emptyProps} />)

    expect(screen.getByText('No open follow-up queued')).toBeTruthy()
    expect(screen.getByText('No follow-ups logged for this application yet.')).toBeTruthy()

    rerender(
      <FollowUpList
        {...createProps({
          visibleFollowUps: [],
          followUpFilter: 'completed',
        })}
      />,
    )

    expect(screen.getByText('No completed follow-ups in this view yet.')).toBeTruthy()
  })
})
