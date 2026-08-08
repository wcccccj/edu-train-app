/**
 * GET  /api/applications         - 我的申请列表（必填 x-mock-user）
 * POST /api/applications         - 提交报名
 */
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isMockEnabled, requireUser, listApplications, createApplication, logRequest, ok, fail } from '$lib/mock';
import type { ApplicationStatus, ApplicationCreatePayload } from '$lib/types/application.types';

export const GET: RequestHandler = async (event) => {
	const start = Date.now();
	if (!isMockEnabled()) throw error(404, 'Not Found');
	const user = requireUser(event);
	const result = listApplications(user.id, {
		status: (event.url.searchParams.get('status') ?? '') as ApplicationStatus | '',
		page: Number(event.url.searchParams.get('page') ?? 1),
		pageSize: Number(event.url.searchParams.get('pageSize') ?? 10)
	});
	logRequest(
		'GET',
		event.url.pathname + event.url.search,
		200,
		Date.now() - start,
		`user=${user.id} total=${result.total}`
	);
	return ok(result);
};

export const POST: RequestHandler = async (event) => {
	const start = Date.now();
	if (!isMockEnabled()) throw error(404, 'Not Found');
	
	const user = requireUser(event);
	let payload: ApplicationCreatePayload;
	try {
		payload = await event.request.json();
	} catch {
		return fail('BAD_REQUEST', 'Invalid JSON');
	}

	const res = await createApplication(user.id, payload);
	
	if (!res.ok) {
		logRequest('POST', event.url.pathname, 400, Date.now() - start, res.reason);
		if (res.reason === 'cas_conflict' || res.reason === 'full') {
			return fail('CONFLICT', '名额不足或已被抢占，请刷新重试');
		}
		return fail('BAD_REQUEST', res.reason ?? 'Unknown error');
	}

	logRequest('POST', event.url.pathname, 200, Date.now() - start, `id=${res.application?.id}`);
	return ok(res.application);
};
