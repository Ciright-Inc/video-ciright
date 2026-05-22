export type PaginatedResult<T> = {
  items: T[];
  nextCursor?: string;
};

export function paginate<T extends { id: string }>(
  rows: T[],
  limit: number
): PaginatedResult<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;
  return { items, nextCursor };
}

export function paginateWithOffset<T>(
  rows: T[],
  limit: number,
  offset: number
): PaginatedResult<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextOffset = offset + items.length;
  const nextCursor = hasMore ? String(nextOffset) : undefined;
  return { items, nextCursor };
}
