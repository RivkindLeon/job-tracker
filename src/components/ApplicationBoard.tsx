import type { Application, ApplicationStage } from '../types'

type ApplicationsByStage = {
  stage: ApplicationStage
  items: Application[]
}

type ApplicationBoardProps = {
  applicationsByStage: ApplicationsByStage[]
  selectedApplicationId: number | undefined
  onSelectApplication: (id: number) => void
}

export function ApplicationBoard({
  applicationsByStage,
  selectedApplicationId,
  onSelectApplication,
}: ApplicationBoardProps) {
  return (
    <div className="board-grid">
      {applicationsByStage.map((column) => (
        <article key={column.stage} className="stage-column">
          <div className="stage-header">
            <h3>{column.stage}</h3>
            <span>{column.items.length}</span>
          </div>
          <div className="stage-cards">
            {column.items.map((application) => (
              <button
                key={application.id}
                type="button"
                className={`application-card ${
                  application.id === selectedApplicationId ? 'selected' : ''
                }`}
                onClick={() => onSelectApplication(application.id)}
              >
                <strong>{application.role}</strong>
                <span>{application.company}</span>
                <small>{application.nextStep}</small>
              </button>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}
