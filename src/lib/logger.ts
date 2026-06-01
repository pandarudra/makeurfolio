// --------------------------------------------------------------------------
// Structured Logger
// --------------------------------------------------------------------------
// Wraps console with service-tagged, timestamped output. Tracks execution
// duration via time/timeEnd. Zero external dependencies.
// --------------------------------------------------------------------------

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

const timers = new Map<string, number>();

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatMessage(
  level: LogLevel,
  service: string,
  message: string,
  context?: Record<string, unknown>
): string {
  const timestamp = formatTimestamp();
  const contextStr = context
    ? ` | ${JSON.stringify(context)}`
    : "";
  return `${timestamp} [${level}] [${service}] ${message}${contextStr}`;
}

export const logger = {
  info(service: string, message: string, context?: Record<string, unknown>): void {
    console.log(formatMessage("INFO", service, message, context));
  },

  warn(service: string, message: string, context?: Record<string, unknown>): void {
    console.warn(formatMessage("WARN", service, message, context));
  },

  error(
    service: string,
    message: string,
    error?: unknown,
    context?: Record<string, unknown>
  ): void {
    const errorContext = error instanceof Error
      ? { errorName: error.name, errorMessage: error.message, ...context }
      : { error: String(error), ...context };
    console.error(formatMessage("ERROR", service, message, errorContext));
  },

  debug(service: string, message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(formatMessage("DEBUG", service, message, context));
    }
  },

  time(label: string): void {
    timers.set(label, performance.now());
  },

  timeEnd(service: string, label: string): number {
    const start = timers.get(label);
    if (!start) {
      logger.warn(service, `Timer "${label}" does not exist`);
      return 0;
    }
    timers.delete(label);
    const duration = Math.round(performance.now() - start);
    logger.info(service, `${label} completed in ${duration}ms`, { durationMs: duration });
    return duration;
  },
};
