/**
 * GET /api/courses
 * 公开接口，查询课程列表（关键词/类型/状态/分页）
 */
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isMockEnabled, listCourses, logRequest, ok } from '$lib/mock';
import type { CourseType, CourseStatus } from '$lib/types/course.types';

export const GET: RequestHandler = async ({ url }) => {
	const start = Date.now();
	if (!isMockEnabled()) throw error(404, 'Not Found');
	const result = listCourses({
		keyword: url.searchParams.get('keyword') ?? '',
		type: (url.searchParams.get('type') ?? '') as CourseType | '',
		status: (url.searchParams.get('status') ?? '') as CourseStatus | '',
		page: Number(url.searchParams.get('page') ?? 1),
		pageSize: Number(url.searchParams.get('pageSize') ?? 10)
	});
	logRequest('GET', url.pathname + url.search, 200, Date.now() - start, `total=${result.total}`);
	return ok(result);
};
