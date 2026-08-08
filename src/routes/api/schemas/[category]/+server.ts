/**
 * GET /api/schemas/[category]
 * 公开接口，根据 category 返回动态表单 schema 定义
 */
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isMockEnabled, getSchema, logRequest, ok, fail } from '$lib/mock';

export const GET: RequestHandler = async (event) => {
	const start = Date.now();
	if (!isMockEnabled()) throw error(404, 'Not Found');
	const schema = getSchema(event.params.category);
	if (!schema) {
		logRequest('GET', event.url.pathname, 404, Date.now() - start);
		return fail('NOT_FOUND', 'schema not found');
	}
	logRequest('GET', event.url.pathname, 200, Date.now() - start);
	return ok(schema);
};
