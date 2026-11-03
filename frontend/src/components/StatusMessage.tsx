type StatusMessageProps =
  | {
      variant: 'loading'
      message?: string
      onRetry?: never
    }
  | {
      variant: 'error'
      message: string
      onRetry?: () => void
    }
  | {
      variant: 'empty'
      message: string
      onRetry?: never
    }

export default function StatusMessage({ variant, message, onRetry }: StatusMessageProps) {
  if (variant === 'loading') {
    return (
      <div className="d-flex align-items-center gap-2">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading</span>
        </div>
        {message ? <span>{message}</span> : null}
      </div>
    )
  }

  if (variant === 'error') {
    return (
      <div className="alert alert-danger" role="alert">
        <p className="mb-2">{message}</p>
        {onRetry ? (
          <button type="button" className="btn btn-outline-danger" onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </div>
    )
  }

  return <p className="text-body-secondary mb-0">{message}</p>
}
