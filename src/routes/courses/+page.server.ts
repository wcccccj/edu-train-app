import type { PageServerLoad } from './$types';
import type { ApiResponse, Page } from '$lib/types/common.types';
import type { Course as ApiCourse } from '$lib/types/course.types';
import type { CourseLocation } from '$lib/components/CourseCard.svelte';
import type { Course } from './store.svelte';

/** 将 API 返回的 YYYY-MM-DD 转为本地时间的 ISO 字符串，供卡片展示 */
function toStartTime(startDate: string): string {
	return new Date(`${startDate}T09:00:00`).toISOString();
}

/** 将 mock API 的 Course 映射为课程中心页所需的 Course */
function mapCourse(c: ApiCourse): Course {
	const isOnline = c.type === 'online';
	const locations: CourseLocation[] =
		isOnline || c.locations.length === 0
			? [{ name: '线上直播', capacity: c.maxStudents }]
			: c.locations.map((l) => ({
					name: l.name,
					capacity: l.capacity > 0 ? l.capacity : undefined
				}));

	return {
		id: String(c.id),
		title: c.name,
		description: c.description,
		startTime: toStartTime(c.startDate),
		locations,
		capacity: c.maxStudents,
		type: c.type === 'hybrid' ? 'offline' : c.type,
		enrolled: c.enrolled,
		extraFields: c.extraFields
	};
}

export const load: PageServerLoad = async ({ url, fetch }) => {
	const keyword = url.searchParams.get('keyword') ?? '';
	const response = await fetch(
		`/api/courses?page=1&pageSize=100&keyword=${encodeURIComponent(keyword)}`
	);

	if (!response.ok) {
		throw new Error('加载课程列表失败');
	}

	const resData = (await response.json()) as ApiResponse<Page<ApiCourse>>;

	if (resData.code !== 'OK' || !resData.data) {
		throw new Error(resData.message || '加载课程列表失败');
	}

	return {
		courses: resData.data.list.map(mapCourse),
		total: resData.data.total
	};
};
