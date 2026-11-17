'use client';
import { useState } from 'react';
/** For complete reference/summary collections; pass the already filtered rows. */
export function useCollectionPagination<T>(rows: T[], filterKey = '') {
 const [position, setPosition] = useState({ key: filterKey, page: 1, limit: 10 });
 const limit = position.limit;
 const page = Math.min(position.key === filterKey ? position.page : 1, Math.max(1, Math.ceil(rows.length / limit)));
 return { data: rows.slice((page - 1) * limit, page * limit), total: rows.length, page, limit,
 onPageChange: (next: number) => setPosition({ key: filterKey, page: next, limit }),
 onLimitChange: (next: number) => setPosition({ key: filterKey, page: 1, limit: next }) };
}
