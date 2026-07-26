import type { FormEvent } from 'react'
import type { ApplicationStage, ApplicationEditState } from '../types'

type ApplicationEditFormProps = {
  editState: ApplicationEditState
  stages: readonly ApplicationStage[]
  onSaveEdit: (event: FormEvent<HTMLFormElement>) => void
  onCancelEdit: () => void
  onEditStateChange: <Key extends keyof ApplicationEditState>(
    key: Key,
    value: ApplicationEditState[Key],
  ) => void
}

export function ApplicationEditForm({
  editState,
  stages,
  onSaveEdit,
  onCancelEdit,
  onEditStateChange,
}: ApplicationEditFormProps) {
  return (
    <form className="detail-edit-form" onSubmit={onSaveEdit}>
      <div className="detail-edit-form-heading">
        <div>
          <h3>Edit application</h3>
          <p>Correct details or move the opportunity to a new stage without leaving the board.</p>
        </div>
        <div className="detail-edit-actions">
          <button type="button" className="secondary-action" onClick={onCancelEdit}>
            Cancel
          </button>
          <button type="submit" className="primary-action">
            Save changes
          </button>
        </div>
      </div>

      <div className="detail-edit-grid">
        <label>
          Company
          <input
            value={editState.company}
            onChange={(event) => onEditStateChange('company', event.target.value)}
            required
          />
        </label>
        <label>
          Role
          <input
            value={editState.role}
            onChange={(event) => onEditStateChange('role', event.target.value)}
            required
          />
        </label>
        <label>
          Stage
          <select
            value={editState.stage}
            onChange={(event) => onEditStateChange('stage', event.target.value as ApplicationStage)}
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
            value={editState.location}
            onChange={(event) => onEditStateChange('location', event.target.value)}
          />
        </label>
        <label>
          Compensation
          <input
            value={editState.salary}
            onChange={(event) => onEditStateChange('salary', event.target.value)}
          />
        </label>
        <label>
          Next step
          <input
            value={editState.nextStep}
            onChange={(event) => onEditStateChange('nextStep', event.target.value)}
          />
        </label>
        <label>
          Contact
          <input
            value={editState.contact}
            onChange={(event) => onEditStateChange('contact', event.target.value)}
          />
        </label>
        <label>
          Contact role
          <input
            value={editState.contactRole}
            onChange={(event) => onEditStateChange('contactRole', event.target.value)}
          />
        </label>
        <label className="application-form-note">
          Notes
          <textarea
            value={editState.notes}
            onChange={(event) => onEditStateChange('notes', event.target.value)}
            rows={4}
          />
        </label>
      </div>
    </form>
  )
}
