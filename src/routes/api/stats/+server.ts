/**
 * GET /api/stats
 * 公开接口，返回统计报表聚合数据
 */
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isMockEnabled, optionalUser, getStatsOverview, logRequest, ok } from '$lib/mock';

export const GET: RequestHandler = async (event) => {
	const start = Date.now();
	if (!isMockEnabled()) throw error(404, 'Not Found');

	const user = optionalUser(event);
	// 未登录时 KPI 全为 0，图表正常返回大盘数据
	const stats = getStatsOverview(user?.id ?? '__guest__');

	logRequest('GET', event.url.pathname, 200, Date.now() - start);
	return ok(stats);
};
