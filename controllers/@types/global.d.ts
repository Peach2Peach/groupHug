declare type APISuccess = {
  success: true
}

declare type APIError<E> = {
  error: E | 'INTERNAL_SERVER_ERROR' | 'BAD_REQUEST' | 'TOO_MANY_REQUESTS'
  message?: string
  details?: any
}
