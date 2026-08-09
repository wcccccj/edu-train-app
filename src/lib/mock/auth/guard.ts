/**
 * 鉴权守卫
 *  - optionalUser: 不强制登录，返回 User | null
 *  - requireUser:   强制登录，未登录抛出 401 错误
 */
import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { User } from '$lib/types/user.types';
import { getCurrentUser } from './current-user';

export function optionalUser(event: RequestEvent): User | null {
	return getCurrentUser(event);
}

export function requireUser(event: RequestEvent): User {
	const user = getCurrentUser(event);
	if (!user) {
		throw error(401, '请先登录');
	}
	return user;
}
