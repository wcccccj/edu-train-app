/**
 * 分页工具
 */
import type { Page } from '$lib/types/common.types';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export function normalizePage(
	page: number | undefined,
	pageSize: number | undefined
): { page: number; pageSize: number } {
	const p = Math.max(1, Math.floor(page ?? DEFAULT_PAGE));
	const s = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize ?? DEFAULT_PAGE_SIZE)));
	return { page: p, pageSize: s };
}

export function paginate<T>(items: T[], page: number, pageSize: number): Page<T> {
	const total = items.length;
	const start = (page - 1) * pageSize;
	const list = items.slice(start, start + pageSize);
	return { list, total, page, pageSize };
}
