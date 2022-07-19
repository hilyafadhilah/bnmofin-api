export interface CollectionResponse<T> {
  meta: {
    page: number,
    pageSize: number,
    totalItems: number,
    totalPages: number,
  },
  data: Array<T>
}
