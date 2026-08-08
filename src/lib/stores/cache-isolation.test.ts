import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authStore } from './auth.store.svelte';
import { enrollmentsStore, type Enrollment } from './enrollments.store.svelte';
import { learningProgressStore } from './learning-progress.store.svelte';
import { userCache } from '$lib/utils/user-cache';
import type { User } from '$lib/types/user.types';

vi.mock('$app/environment', () => ({ browser: true }));

const userA: User = { id: 'userA', userId: 'userA', name: '用户A', gender: 'male', phone: '13800138000', email: 'a@example.com' };
const userB: User = { id: 'userB', userId: 'userB', name: '用户B', gender: 'female', phone: '13800138001', email: 'b@example.com' };

function makeEnrollment(id: string, courseId: string): Enrollment {
	return {
		id,
		userId: id === 'appA1' ? 'userA' : 'userB',
		courseId,
		courseName: 'Svelte 基础',
		type: 'online',
		applyDate: '2026-08-01',
		status: 'pending',
		name: '张三',
		phone: '13800138000'
	};
}

describe('用户缓存隔离集成测试', () => {
	beforeEach(() => {
		localStorage.clear();
		sessionStorage.clear();
		authStore.logout();
		enrollmentsStore.init(null);
		learningProgressStore.init(null);
	});

	it('用户 A 报名课程后，缓存中仅存储 A 的报名状态', () => {
		enrollmentsStore.init('userA');
		enrollmentsStore.add(makeEnrollment('appA1', 'course-1'));

		const cacheA = userCache.get<Enrollment[]>('enrollment_status', 'userA');
		expect(cacheA).toHaveLength(1);
		expect(cacheA![0].id).toBe('appA1');
		// B 的报名缓存为空，不受 A 操作影响
		expect(userCache.get('enrollment_status', 'userB')).toBeNull();
	});

	it('切换至用户 B 后，B 的课程列表/报名状态显示其原始状态，不受 A 操作影响', () => {
		enrollmentsStore.init('userA');
		enrollmentsStore.add(makeEnrollment('appA1', 'course-1'));

		// 切换用户
		enrollmentsStore.init('userB');
		expect(enrollmentsStore.enrollments).toHaveLength(0);

		// 切回 A 仍能恢复 A 此前的报名状态
		enrollmentsStore.init('userA');
		expect(enrollmentsStore.enrollments).toHaveLength(1);
	});

	it('登出仅清除会话凭证，保留用户缓存；手动清空缓存时才彻底清除', () => {
		// 用户 A 登录并报名
		authStore.currentUser = userA;
		enrollmentsStore.init('userA');
		enrollmentsStore.add(makeEnrollment('appA1', 'course-1'));

		// 登出：只清会话凭证，不清用户缓存
		authStore.logout();
		enrollmentsStore.init(null);
		expect(authStore.currentUser).toBeNull();
		expect(userCache.get<Enrollment[]>('enrollment_status', 'userA')).toHaveLength(1);

		// 用户手动「清空缓存」：彻底清除该用户全部缓存
		userCache.clearUser('userA');
		expect(userCache.get('enrollment_status', 'userA')).toBeNull();
	});

	it('切换账号登录时仅清除当前用户缓存，保留其他用户缓存', () => {
		authStore.currentUser = userA;
		enrollmentsStore.init('userA');
		enrollmentsStore.add(makeEnrollment('appA1', 'course-1'));

		// 为 B 预置独立缓存
		userCache.set('enrollment_status', 'userB', [makeEnrollment('appB1', 'course-2')]);

		// 切换到 B 登录：清除 A（当前用户）缓存，保留 B 缓存
		authStore.login(userB, 'userB', true);
		expect(userCache.get('enrollment_status', 'userA')).toBeNull();
		expect(userCache.get<Enrollment[]>('enrollment_status', 'userB')).toHaveLength(1);
	});

	it('个人学习进度数据按用户隔离', () => {
		learningProgressStore.init('userA');
		learningProgressStore.addOrUpdate({ courseId: 'course-1', progress: 50, lastStudiedAt: '2026-08-01' });

		// B 的学习进度为空
		learningProgressStore.init('userB');
		expect(learningProgressStore.progress).toHaveLength(0);

		// A 的学习进度已持久化且可恢复
		learningProgressStore.init('userA');
		expect(learningProgressStore.progress).toHaveLength(1);
		expect(learningProgressStore.progress[0].progress).toBe(50);
	});
});