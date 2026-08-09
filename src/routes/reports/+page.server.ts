import type { PageServerLoad } from './$types';
import type { StatsOverview } from '$lib/types/stats.types';
import type { ApiResponse } from '$lib/types/common.types';

/** mock 用户身份请求头名（与 $lib/mock/auth/current-user.ts 保持一致） */
const MOCK_USER_HEADER = 'x-mock-user';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	// 从 cookie 读取当前登录用户 ID，转发为 x-mock-user 头供 mock 接口识别身份
	const userId = cookies.get('mock_user');
	const headers: Record<string, string> = {};
	if (userId) headers[MOCK_USER_HEADER] = userId;

	const response = await fetch('/api/stats', { headers });

	if (!response.ok) {
		throw new Error('Failed to load stats data');
	}

	const resData = (await response.json()) as ApiResponse<StatsOverview>;

	if (resData.code !== 'OK') {
		throw new Error(resData.message || 'Failed to load stats data');
	}

	return {
		stats: resData.data as StatsOverview
	};
};
