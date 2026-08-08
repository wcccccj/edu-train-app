import type { RequestEvent } from '@sveltejs/kit';
import { userStore } from '$lib/mock/store/users.store';
import { ok, fail } from '$lib/mock/utils/response';

export async function POST(event: RequestEvent) {
	try {
		const { userId } = await event.request.json();

		if (!userId) {
			return fail('BAD_REQUEST', '缺少用户ID');
		}

		const user = userStore.findById(userId);
		if (!user) {
			return fail('NOT_FOUND', '账号不存在');
		}

		// 设置 cookie 供 SSR load 函数读取用户身份
		event.cookies.set('mock_user', userId, {
			path: '/',
			httpOnly: false,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7
		});

		return ok({ user, token: user.id });
	} catch {
		return fail('ERROR', '内部服务器错误');
	}
}
