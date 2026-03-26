export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
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
