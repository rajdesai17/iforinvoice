type LogMeta = Record<string, unknown>;

export function logServerError(
  context: string,
  error: unknown,
  meta: LogMeta = {},
) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(
    JSON.stringify({
      level: "error",
      context,
      message,
      stack,
      ...meta,
      timestamp: new Date().toISOString(),
    }),
  );
}
