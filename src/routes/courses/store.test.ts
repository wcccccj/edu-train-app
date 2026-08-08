import { describe, it, expect, beforeEach, vi } from 'vitest';
import { coursesStore, type Registration } from './store.svelte';
import { userCache } from '$lib/utils/user-cache';

vi.mock('$app/environment', () => ({ browser: true }));

function makeReg(id: string, courseId: string): Registration {
	return { id, courseId, name: '测试', phone: '13800138000', address: '北京' };
}

describe('CoursesStore 用户缓存隔离', () => {
	beforeEach(() => {
		localStorage.clear();
		// 重置单例状态，避免用例间串数据
		coursesStore.init(null);
	});

	it('用户 A 报名课程后，缓存中仅存储 A 的报名状态', () => {
		coursesStore.init('userA');
		coursesStore.addRegistration(makeReg('r-a1', 'course-1'));

		const cacheA = userCache.get<Registration[]>('course_registrations', 'userA');
		expect(cacheA).toHaveLength(1);
		expect(cacheA![0].id).toBe('r-a1');
		// B 的缓存应为空，不受 A 操作影响
		expect(userCache.get('course_registrations', 'userB')).toBeNull();
	});

	it('切换至用户 B 后，B 的课程列表显示其原始状态，不受 A 操作影响', () => {
		coursesStore.init('userA');
		coursesStore.addRegistration(makeReg('r-a1', 'course-1'));
		expect(coursesStore.getRegisteredCount('course-1')).toBe(1);

		// 切换用户
		coursesStore.init('userB');
		expect(coursesStore.registrations).toHaveLength(0);
		expect(coursesStore.getRegistrationForCourse('course-1')).toBeUndefined();
		expect(coursesStore.getRegisteredCount('course-1')).toBe(0);
	});

	it('切回用户 A 后能恢复其此前报名状态', () => {
		coursesStore.init('userA');
		coursesStore.addRegistration(makeReg('r-a1', 'course-1'));

		coursesStore.init('userB');
		coursesStore.addRegistration(makeReg('r-b1', 'course-2'));

		// 切回 A：只看到 A 的报名，看不到 B 的
		coursesStore.init('userA');
		expect(coursesStore.registrations).toHaveLength(1);
		expect(coursesStore.getRegistrationForCourse('course-1')).toBeDefined();
		expect(coursesStore.getRegistrationForCourse('course-2')).toBeUndefined();
	});

	it('登出后（init null）清空当前用户内存状态且不影响其他用户缓存', () => {
		coursesStore.init('userA');
		coursesStore.addRegistration(makeReg('r-a1', 'course-1'));

		coursesStore.init(null);
		expect(coursesStore.registrations).toHaveLength(0);
		// A 的持久化缓存仍存在，供下次登录恢复
		expect(userCache.get<Registration[]>('course_registrations', 'userA')).toHaveLength(1);
	});

	it('clear 清空当前用户的内存报名状态与持久化缓存', () => {
		coursesStore.init('userA');
		coursesStore.addRegistration(makeReg('r-a1', 'course-1'));
		expect(coursesStore.getRegisteredCount('course-1')).toBe(1);

		coursesStore.clear();

		expect(coursesStore.registrations).toHaveLength(0);
		expect(coursesStore.getRegistrationForCourse('course-1')).toBeUndefined();
		expect(userCache.get('course_registrations', 'userA')).toBeNull();
	});
});