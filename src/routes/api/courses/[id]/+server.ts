/**
 * GET /api/courses/[id]
 * 公开接口，查询课程详情
 */
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isMockEnabled, getCourse, logRequest, ok, fail } from '$lib/mock';

export const GET: RequestHandler = async ({ params, url }) => {
	const start = Date.now();
	if (!isMockEnabled()) throw error(404, 'Not Found');
	const id = Number(params.id);
	if (!Number.isFinite(id)) {
		logRequest('GET', url.pathname, 400, Date.now() - start);
		return fail('BAD_REQUEST', 'invalid id');
	}
	const course = getCourse(id);
	if (!course) {
		logRequest('GET', url.pathname, 404, Date.now() - start);
		return fail('NOT_FOUND', 'course not found');
	}
	logRequest('GET', url.pathname, 200, Date.now() - start);
	return ok(course);
};
