import type { FormEvent } from 'react'
import type { Application, ApplicationStage, ApplicationEditState, FollowUp } from '../types'
import type { FollowUpFilter, FollowUpEditState, FollowUpFormState } from '../types'
import { Detail } from './Detail'
import { ApplicationEditForm } from './ApplicationEditForm'
import { FollowUpList } from './FollowUpList'

export type { ApplicationEditState }

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
  onRescheduleFollowUp: (
    followUpId: number,
    status: Exclude<FollowUp['status'], 'completed'>,
  ) => void
  onToggleFollowUpCompletion: (followUp: FollowUp) => void
  onDelete?: () => void
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
  onDelete,
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
        <ApplicationEditForm
          editState={editState}
          stages={stages}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onEditStateChange={onEditStateChange}
        />
      ) : (
        <>
          <div className="detail-panel-actions">
            <button type="button" className="secondary-action" onClick={onStartEdit}>
              Edit application
            </button>
            {onDelete && (
              <button
                type="button"
                className="secondary-action danger"
                onClick={() => {
                  if (window.confirm(`Delete application for ${application.company}?`)) {
                    onDelete()
                  }
                }}
              >
                Delete application
              </button>
            )}
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
