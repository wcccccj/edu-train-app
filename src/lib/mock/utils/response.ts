/**
 * 统一 API 响应包装
 * 配合 SvelteKit 的 json() 使用
 */
import { json } from '@sveltejs/kit';
import type { ApiResponse } from '$lib/types/common.types';

export function ok<T>(data: T, message = 'OK'): Response {
	const body: ApiResponse<T> = { code: 'OK', message, data };
	return json(body);
}

export function fail<T = null>(code: ApiResponse<T>['code'], message: string, data: T | null = null): Response {
	const body: ApiResponse<T> = { code, message, data };
	return json(body, { status: statusFromCode(code) });
}

function statusFromCode(code: ApiResponse<unknown>['code']): number {
	switch (code) {
		case 'UNAUTHORIZED':
			return 401;
		case 'FORBIDDEN':
			return 403;
		case 'NOT_FOUND':
			return 404;
		case 'CONFLICT':
			return 409;
		case 'LOCKED':
			return 423;
		case 'BAD_REQUEST':
			return 400;
		default:
			return 500;
	}
}
