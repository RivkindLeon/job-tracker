import type { FormEvent } from 'react'
import type { Application, ApplicationStage, FollowUp } from '../data'
import { Detail } from './Detail'
import {
  FollowUpList,
  type FollowUpFilter,
  type FollowUpEditState,
  type FollowUpFormState,
} from './FollowUpList'

export type ApplicationEditState = {
  company: string
  role: string
  stage: ApplicationStage
  location: string
  salary: string
  nextStep: string
  contact: string
  contactRole: string
  notes: string
}

type ApplicationDetailProps = {
  application: Application
  stages: readonly ApplicationStage[]
  isEditing: boolean
  editState: ApplicationEditState
  followUps: FollowUp[]
  visibleFollowUps: FollowUp[]
  followUpSummary: {
    all: number
    open: number
    completed: number
  }
  followUpFilter: FollowUpFilter
  nextOpenFollowUp: FollowUp | null
  editingFollowUpId: number | null
  followUpEditState: FollowUpEditState
  followUpFormState: FollowUpFormState
  onStartEdit: () => void
  onSaveEdit: (event: FormEvent<HTMLFormElement>) => void
  onCancelEdit: () => void
  onEditStateChange: <Key extends keyof ApplicationEditState>(
    key: Key,
    value: ApplicationEditState[Key],
  ) => void
  onFollowUpFilterChange: (filter: FollowUpFilter) => void
  onStartFollowUpEdit: (followUp: FollowUp) => void
  onSaveFollowUpEdit: (event: FormEvent<HTMLFormElement>) => void
  onCancelFollowUpEdit: () => void
  onFollowUpEditStateChange: <Key extends keyof FollowUpEditState>(
    key: Key,
    value: FollowUpEditState[Key],
  ) => void
  onFollowUpFormStateChange: <Key extends keyof FollowUpFormState>(
    key: Key,
    value: FollowUpFormState[Key],
  ) => void
  onCreateFollowUp: (event: FormEvent<HTMLFormElement>) => void
  onApplyFollowUpPreset: (status: FollowUpFormState['status']) => void
  onRescheduleFollowUp: (followUpId: number, status: Exclude<FollowUp['status'], 'completed'>) => void
  onToggleFollowUpCompletion: (followUp: FollowUp) => void
}

export function ApplicationDetail({
  application,
  stages,
  isEditing,
  editState,
  followUps,
  visibleFollowUps,
  followUpSummary,
  followUpFilter,
  nextOpenFollowUp,
  editingFollowUpId,
  followUpEditState,
  followUpFormState,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditStateChange,
  onFollowUpFilterChange,
  onStartFollowUpEdit,
  onSaveFollowUpEdit,
  onCancelFollowUpEdit,
  onFollowUpEditStateChange,
  onFollowUpFormStateChange,
  onCreateFollowUp,
  onApplyFollowUpPreset,
  onRescheduleFollowUp,
  onToggleFollowUpCompletion,
}: ApplicationDetailProps) {
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="section-label">Selected application</p>
          <h2>{application.role}</h2>
        </div>
        <span className="pill muted">{application.stage}</span>
      </div>

      {isEditing ? (
        <form className="detail-edit-form" onSubmit={onSaveEdit}>
          <div className="detail-edit-form-heading">
            <div>
              <h3>Edit application</h3>
              <p>
                Correct details or move the opportunity to a new stage without leaving the board.
              </p>
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
                onChange={(event) =>
                  onEditStateChange('stage', event.target.value as ApplicationStage)
                }
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
      ) : (
        <>
          <div className="detail-panel-actions">
            <button type="button" className="secondary-action" onClick={onStartEdit}>
              Edit application
            </button>
          </div>

          <dl className="detail-grid">
            <Detail label="Company" value={application.company} />
            <Detail label="Location" value={application.location} />
            <Detail label="Compensation" value={application.salary} />
            <Detail label="Applied on" value={application.appliedOn} />
            <Detail label="Resume used" value={application.resume} />
            <Detail
              label="Primary contact"
              value={`${application.contact} · ${application.contactRole}`}
            />
          </dl>

          <div className="note-card">
            <h3>Next step</h3>
            <p>{application.nextStep}</p>
          </div>

          <div className="note-card">
            <h3>Application notes</h3>
            <p>{application.notes}</p>
          </div>

          <FollowUpList
            followUps={followUps}
            visibleFollowUps={visibleFollowUps}
            followUpSummary={followUpSummary}
            followUpFilter={followUpFilter}
            nextOpenFollowUp={nextOpenFollowUp}
            editingFollowUpId={editingFollowUpId}
            followUpEditState={followUpEditState}
            followUpFormState={followUpFormState}
            onFilterChange={onFollowUpFilterChange}
            onStartEdit={onStartFollowUpEdit}
            onSaveEdit={onSaveFollowUpEdit}
            onCancelEdit={onCancelFollowUpEdit}
            onEditStateChange={onFollowUpEditStateChange}
            onFormStateChange={onFollowUpFormStateChange}
            onCreateFollowUp={onCreateFollowUp}
            onApplyPreset={onApplyFollowUpPreset}
            onReschedule={onRescheduleFollowUp}
            onToggleCompletion={onToggleFollowUpCompletion}
          />
        </>
      )}
    </>
  )
}
