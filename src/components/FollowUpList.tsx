import type { FormEvent } from 'react'
import type {
  FollowUp,
  FollowUpFilter,
  FollowUpEditState,
  FollowUpFormState,
  FollowUpStatus,
} from '../types'
import { followUpLabels } from '../constants'

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

      <div className="follow-up-planner-card">
        <div>
          <p className="section-label">Planning snapshot</p>
          <h4>{nextOpenFollowUp ? nextOpenFollowUp.title : 'No open follow-up queued'}</h4>
          <p className="planner-copy">
            {nextOpenFollowUp
              ? `${followUpLabels[nextOpenFollowUp.status]} · ${nextOpenFollowUp.dueLabel}${nextOpenFollowUp.context ? ` · ${nextOpenFollowUp.context}` : ''}`
              : 'Everything for this application is currently completed.'}
          </p>
        </div>
        <div className="planner-metrics" aria-label="Follow-up urgency summary">
          <span className="planner-pill due-today">
            Due today {followUps.filter((followUp) => followUp.status === 'due-today').length}
          </span>
          <span className="planner-pill this-week">
            This week {followUps.filter((followUp) => followUp.status === 'this-week').length}
          </span>
          <span className="planner-pill waiting">
            Waiting {followUps.filter((followUp) => followUp.status === 'waiting').length}
          </span>
        </div>
      </div>

      <div className="follow-up-filter-bar" aria-label="Filter follow-ups by status">
        {(
          [
            ['open', `Open ${followUpSummary.open}`],
            ['completed', `Completed ${followUpSummary.completed}`],
            ['all', `All ${followUpSummary.all}`],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`filter-chip ${followUpFilter === value ? 'active' : ''}`}
            onClick={() => onFilterChange(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <form className="follow-up-create-form" onSubmit={onCreateFollowUp}>
        <div className="follow-up-preset-bar" aria-label="Apply a quick follow-up timing preset">
          {(
            [
              ['due-today', 'Set for today'],
              ['this-week', 'Plan this week'],
              ['waiting', 'Mark as waiting'],
            ] as const
          ).map(([status, label]) => (
            <button
              key={status}
              type="button"
              className={`filter-chip ${followUpFormState.status === status ? 'active' : ''}`}
              onClick={() => onApplyPreset(status)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="follow-up-create-fields">
          <label>
            Title
            <input
              value={followUpFormState.title}
              onChange={(event) => onFormStateChange('title', event.target.value)}
              placeholder="Send thank-you note"
              required
            />
          </label>
          <label>
            Timing
            <input
              value={followUpFormState.dueLabel}
              onChange={(event) => onFormStateChange('dueLabel', event.target.value)}
              placeholder="Tomorrow · 10:00"
            />
          </label>
          <label>
            Status
            <select
              value={followUpFormState.status}
              onChange={(event) =>
                onFormStateChange('status', event.target.value as FollowUpFormState['status'])
              }
            >
              <option value="due-today">Due today</option>
              <option value="this-week">This week</option>
              <option value="waiting">Waiting</option>
            </select>
          </label>
          <label>
            Context
            <input
              value={followUpFormState.context}
              onChange={(event) => onFormStateChange('context', event.target.value)}
              placeholder="Interview prep"
            />
          </label>
        </div>
        <button type="submit" className="primary-action">
          Add follow-up
        </button>
      </form>

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
                    {(
                      [
                        ['due-today', 'Today'],
                        ['this-week', 'Week'],
                        ['waiting', 'Waiting'],
                      ] as const
                    ).map(([status, label]) => (
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
