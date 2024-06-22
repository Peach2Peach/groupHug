type APISuccess = {
  success: true;
};

type APIError<E> = {
  error: E | "INTERNAL_SERVER_ERROR" | "BAD_REQUEST" | "TOO_MANY_REQUESTS";
  message?: string;
  details?: unknown;
};
