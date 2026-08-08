import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createApplication, updateApplication, deleteApplication } from './application.handler';
import { applicationStore } from '../store/applications.store';
import { courseStore } from '../store/courses.store';
import { locationStore } from '../store/locations.store';
import type { Course } from '$lib/types/course.types';
import type { ApplicationCreatePayload } from '$lib/types/application.types';

describe('application.handler', () => {
	const userId = 'user-001';
	let mockCourse: Course;

	beforeEach(() => {
		mockCourse = {
			id: 1001,
			name: 'Test Course',
			type: 'offline',
			status: 'open',
			enrolled: 5,
			maxStudents: 10,
			startDate: new Date(Date.now() + 86400_000 * 3).toISOString().slice(0, 10), // 3天后开课，未锁定
			endDate: '',
			duration: '',
			instructor: '',
			price: 0,
			description: '',
			category: '',
			locations: [{ id: 'loc-1', name: 'L1', address: '', capacity: 10, enrolled: 5 }],
			timeSlots: []
		};

		vi.spyOn(courseStore, 'findById').mockReturnValue(mockCourse);
		vi.spyOn(locationStore, 'findById').mockReturnValue(mockCourse.locations[0]);
		vi.spyOn(locationStore, 'tryEnroll').mockResolvedValue({ ok: true, current: { ...mockCourse.locations[0], enrolled: 6 } });
		
		// 每次测试清空 applicationStore
		vi.spyOn(applicationStore, 'add').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should create application and trigger CAS', async () => {
		const payload: ApplicationCreatePayload = {
			courseId: 1001,
			locationId: 'loc-1',
			name: 'John',
			gender: 'male',
			phone: '13800000000',
			email: 'john@test.com',
			department: 'IT',
			position: 'Dev',
			address: 'Addr',
			learningGoal: 'Learn'
		};

		const res = await createApplication(userId, payload);
		expect(res.ok).toBe(true);
		expect(res.application?.status).toBe('pending');
		expect(mockCourse.enrolled).toBe(6);
		expect(locationStore.tryEnroll).toHaveBeenCalledWith(1001, 'loc-1', 5);
	});

	it('should reject modification if locked (within 24h)', () => {
		// 修改开课时间为明天（不足24小时）
		mockCourse.startDate = new Date(Date.now() + 1000).toISOString().slice(0, 10);
		
		vi.spyOn(applicationStore, 'findById').mockReturnValue({
			id: 'APP1', userId, courseId: 1001, status: 'pending'
		} as any);

		const res = updateApplication(userId, 'APP1', { phone: '139' });
		expect(res.ok).toBe(false);
		expect(res.reason).toBe('locked');
	});
});
