/**
 * 课程业务逻辑 Handler
 * 负责列表查询（搜索/筛选/分页）与详情查询
 */
import type { Page } from '$lib/types/common.types';
import type { Course, CourseQuery } from '$lib/types/course.types';
import { courseStore } from '../store/courses.store';
import { normalizePage, paginate } from '../utils/pagination';

export function listCourses(query: CourseQuery): Page<Course> {
	const { page, pageSize } = normalizePage(query.page, query.pageSize);
	const keyword = (query.keyword ?? '').trim().toLowerCase();
	const type = query.type ?? '';
	const status = query.status ?? '';

	let items = courseStore.listAll();
	if (keyword) {
		items = items.filter(
			(c) => c.name.toLowerCase().includes(keyword) || c.description.toLowerCase().includes(keyword)
		);
	}
	if (type) {
		items = items.filter((c) => c.type === type);
	}
	if (status) {
		items = items.filter((c) => c.status === status);
	}
	
	// 按热度（报名人数）降序排列
	items.sort((a, b) => b.enrolled - a.enrolled);
	
	return paginate(items, page, pageSize);
}

export function getCourse(id: number): Course | null {
	return courseStore.findById(id);
}
