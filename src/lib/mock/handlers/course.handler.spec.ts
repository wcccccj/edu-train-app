import { describe, it, expect, beforeEach, vi } from 'vitest';
import { listCourses, getCourse } from './course.handler';
import { courseStore } from '../store/courses.store';
import type { Course } from '$lib/types/course.types';

describe('course.handler', () => {
	beforeEach(() => {
		// Mock store data for predictable tests
		const mockCourses: Course[] = [
			{
				id: 1,
				name: 'Svelte 基础',
				type: 'online',
				status: 'open',
				enrolled: 10,
				description: 'Svelte 入门',
				category: '前端',
				startDate: '',
				endDate: '',
				duration: '',
				instructor: '',
				price: 0,
				maxStudents: 50,
				locations: [],
				timeSlots: []
			},
			{
				id: 2,
				name: 'React 进阶',
				type: 'offline',
				status: 'full',
				enrolled: 50,
				description: '深入 React',
				category: '前端',
				startDate: '',
				endDate: '',
				duration: '',
				instructor: '',
				price: 0,
				maxStudents: 50,
				locations: [],
				timeSlots: []
			},
			{
				id: 3,
				name: 'Vue 实战',
				type: 'hybrid',
				status: 'open',
				enrolled: 20,
				description: 'Vue 3 项目',
				category: '前端',
				startDate: '',
				endDate: '',
				duration: '',
				instructor: '',
				price: 0,
				maxStudents: 50,
				locations: [],
				timeSlots: []
			},
			{
				id: 4,
				name: 'Node 后端',
				type: 'online',
				status: 'closed',
				enrolled: 30,
				description: 'Node.js 服务',
				category: '后端',
				startDate: '',
				endDate: '',
				duration: '',
				instructor: '',
				price: 0,
				maxStudents: 50,
				locations: [],
				timeSlots: []
			}
		];

		vi.spyOn(courseStore, 'listAll').mockReturnValue(mockCourses);
		vi.spyOn(courseStore, 'findById').mockImplementation(
			(id) => mockCourses.find((c) => c.id === id) ?? null
		);
	});

	it('should return paginated list', () => {
		const res = listCourses({ page: 1, pageSize: 2 });
		expect(res.total).toBe(4);
		expect(res.list.length).toBe(2);
		expect(res.page).toBe(1);
	});

	it('should filter by keyword (case insensitive, name or description)', () => {
		const res1 = listCourses({ keyword: 'svelte' });
		expect(res1.total).toBe(1);
		expect(res1.list[0].name).toBe('Svelte 基础');

		const res2 = listCourses({ keyword: '项目' }); // matches Vue description
		expect(res2.total).toBe(1);
		expect(res2.list[0].name).toBe('Vue 实战');
	});

	it('should filter by type and status', () => {
		const res = listCourses({ type: 'online', status: 'open' });
		expect(res.total).toBe(1);
		expect(res.list[0].id).toBe(1);
	});

	it('should sort by enrolled descending', () => {
		const res = listCourses({});
		// Expected order: React(50), Node(30), Vue(20), Svelte(10)
		expect(res.list[0].id).toBe(2);
		expect(res.list[1].id).toBe(4);
		expect(res.list[2].id).toBe(3);
		expect(res.list[3].id).toBe(1);
	});

	it('should get single course by id', () => {
		const course = getCourse(2);
		expect(course?.name).toBe('React 进阶');

		const notFound = getCourse(999);
		expect(notFound).toBeNull();
	});
});
