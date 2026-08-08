/**
 * GET /api/locations?courseId=xxx
 * 公开接口，查询课程关联的地点列表
 */
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isMockEnabled, locationStore, logRequest, ok, fail } from '$lib/mock';

export const GET: RequestHandler = async ({ url }) => {
	const start = Date.now();
	if (!isMockEnabled()) throw error(404, 'Not Found');
	const courseId = Number(url.searchParams.get('courseId') ?? 0);
	if (!Number.isFinite(courseId) || courseId <= 0) {
		logRequest('GET', url.pathname + url.search, 400, Date.now() - start);
		return fail('BAD_REQUEST', 'invalid courseId');
	}
	const locations = locationStore.listByCourse(courseId);
	logRequest('GET', url.pathname + url.search, 200, Date.now() - start, `count=${locations.length}`);
	return ok(locations);
};
