// --------------------------------------------------------------------------
// Shared API Types
// --------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    context?: Record<string, unknown>;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

export interface GenerationProgress {
  generationId: string;
  status: string;
  progress: number;
  portfolioId?: string | null;
  portfolioSlug?: string | null;
  errorMessage?: string | null;
}
