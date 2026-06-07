import type { FormEvent } from 'react'
import type { FollowUpFormState } from '../types'

type FollowUpCreateFormProps = {
  followUpFormState: FollowUpFormState
  onCreateFollowUp: (event: FormEvent<HTMLFormElement>) => void
  onFormStateChange: <Key extends keyof FollowUpFormState>(
    key: Key,
    value: FollowUpFormState[Key],
  ) => void
  onApplyPreset: (status: FollowUpFormState['status']) => void
}

const presetOptions: {
  status: FollowUpFormState['status']
  label: string
}[] = [
  { status: 'due-today', label: 'Set for today' },
  { status: 'this-week', label: 'Plan this week' },
  { status: 'waiting', label: 'Mark as waiting' },
]

export function FollowUpCreateForm({
  followUpFormState,
  onCreateFollowUp,
  onFormStateChange,
  onApplyPreset,
}: FollowUpCreateFormProps) {
  return (
    <form className="follow-up-create-form" onSubmit={onCreateFollowUp}>
      <div className="follow-up-preset-bar" aria-label="Apply a quick follow-up timing preset">
        {presetOptions.map(({ status, label }) => (
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
  )
}
