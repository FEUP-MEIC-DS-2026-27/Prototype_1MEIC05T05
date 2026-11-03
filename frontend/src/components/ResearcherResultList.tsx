import { Link } from 'react-router-dom'

import { copy, memberStatusLabel, type SearchHit } from '../shared'
import StatusMessage from './StatusMessage'

export default function ResearcherResultList({
  results,
  basePath,
  emptyMessage,
}: {
  results: readonly SearchHit[]
  basePath: string
  emptyMessage: string | null
}) {
  if (emptyMessage) {
    return (
      <div>
        <StatusMessage variant="empty" message={emptyMessage} />
        {emptyMessage === copy.noMatch ? (
          <p className="text-body-secondary small mt-2 mb-0">{copy.recoveryHint}</p>
        ) : null}
      </div>
    )
  }

  return (
    <ul className="list-group">
      {results.map((row) => (
        <li key={row.id} className="list-group-item">
          <Link to={`${basePath}/${row.id}`} className="text-decoration-none text-body d-flex flex-column gap-1">
            <span className="d-flex justify-content-between align-items-center gap-2">
              <span className="fw-medium text-truncate">{row.name}</span>
              <span className="badge text-bg-light border">{memberStatusLabel[row.memberStatus]}</span>
            </span>
            <span className="d-flex flex-wrap gap-3 small text-body-secondary">
              <span>{row.role}</span>
              <span>{row.teamName}</span>
              {row.reasons.map((reason) => (
                <span key={reason.field}>{`${reason.label} · ${reason.values.join(', ')}`}</span>
              ))}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
