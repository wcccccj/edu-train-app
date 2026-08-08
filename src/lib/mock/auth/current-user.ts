/**
 * 当前用户解析
 * 从 x-mock-user 请求头中提取用户 ID 并查找用户
 */
import type { RequestEvent } from '@sveltejs/kit';
import type { User } from '$lib/types/user.types';
import { userStore } from '../store/users.store';

export const MOCK_USER_HEADER = 'x-mock-user';

export function getCurrentUser(event: RequestEvent): User | null {
	const id = event.request.headers.get(MOCK_USER_HEADER);
	if (!id) return null;
	return userStore.findById(id);
}
