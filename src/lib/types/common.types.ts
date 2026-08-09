/**
 * 通用响应与分页类型契约
 */

/** 统一 API 响应包装 */
export interface ApiResponse<T> {
	code: 'OK' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'LOCKED' | 'BAD_REQUEST' | 'ERROR';
	message: string;
	data: T | null;
}

/** 分页响应 */
export interface Page<T> {
	list: T[];
	total: number;
	page: number;
	pageSize: number;
}

/** 分页请求参数 */
export interface PageQuery {
	page?: number;
	pageSize?: number;
}
