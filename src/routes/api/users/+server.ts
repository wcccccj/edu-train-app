/**
 * GET /api/users
 * 公开接口，返回可切换的 mock 用户列表（用于前端切换器）
 */
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isMockEnabled, userStore, logRequest, ok } from '$lib/mock';

export const GET: RequestHandler = async ({ url }) => {
	const start = Date.now();
	if (!isMockEnabled()) throw error(404, 'Not Found');
	const list = userStore.listAll();
	logRequest('GET', url.pathname, 200, Date.now() - start, `count=${list.length}`);
	return ok(list);
};
