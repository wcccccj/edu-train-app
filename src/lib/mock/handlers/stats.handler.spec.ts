import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getStatsOverview } from './stats.handler';
import { applicationStore } from '../store/applications.store';
import { courseStore } from '../store/courses.store';
import { userStore } from '../store/users.store';
import type { Application } from '$lib/types/application.types';
import type { Course } from '$lib/types/course.types';
import type { User } from '$lib/types/user.types';

describe('stats.handler', () => {
	beforeEach(() => {
		vi.spyOn(courseStore, 'listAll').mockReturnValue([
			{ id: 1, name: 'C1', type: 'online', enrolled: 10 } as Course,
			{ id: 2, name: 'C2', type: 'offline', enrolled: 20 } as Course
		]);

		vi.spyOn(userStore, 'findById').mockImplementation((id) => {
			if (id === 'user-1') return { department: 'IT' } as User;
			if (id === 'user-2') return { department: 'HR' } as User;
			return null;
		});

		vi.spyOn(applicationStore, 'listAll').mockReturnValue([
			{ userId: 'user-1', status: 'pending' },
			{ userId: 'user-1', status: 'completed' },
			{ userId: 'user-2', status: 'approved' }
		] as Application[]);
	});

	it('should aggregate KPI for specific user', () => {
		const stats = getStatsOverview('user-1');
		expect(stats.kpi.totalApplications).toBe(2);
		expect(stats.kpi.pendingCount).toBe(1);
		expect(stats.kpi.completedCount).toBe(1);
		expect(stats.kpi.completionRate).toBe(50); // 1/2
	});

	it('should aggregate global charts correctly', () => {
		const stats = getStatsOverview('user-1');

		// 课程热度（按 enrolled 降序）
		expect(stats.courseRanking[0].courseId).toBe(2);
		expect(stats.courseRanking[0].enrolled).toBe(20);

		// 培训类型分布
		expect(stats.typeDistribution.find((t) => t.type === 'offline')?.count).toBe(20);

		// 部门参与情况 (IT 2人次, HR 1人次)
		expect(stats.departmentDistribution[0].department).toBe('IT');
		expect(stats.departmentDistribution[0].count).toBe(2);
	});
});
