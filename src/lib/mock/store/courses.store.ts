/**
 * 课程内存数据存储
 * 冷启动时种子化 ~30 门课程，支持按 ID 查找与列表查询
 */
import type { Course } from '$lib/types/course.types';
import { generateCourses } from '../generators/course.generator';

class CourseStore {
	private data: Map<number, Course> = new Map();

	constructor() {
		this.seed();
	}

	private seed(): void {
		const list = generateCourses(30);
		for (const c of list) this.data.set(c.id, c);
	}

	findById(id: number): Course | null {
		return this.data.get(id) ?? null;
	}

	listAll(): Course[] {
		return Array.from(this.data.values());
	}

	count(): number {
		return this.data.size;
	}
}

export const courseStore = new CourseStore();
