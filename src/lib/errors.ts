// --------------------------------------------------------------------------
// Typed Error Hierarchy
// --------------------------------------------------------------------------
// Every service throws a specific error subclass. Route handlers catch these
// and translate to appropriate HTTP responses. Never throw generic Error.
// --------------------------------------------------------------------------

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly context: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    context: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.context = context;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toJSON(): Record<string, unknown> {
    return {
      error: this.code,
      message: this.message,
      statusCode: this.statusCode,
      ...(Object.keys(this.context).length > 0 ? { context: this.context } : {}),
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 400, "VALIDATION_ERROR", context);
  }
}

export class GithubError extends AppError {
  constructor(
    message: string,
    statusCode: number = 502,
    context: Record<string, unknown> = {}
  ) {
    super(message, statusCode, "GITHUB_ERROR", context);
  }
}

export class GeminiError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 502, "GEMINI_ERROR", context);
  }
}

export class ResumeParseError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 422, "RESUME_PARSE_ERROR", context);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier: string) {
    super(`${resource} not found: ${identifier}`, 404, "NOT_FOUND", {
      resource,
      identifier,
    });
  }
}
