export interface Paging {
  page: number
  pageSize: number
  total: number
}

export interface Paginated<T> {
  data: T[]
  paging: Paging
}

export function paginate<T>(data: T[], page: number, pageSize: number, total: number): Paginated<T> {
  return { data, paging: { page, pageSize, total } }
}

export function isPaginated(value: unknown): value is Paginated<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'paging' in value &&
    'data' in value &&
    Array.isArray((value as { data: unknown }).data)
  )
}
