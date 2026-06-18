import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { ComponentProps, FormEvent } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApplicationForm } from './ApplicationForm'
import type { ApplicationFormState } from '../types'
import { stages } from '../data'

const defaultFormState: ApplicationFormState = {
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

function createProps(overrides: Partial<ComponentProps<typeof ApplicationForm>> = {}) {
  return {
    formState: defaultFormState,
    stages,
    onFormChange: vi.fn(),
    onSubmit: vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault()),
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('ApplicationForm', () => {
  it('renders the form heading and save button', () => {
    render(<ApplicationForm {...createProps()} />)

    expect(screen.getByText('Add application')).toBeTruthy()
    expect(
      screen.getByText('Capture a new opportunity and attach the first follow-up in one step.'),
    ).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Save application' })).toBeTruthy()
  })

  it('renders all text inputs and textarea with correct placeholder text', () => {
    render(<ApplicationForm {...createProps()} />)

    expect(screen.getByPlaceholderText('Northwind Systems')).toBeTruthy()
    expect(screen.getByPlaceholderText('Frontend Engineer')).toBeTruthy()
    expect(screen.getByPlaceholderText('Remote · EU')).toBeTruthy()
    expect(screen.getByPlaceholderText('€70k - €85k')).toBeTruthy()
    expect(screen.getByPlaceholderText('Send portfolio follow-up')).toBeTruthy()
    expect(screen.getByPlaceholderText('Mina Shah')).toBeTruthy()
    expect(screen.getByPlaceholderText('Recruiter')).toBeTruthy()
    expect(screen.getByPlaceholderText('Share tailored resume')).toBeTruthy()
    expect(screen.getByPlaceholderText('Tomorrow · 09:00')).toBeTruthy()
    expect(
      screen.getByPlaceholderText(
        'Why this role matters, prep reminders, or resume tailoring notes',
      ),
    ).toBeTruthy()
  })

  it('marks company and role as required', () => {
    render(<ApplicationForm {...createProps()} />)

    const companyInput = screen.getByPlaceholderText('Northwind Systems') as HTMLInputElement
    const roleInput = screen.getByPlaceholderText('Frontend Engineer') as HTMLInputElement

    expect(companyInput.getAttribute('required')).not.toBeNull()
    expect(roleInput.getAttribute('required')).not.toBeNull()
  })

  it('renders all stage options in the select element', () => {
    render(<ApplicationForm {...createProps()} />)

    const select = screen.getByLabelText('Stage') as HTMLSelectElement
    const options = within(select.parentElement!).getAllByRole('option')

    expect(options).toHaveLength(stages.length)
    stages.forEach((stage, index) => {
      expect(options[index].textContent).toContain(stage)
    })
  })

  it('renders the default stage as the selected option', () => {
    render(
      <ApplicationForm
        {...createProps({
          formState: { ...defaultFormState, stage: 'Applied' },
        })}
      />,
    )

    const select = screen.getByLabelText('Stage') as HTMLSelectElement
    expect(select.value).toBe('Applied')
  })

  it('calls onFormChange when typing in the company field', () => {
    const onFormChange = vi.fn()
    render(<ApplicationForm {...createProps({ onFormChange })} />)

    const companyInput = screen.getByPlaceholderText('Northwind Systems')
    fireEvent.change(companyInput, { target: { value: 'Acme Corp' } })

    expect(onFormChange).toHaveBeenCalledWith('company', 'Acme Corp')
  })

  it('calls onFormChange when typing in the role field', () => {
    const onFormChange = vi.fn()
    render(<ApplicationForm {...createProps({ onFormChange })} />)

    const roleInput = screen.getByPlaceholderText('Frontend Engineer')
    fireEvent.change(roleInput, { target: { value: 'Senior Dev' } })

    expect(onFormChange).toHaveBeenCalledWith('role', 'Senior Dev')
  })

  it('calls onFormChange when selecting a different stage', () => {
    const onFormChange = vi.fn()
    render(<ApplicationForm {...createProps({ onFormChange })} />)

    const select = screen.getByLabelText('Stage')
    fireEvent.change(select, { target: { value: 'Interviewing' } })

    expect(onFormChange).toHaveBeenCalledWith('stage', 'Interviewing')
  })

  it('calls onFormChange for location, compensation, and next step inputs', () => {
    const onFormChange = vi.fn()
    render(<ApplicationForm {...createProps({ onFormChange })} />)

    const locationInput = screen.getByPlaceholderText('Remote · EU')
    fireEvent.change(locationInput, { target: { value: 'Remote · US' } })
    expect(onFormChange).toHaveBeenCalledWith('location', 'Remote · US')

    const compInput = screen.getByPlaceholderText('€70k - €85k')
    fireEvent.change(compInput, { target: { value: '$120k' } })
    expect(onFormChange).toHaveBeenCalledWith('salary', '$120k')

    const nextStepInput = screen.getByPlaceholderText('Send portfolio follow-up')
    fireEvent.change(nextStepInput, { target: { value: 'Call recruiter' } })
    expect(onFormChange).toHaveBeenCalledWith('nextStep', 'Call recruiter')
  })

  it('calls onFormChange for the notes textarea', () => {
    const onFormChange = vi.fn()
    render(<ApplicationForm {...createProps({ onFormChange })} />)

    const notesTextarea = screen.getByPlaceholderText(
      'Why this role matters, prep reminders, or resume tailoring notes',
    )
    fireEvent.change(notesTextarea, { target: { value: 'Important notes here' } })

    expect(onFormChange).toHaveBeenCalledWith('notes', 'Important notes here')
  })

  it('calls onSubmit when the form is submitted', () => {
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault())
    render(<ApplicationForm {...createProps({ onSubmit })} />)

    const form = screen.getByRole('button', { name: 'Save application' }).closest('form')!
    fireEvent.submit(form)

    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('displays the current form state values in the inputs', () => {
    const populatedState: ApplicationFormState = {
      company: 'Acme Corp',
      role: 'Senior Engineer',
      stage: 'Interviewing',
      location: 'Remote · US',
      salary: '$150k',
      nextStep: 'Technical screen',
      contact: 'John Smith',
      contactRole: 'Hiring Manager',
      notes: 'Great opportunity',
      followUpTitle: 'Follow up on interview',
      followUpDueLabel: 'Next week',
    }

    render(<ApplicationForm {...createProps({ formState: populatedState })} />)

    const inputs = {
      company: screen.getByPlaceholderText('Northwind Systems') as HTMLInputElement,
      role: screen.getByPlaceholderText('Frontend Engineer') as HTMLInputElement,
      location: screen.getByPlaceholderText('Remote · EU') as HTMLInputElement,
      salary: screen.getByPlaceholderText('€70k - €85k') as HTMLInputElement,
      contact: screen.getByPlaceholderText('Mina Shah') as HTMLInputElement,
    }

    expect(inputs.company.value).toBe('Acme Corp')
    expect(inputs.role.value).toBe('Senior Engineer')
    expect(inputs.location.value).toBe('Remote · US')
    expect(inputs.salary.value).toBe('$150k')
    expect(inputs.contact.value).toBe('John Smith')

    const select = screen.getByLabelText('Stage') as HTMLSelectElement
    expect(select.value).toBe('Interviewing')
  })

  it('handles the follow-up fields correctly', () => {
    const onFormChange = vi.fn()

    render(<ApplicationForm {...createProps({ onFormChange })} />)

    const followUpInput = screen.getByPlaceholderText('Share tailored resume')
    fireEvent.change(followUpInput, { target: { value: 'Send portfolio' } })
    expect(onFormChange).toHaveBeenCalledWith('followUpTitle', 'Send portfolio')

    const timingInput = screen.getByPlaceholderText('Tomorrow · 09:00')
    fireEvent.change(timingInput, { target: { value: 'Friday' } })
    expect(onFormChange).toHaveBeenCalledWith('followUpDueLabel', 'Friday')
  })
})
