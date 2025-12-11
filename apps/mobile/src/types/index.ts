export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export interface ErrorResponse {
  error: string;
  details?: Record<string, unknown>;
  statusCode: number;
}
