/**
 * GET /api/auth/me
 * 公开接口，根据 x-mock-user 头返回当前用户信息；未传头则返回 guest
 */
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isMockEnabled, optionalUser, logRequest, ok } from '$lib/mock';

export const GET: RequestHandler = async (event) => {
	const start = Date.now();
	if (!isMockEnabled()) throw error(404, 'Not Found');
	const user = optionalUser(event);
	logRequest(
		'GET',
		event.url.pathname,
		200,
		Date.now() - start,
		user ? `user=${user.id}` : 'guest'
	);
	return ok({ user, isGuest: user === null });
};
