export interface PaginatedResponse<T> {
  items: T[];
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorResponse {
  error: {
    status: number;
    message: string;
  };
}

export interface ApiResult<T> {
  data: T;
  headers: Headers;
  status: number;
}
