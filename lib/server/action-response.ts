export type ActionSuccess<T> = {
  success: true;
  code: "OK";
  message: string;
  data: T;
};

export type ActionFailure = {
  success: false;
  code:
    | "UNAUTHORIZED"
    | "VALIDATION_ERROR"
    | "NOT_FOUND"
    | "CONFLICT"
    | "INTERNAL_ERROR";
  message: string;
  error: string;
};

export type ActionResult<T> = ActionSuccess<T> | ActionFailure;

export function ok<T>(message: string, data: T): ActionSuccess<T> {
  return {
    success: true,
    code: "OK",
    message,
    data,
  };
}

export function fail(
  code: ActionFailure["code"],
  message: string,
): ActionFailure {
  return {
    success: false,
    code,
    message,
    // Keep `error` for backwards compatibility in existing UI handlers.
    error: message,
  };
}
