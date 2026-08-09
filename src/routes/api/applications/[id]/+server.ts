/**
 * GET    /api/applications/[id]  - 申请详情
 * PUT    /api/applications/[id]  - 修改申请
 * DELETE /api/applications/[id]  - 撤销申请
 */
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	isMockEnabled,
	requireUser,
	getApplication,
	updateApplication,
	deleteApplication,
	logRequest,
	ok,
	fail
} from '$lib/mock';
import type { ApplicationUpdatePayload } from '$lib/types/application.types';

export const GET: RequestHandler = async (event) => {
	const start = Date.now();
	if (!isMockEnabled()) throw error(404, 'Not Found');
	const user = requireUser(event);
	const id = event.params.id;
	const app = getApplication(id);
	if (!app) {
		logRequest('GET', event.url.pathname, 404, Date.now() - start);
		return fail('NOT_FOUND', 'application not found');
	}
	if (app.userId !== user.id) {
		logRequest('GET', event.url.pathname, 403, Date.now() - start, `owner=${app.userId}`);
		return fail('FORBIDDEN', '无权访问此申请');
	}
	logRequest('GET', event.url.pathname, 200, Date.now() - start, `user=${user.id}`);
	return ok(app);
};

export const PUT: RequestHandler = async (event) => {
	const start = Date.now();
	if (!isMockEnabled()) throw error(404, 'Not Found');

	const user = requireUser(event);
	const id = event.params.id;

	let payload: ApplicationUpdatePayload;
	try {
		payload = await event.request.json();
	} catch {
		return fail('BAD_REQUEST', 'Invalid JSON');
	}

	const res = updateApplication(user.id, id, payload);

	if (!res.ok) {
		logRequest('PUT', event.url.pathname, 400, Date.now() - start, res.reason);
		if (res.reason === 'forbidden') return fail('FORBIDDEN', '无权修改此申请');
		if (res.reason === 'not_found') return fail('NOT_FOUND', '申请不存在');
		if (res.reason === 'locked') return fail('LOCKED', '距离开课不足24小时或已开课，不可修改');
		return fail('BAD_REQUEST', res.reason ?? 'Unknown error');
	}

	logRequest('PUT', event.url.pathname, 200, Date.now() - start);
	return ok(res.application);
};

export const DELETE: RequestHandler = async (event) => {
	const start = Date.now();
	if (!isMockEnabled()) throw error(404, 'Not Found');

	const user = requireUser(event);
	const id = event.params.id;

	const res = deleteApplication(user.id, id);

	if (!res.ok) {
		logRequest('DELETE', event.url.pathname, 400, Date.now() - start, res.reason);
		if (res.reason === 'forbidden') return fail('FORBIDDEN', '无权撤销此申请');
		if (res.reason === 'not_found') return fail('NOT_FOUND', '申请不存在');
		return fail('BAD_REQUEST', res.reason ?? 'Unknown error');
	}

	logRequest('DELETE', event.url.pathname, 200, Date.now() - start);
	return ok({ id });
};
