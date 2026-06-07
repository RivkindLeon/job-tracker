import type { FormEvent } from 'react'
import type { ApplicationStage } from '../types'
import type { ApplicationFormState } from '../types'

export type { ApplicationFormState }

type ApplicationFormProps = {
  formState: ApplicationFormState
  stages: readonly ApplicationStage[]
  onFormChange: <Key extends keyof ApplicationFormState>(
    key: Key,
    value: ApplicationFormState[Key],
  ) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function ApplicationForm({
  formState,
  stages,
  onFormChange,
  onSubmit,
}: ApplicationFormProps) {
  return (
    <form className="application-form" onSubmit={onSubmit}>
      <div className="application-form-heading">
        <div>
          <h3>Add application</h3>
          <p>Capture a new opportunity and attach the first follow-up in one step.</p>
        </div>
        <button type="submit" className="primary-action">
          Save application
        </button>
      </div>

      <div className="application-form-grid">
        <label>
          Company
          <input
            value={formState.company}
            onChange={(event) => onFormChange('company', event.target.value)}
            placeholder="Northwind Systems"
            required
          />
        </label>
        <label>
          Role
          <input
            value={formState.role}
            onChange={(event) => onFormChange('role', event.target.value)}
            placeholder="Frontend Engineer"
            required
          />
        </label>
        <label>
          Stage
          <select
            value={formState.stage}
            onChange={(event) => onFormChange('stage', event.target.value as ApplicationStage)}
          >
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </label>
        <label>
          Location
          <input
            value={formState.location}
            onChange={(event) => onFormChange('location', event.target.value)}
            placeholder="Remote · EU"
          />
        </label>
        <label>
          Compensation
          <input
            value={formState.salary}
            onChange={(event) => onFormChange('salary', event.target.value)}
            placeholder="€70k - €85k"
          />
        </label>
        <label>
          Next step
          <input
            value={formState.nextStep}
            onChange={(event) => onFormChange('nextStep', event.target.value)}
            placeholder="Send portfolio follow-up"
          />
        </label>
        <label>
          Contact
          <input
            value={formState.contact}
            onChange={(event) => onFormChange('contact', event.target.value)}
            placeholder="Mina Shah"
          />
        </label>
        <label>
          Contact role
          <input
            value={formState.contactRole}
            onChange={(event) => onFormChange('contactRole', event.target.value)}
            placeholder="Recruiter"
          />
        </label>
        <label>
          First follow-up
          <input
            value={formState.followUpTitle}
            onChange={(event) => onFormChange('followUpTitle', event.target.value)}
            placeholder="Share tailored resume"
          />
        </label>
        <label>
          Follow-up timing
          <input
            value={formState.followUpDueLabel}
            onChange={(event) => onFormChange('followUpDueLabel', event.target.value)}
            placeholder="Tomorrow · 09:00"
          />
        </label>
        <label className="application-form-note">
          Notes
          <textarea
            value={formState.notes}
            onChange={(event) => onFormChange('notes', event.target.value)}
            placeholder="Why this role matters, prep reminders, or resume tailoring notes"
            rows={4}
          />
        </label>
      </div>
    </form>
  )
}
