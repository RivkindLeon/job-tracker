import { describe, expect, it, vi, afterEach } from 'vitest'
import type { Application, ApplicationFormState } from '../types'
import {
  applyApplicationEdits,
  buildApplicationFromForm,
  buildFollowUpFromForm,
  buildInitialFollowUpFromForm,
  defaultFormState,
  getFollowUpSchedulePreset,
  toggleFollowUpCompletion,
} from './jobTrackerStateHelpers'

afterEach(() => {
  vi.useRealTimers()
})

describe('jobTrackerStateHelpers', () => {
  it('builds a new application with fallback placeholders', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-10T18:30:00.000Z'))

    const formState: ApplicationFormState = {
      ...defaultFormState,
      company: '  Acme  ',
      role: ' Product Engineer ',
    }

    expect(buildApplicationFromForm(formState, 42)).toEqual({
      id: 42,
      company: 'Acme',
      role: 'Product Engineer',
      stage: 'Applied',
      location: 'Location to confirm',
      salary: 'Compensation not captured yet',
      appliedOn: '2026-06-10',
      nextStep: 'Define the next step for this opportunity',
      resume: 'Resume to attach',
      contact: 'Contact to add',
      contactRole: 'Role to confirm',
      notes: 'No notes added yet.',
    })
  })

  it('creates an initial follow-up only when the title is present', () => {
    expect(buildInitialFollowUpFromForm(defaultFormState, 7, 11)).toBeNull()

    const followUp = buildInitialFollowUpFromForm(
      {
        ...defaultFormState,
        followUpTitle: '  Send thank-you note ',
        followUpDueLabel: ' Tomorrow morning ',
      },
      7,
      11,
    )

    expect(followUp).toEqual({
      id: 11,
      applicationId: 7,
      title: 'Send thank-you note',
      dueLabel: 'Tomorrow morning',
      status: 'due-today',
      context: 'Initial outreach',
    })
  })

  it('updates appliedOn when an application moves into or out of wishlist', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-10T18:30:00.000Z'))

    const wishlistApplication: Application = {
      id: 3,
      company: 'Atlas Health',
      role: 'UI Platform Developer',
      stage: 'Wishlist',
      location: 'Remote',
      salary: '£70k',
      appliedOn: 'Not applied yet',
      nextStep: 'Tailor CV',
      resume: 'Resume v1',
      contact: 'Open role',
      contactRole: 'No contact yet',
      notes: 'Interesting team',
    }

    expect(
      applyApplicationEdits(wishlistApplication, {
        company: 'Atlas Health',
        role: 'UI Platform Developer',
        stage: 'Applied',
        location: 'Remote',
        salary: '£70k',
        nextStep: 'Submit application',
        contact: 'Recruiter',
        contactRole: 'Talent',
        notes: 'Ready to apply',
      }).appliedOn,
    ).toBe('2026-06-10')

    expect(
      applyApplicationEdits(
        { ...wishlistApplication, stage: 'Applied', appliedOn: '2026-06-01' },
        {
          company: 'Atlas Health',
          role: 'UI Platform Developer',
          stage: 'Wishlist',
          location: 'Remote',
          salary: '£70k',
          nextStep: 'Pause',
          contact: 'Recruiter',
          contactRole: 'Talent',
          notes: 'Revisit later',
        },
      ).appliedOn,
    ).toBe('Not applied yet')
  })

  it('uses schedule presets and completion timestamps for follow-up lifecycle changes', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-10T18:30:00.000Z'))

    expect(getFollowUpSchedulePreset('this-week')).toBe('This week · Choose a day')

    const createdFollowUp = buildFollowUpFromForm(
      {
        title: '  Prepare debrief  ',
        dueLabel: '',
        status: 'waiting',
        context: '  Interview loop  ',
      },
      3,
      9,
    )

    expect(createdFollowUp).toEqual({
      id: 9,
      applicationId: 3,
      title: 'Prepare debrief',
      dueLabel: 'Waiting on recruiter response',
      status: 'waiting',
      context: 'Interview loop',
    })

    const completed = toggleFollowUpCompletion(createdFollowUp)
    expect(completed.status).toBe('completed')
    expect(completed.dueLabel).toBe('Completed · 2026-06-10')

    expect(toggleFollowUpCompletion(completed)).toEqual({
      ...completed,
      status: 'due-today',
      dueLabel: 'Schedule follow-up date',
    })
  })
})
