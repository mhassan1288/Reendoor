import type { Priority, RequestStatus, ServiceRequest } from '../types'

export function StatusPill({ status }: { status: RequestStatus }) {
  const cls =
    status === 'Open'
      ? 'open'
      : status === 'Quoted'
        ? 'quoted'
        : status === 'Accepted'
          ? 'accepted'
          : status === 'Completed'
            ? 'completed'
            : 'progress'
  return <span className={`pill ${cls}`}>{status}</span>
}

export function PriorityPill({ priority }: { priority: Priority }) {
  return <span className="prio">{priority} priority</span>
}

export function ServiceRequestCard({
  request,
  onClick,
}: {
  request: ServiceRequest
  onClick: () => void
}) {
  return (
    <button type="button" className="card" onClick={onClick}>
      <h3>{request.title}</h3>
      <p className="type">{request.type}</p>
      <p className="addr">{request.address}</p>
      <div className="card-foot">
        <div className="pills">
          <StatusPill status={request.status} />
          <PriorityPill priority={request.priority} />
        </div>
        <span className="date">{request.date}</span>
      </div>
    </button>
  )
}
