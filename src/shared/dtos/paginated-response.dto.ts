export interface PaginatedResponseDto<T> {
  items: T[];
  total: number;
}