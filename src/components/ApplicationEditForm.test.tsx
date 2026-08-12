import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { ComponentProps, FormEvent } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApplicationEditForm } from './ApplicationEditForm'
import type { ApplicationEditState } from '../types'
import { stages } from '../data'

const defaultEditState: ApplicationEditState = {
  company: 'Acme Corp',
  role: 'Senior Engineer',
  stage: 'Interviewing',
  location: 'Remote · US',
  salary: '$150k',
  nextStep: 'Technical screen',
  contact: 'Jane Doe',
  contactRole: 'Hiring Manager',
  notes: 'Great opportunity at series B startup',
}

function createProps(overrides: Partial<ComponentProps<typeof ApplicationEditForm>> = {}) {
  return {
    editState: { ...defaultEditState },
    stages,
    onSaveEdit: vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault()),
    onCancelEdit: vi.fn(),
    onEditStateChange: vi.fn(),
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('ApplicationEditForm', () => {
  it('renders the form heading and description', () => {
    render(<ApplicationEditForm {...createProps()} />)

    expect(screen.getByText('Edit application')).toBeTruthy()
    expect(
      screen.getByText(
        'Correct details or move the opportunity to a new stage without leaving the board.',
      ),
    ).toBeTruthy()
  })

  it('renders cancel and save action buttons', () => {
    render(<ApplicationEditForm {...createProps()} />)

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeTruthy()
  })

  it('calls onCancelEdit when cancel button is clicked', () => {
    const onCancelEdit = vi.fn()
    render(<ApplicationEditForm {...createProps({ onCancelEdit })} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancelEdit).toHaveBeenCalledOnce()
  })

  it('calls onSaveEdit when the form is submitted', () => {
    const onSaveEdit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault())
    render(<ApplicationEditForm {...createProps({ onSaveEdit })} />)

    const form = document.querySelector('form.detail-edit-form')!
    fireEvent.submit(form)

    expect(onSaveEdit).toHaveBeenCalledOnce()
  })

  it('renders all text inputs with correct labels', () => {
    render(<ApplicationEditForm {...createProps()} />)

    expect(screen.getByLabelText('Company')).toBeTruthy()
    expect(screen.getByLabelText('Role')).toBeTruthy()
    expect(screen.getByLabelText('Location')).toBeTruthy()
    expect(screen.getByLabelText('Compensation')).toBeTruthy()
    expect(screen.getByLabelText('Next step')).toBeTruthy()
    expect(screen.getByLabelText('Contact')).toBeTruthy()
    expect(screen.getByLabelText('Contact role')).toBeTruthy()
    expect(screen.getByLabelText('Notes')).toBeTruthy()
  })

  it('displays the current edit state values in the inputs', () => {
    render(<ApplicationEditForm {...createProps()} />)

    const companyInput = screen.getByLabelText('Company') as HTMLInputElement
    const roleInput = screen.getByLabelText('Role') as HTMLInputElement
    const locationInput = screen.getByLabelText('Location') as HTMLInputElement
    const salaryInput = screen.getByLabelText('Compensation') as HTMLInputElement
    const nextStepInput = screen.getByLabelText('Next step') as HTMLInputElement
    const contactInput = screen.getByLabelText('Contact') as HTMLInputElement
    const contactRoleInput = screen.getByLabelText('Contact role') as HTMLInputElement
    const notesTextarea = screen.getByLabelText('Notes') as HTMLTextAreaElement

    expect(companyInput.value).toBe('Acme Corp')
    expect(roleInput.value).toBe('Senior Engineer')
    expect(locationInput.value).toBe('Remote · US')
    expect(salaryInput.value).toBe('$150k')
    expect(nextStepInput.value).toBe('Technical screen')
    expect(contactInput.value).toBe('Jane Doe')
    expect(contactRoleInput.value).toBe('Hiring Manager')
    expect(notesTextarea.value).toBe('Great opportunity at series B startup')
  })

  it('marks company and role as required', () => {
    render(<ApplicationEditForm {...createProps()} />)

    const companyInput = screen.getByLabelText('Company') as HTMLInputElement
    const roleInput = screen.getByLabelText('Role') as HTMLInputElement

    expect(companyInput.getAttribute('required')).not.toBeNull()
    expect(roleInput.getAttribute('required')).not.toBeNull()
  })

  it('renders all stage options in the select element', () => {
    render(<ApplicationEditForm {...createProps()} />)

    const select = screen.getByLabelText('Stage') as HTMLSelectElement
    const options = within(select.parentElement!).getAllByRole('option')

    expect(options).toHaveLength(stages.length)
    stages.forEach((stage, index) => {
      expect(options[index].textContent).toContain(stage)
    })
  })

  it('displays the current stage as selected', () => {
    render(<ApplicationEditForm {...createProps()} />)

    const select = screen.getByLabelText('Stage') as HTMLSelectElement
    expect(select.value).toBe('Interviewing')
  })

  it('calls onEditStateChange for company field edits', () => {
    const onEditStateChange = vi.fn()
    render(<ApplicationEditForm {...createProps({ onEditStateChange })} />)

    const companyInput = screen.getByLabelText('Company')
    fireEvent.change(companyInput, { target: { value: 'New Co' } })

    expect(onEditStateChange).toHaveBeenCalledWith('company', 'New Co')
  })

  it('calls onEditStateChange for role field edits', () => {
    const onEditStateChange = vi.fn()
    render(<ApplicationEditForm {...createProps({ onEditStateChange })} />)

    const roleInput = screen.getByLabelText('Role')
    fireEvent.change(roleInput, { target: { value: 'Staff Engineer' } })

    expect(onEditStateChange).toHaveBeenCalledWith('role', 'Staff Engineer')
  })

  it('calls onEditStateChange when stage select changes', () => {
    const onEditStateChange = vi.fn()
    render(<ApplicationEditForm {...createProps({ onEditStateChange })} />)

    const select = screen.getByLabelText('Stage')
    fireEvent.change(select, { target: { value: 'Offer' } })

    expect(onEditStateChange).toHaveBeenCalledWith('stage', 'Offer')
  })

  it('calls onEditStateChange for optional text fields', () => {
    const onEditStateChange = vi.fn()
    render(<ApplicationEditForm {...createProps({ onEditStateChange })} />)

    const locationInput = screen.getByLabelText('Location')
    fireEvent.change(locationInput, { target: { value: 'On-site SF' } })
    expect(onEditStateChange).toHaveBeenCalledWith('location', 'On-site SF')

    const salaryInput = screen.getByLabelText('Compensation')
    fireEvent.change(salaryInput, { target: { value: '$200k' } })
    expect(onEditStateChange).toHaveBeenCalledWith('salary', '$200k')

    const nextStepInput = screen.getByLabelText('Next step')
    fireEvent.change(nextStepInput, { target: { value: 'Final round' } })
    expect(onEditStateChange).toHaveBeenCalledWith('nextStep', 'Final round')

    const contactInput = screen.getByLabelText('Contact')
    fireEvent.change(contactInput, { target: { value: 'Bob Smith' } })
    expect(onEditStateChange).toHaveBeenCalledWith('contact', 'Bob Smith')

    const contactRoleInput = screen.getByLabelText('Contact role')
    fireEvent.change(contactRoleInput, { target: { value: 'Engineering Lead' } })
    expect(onEditStateChange).toHaveBeenCalledWith('contactRole', 'Engineering Lead')
  })

  it('calls onEditStateChange for notes textarea edits', () => {
    const onEditStateChange = vi.fn()
    render(<ApplicationEditForm {...createProps({ onEditStateChange })} />)

    const notesTextarea = screen.getByLabelText('Notes') as HTMLTextAreaElement
    fireEvent.change(notesTextarea, { target: { value: 'Updated notes here' } })

    expect(onEditStateChange).toHaveBeenCalledWith('notes', 'Updated notes here')
  })

  it('renders with empty initial edit state', () => {
    const emptyEditState: ApplicationEditState = {
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

    render(<ApplicationEditForm {...createProps({ editState: emptyEditState })} />)

    const companyInput = screen.getByLabelText('Company') as HTMLInputElement
    expect(companyInput.value).toBe('')

    const roleInput = screen.getByLabelText('Role') as HTMLInputElement
    expect(roleInput.value).toBe('')

    const notesTextarea = screen.getByLabelText('Notes') as HTMLTextAreaElement
    expect(notesTextarea.value).toBe('')

    const select = screen.getByLabelText('Stage') as HTMLSelectElement
    expect(select.value).toBe('Applied')
  })
})
