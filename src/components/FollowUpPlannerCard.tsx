import type { FollowUp } from '../types'
import { followUpLabels } from '../constants'

type FollowUpPlannerCardProps = {
  followUps: FollowUp[]
  nextOpenFollowUp: FollowUp | null
}

export function FollowUpPlannerCard({ followUps, nextOpenFollowUp }: FollowUpPlannerCardProps) {
  const nextOpenLabel = nextOpenFollowUp
    ? `${followUpLabels[nextOpenFollowUp.status]} · ${nextOpenFollowUp.dueLabel}${nextOpenFollowUp.context ? ` · ${nextOpenFollowUp.context}` : ''}`
    : null

  return (
    <div className="follow-up-planner-card">
      <div>
        <p className="section-label">Planning snapshot</p>
        <h4>{nextOpenFollowUp ? nextOpenFollowUp.title : 'No open follow-up queued'}</h4>
        <p className="planner-copy">
          {nextOpenFollowUp
            ? nextOpenLabel
            : 'Everything for this application is currently completed.'}
        </p>
      </div>
      <div className="planner-metrics" aria-label="Follow-up urgency summary">
        <span className="planner-pill due-today">
          Due today {followUps.filter((f) => f.status === 'due-today').length}
        </span>
        <span className="planner-pill this-week">
          This week {followUps.filter((f) => f.status === 'this-week').length}
        </span>
        <span className="planner-pill waiting">
          Waiting {followUps.filter((f) => f.status === 'waiting').length}
        </span>
      </div>
    </div>
  )
}
