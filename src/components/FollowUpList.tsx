import type { FormEvent } from 'react'
import type {
  FollowUp,
  FollowUpFilter,
  FollowUpEditState,
  FollowUpFormState,
  FollowUpStatus,
} from '../types'
import { followUpLabels } from '../constants'
import { FollowUpPlannerCard } from './FollowUpPlannerCard'
import { FollowUpCreateForm } from './FollowUpCreateForm'

const filterTabs: { value: FollowUpFilter; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'completed', label: 'Completed' },
  { value: 'all', label: 'All' },
]

const rescheduleOptions: {
  status: Exclude<FollowUpStatus, 'completed'>
  label: string
}[] = [
  { status: 'due-today', label: 'Today' },
  { status: 'this-week', label: 'Week' },
  { status: 'waiting', label: 'Waiting' },
]

type FollowUpListProps = {
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
  onFilterChange: (filter: FollowUpFilter) => void
  onStartEdit: (followUp: FollowUp) => void
  onSaveEdit: (event: FormEvent<HTMLFormElement>) => void
  onCancelEdit: () => void
  onEditStateChange: <Key extends keyof FollowUpEditState>(
    key: Key,
    value: FollowUpEditState[Key],
  ) => void
  onFormStateChange: <Key extends keyof FollowUpFormState>(
    key: Key,
    value: FollowUpFormState[Key],
  ) => void
  onCreateFollowUp: (event: FormEvent<HTMLFormElement>) => void
  onApplyPreset: (status: FollowUpFormState['status']) => void
  onReschedule: (followUpId: number, status: Exclude<FollowUpStatus, 'completed'>) => void
  onToggleCompletion: (followUp: FollowUp) => void
}

export function FollowUpList({
  followUps,
  visibleFollowUps,
  followUpSummary,
  followUpFilter,
  nextOpenFollowUp,
  editingFollowUpId,
  followUpEditState,
  followUpFormState,
  onFilterChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditStateChange,
  onFormStateChange,
  onCreateFollowUp,
  onApplyPreset,
  onReschedule,
  onToggleCompletion,
}: FollowUpListProps) {
  return (
    <div className="follow-up-list">
      <div className="follow-up-header">
        <h3>Follow-ups</h3>
        <span>{followUps.length}</span>
      </div>

      <FollowUpPlannerCard followUps={followUps} nextOpenFollowUp={nextOpenFollowUp} />

      <div className="follow-up-filter-bar" aria-label="Filter follow-ups by status">
        {filterTabs.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={`filter-chip ${followUpFilter === value ? 'active' : ''}`}
            onClick={() => onFilterChange(value)}
          >
            {label} {followUpSummary[value]}
          </button>
        ))}
      </div>

      <FollowUpCreateForm
        followUpFormState={followUpFormState}
        onCreateFollowUp={onCreateFollowUp}
        onFormStateChange={onFormStateChange}
        onApplyPreset={onApplyPreset}
      />

      {visibleFollowUps.length > 0 ? (
        visibleFollowUps.map((followUp) => {
          const isEditingFollowUp = followUp.id === editingFollowUpId

          return isEditingFollowUp ? (
            <form
              key={followUp.id}
              className="follow-up-item follow-up-edit-form"
              onSubmit={onSaveEdit}
            >
              <div className="follow-up-edit-fields">
                <label>
                  Title
                  <input
                    value={followUpEditState.title}
                    onChange={(event) => onEditStateChange('title', event.target.value)}
                    required
                  />
                </label>
                <label>
                  Timing
                  <input
                    value={followUpEditState.dueLabel}
                    onChange={(event) => onEditStateChange('dueLabel', event.target.value)}
                  />
                </label>
                <label>
                  Status
                  <select
                    value={followUpEditState.status}
                    onChange={(event) =>
                      onEditStateChange('status', event.target.value as FollowUpStatus)
                    }
                  >
                    {Object.entries(followUpLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Context
                  <input
                    value={followUpEditState.context}
                    onChange={(event) => onEditStateChange('context', event.target.value)}
                    placeholder="Interview prep"
                  />
                </label>
              </div>
              <div className="follow-up-edit-actions">
                <button type="button" className="secondary-action" onClick={onCancelEdit}>
                  Cancel
                </button>
                <button type="submit" className="primary-action">
                  Save follow-up
                </button>
              </div>
            </form>
          ) : (
            <div key={followUp.id} className="follow-up-item">
              <div>
                <div className="follow-up-item-heading">
                  <strong>{followUp.title}</strong>
                  {followUp.context ? (
                    <span className="context-chip">{followUp.context}</span>
                  ) : null}
                </div>
                <p>{followUp.dueLabel}</p>
              </div>
              <div className="follow-up-item-actions">
                <span className={`status-chip ${followUp.status}`}>
                  {followUpLabels[followUp.status]}
                </span>
                {followUp.status !== 'completed' ? (
                  <div className="follow-up-quick-actions" aria-label="Quick reschedule follow-up">
                    {rescheduleOptions.map(({ status, label }) => (
                      <button
                        key={status}
                        type="button"
                        className={`mini-chip ${followUp.status === status ? 'active' : ''}`}
                        onClick={() => onReschedule(followUp.id, status)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                ) : null}
                <button
                  type="button"
                  className="secondary-action follow-up-edit-button"
                  onClick={() => onToggleCompletion(followUp)}
                >
                  {followUp.status === 'completed' ? 'Reopen' : 'Complete'}
                </button>
                <button
                  type="button"
                  className="secondary-action follow-up-edit-button"
                  onClick={() => onStartEdit(followUp)}
                >
                  Edit
                </button>
              </div>
            </div>
          )
        })
      ) : (
        <p className="empty-state">
          {followUps.length === 0
            ? 'No follow-ups logged for this application yet.'
            : `No ${followUpFilter} follow-ups in this view yet.`}
        </p>
      )}
    </div>
  )
}
