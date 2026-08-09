import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userCache, userCacheKey } from './user-cache';

vi.mock('$app/environment', () => ({ browser: true }));

describe('userCache', () => {
	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
	});

	it('should generate cache keys that embed the user_id', () => {
		expect(userCacheKey('enrollment_status', 'user-001')).toBe(
			'TAS_CACHE_enrollment_status_user-001'
		);
		expect(userCacheKey('learning_progress', 'user-002')).toBe(
			'TAS_CACHE_learning_progress_user-002'
		);
	});

	it('should set and get values for a user', () => {
		userCache.set('enrollment_status', 'user-001', [{ id: 'a1' }]);

		expect(userCache.get('enrollment_status', 'user-001')).toEqual([{ id: 'a1' }]);
	});

	it('should return null when no value is cached', () => {
		expect(userCache.get('course_list', 'user-001')).toBeNull();
	});

	it('should isolate values between different users', () => {
		userCache.set('enrollment_status', 'user-001', 'A-data');
		userCache.set('enrollment_status', 'user-002', 'B-data');

		expect(userCache.get('enrollment_status', 'user-001')).toBe('A-data');
		expect(userCache.get('enrollment_status', 'user-002')).toBe('B-data');
	});

	it('should remove a single scope for a user', () => {
		userCache.set('enrollment_status', 'user-001', 'x');
		userCache.remove('enrollment_status', 'user-001');

		expect(userCache.get('enrollment_status', 'user-001')).toBeNull();
	});

	it('should clear only the target user cache, keeping others', () => {
		userCache.set('course_registrations', 'user-001', 'A');
		userCache.set('enrollment_status', 'user-001', 'A2');
		userCache.set('course_registrations', 'user-002', 'B');

		userCache.clearUser('user-001');

		expect(userCache.get('course_registrations', 'user-001')).toBeNull();
		expect(userCache.get('enrollment_status', 'user-001')).toBeNull();
		expect(userCache.get('course_registrations', 'user-002')).toBe('B');
	});

	it('should clear all users except the specified one', () => {
		userCache.set('course_registrations', 'user-001', 'A');
		userCache.set('enrollment_status', 'user-002', 'B');
		userCache.set('learning_progress', 'user-003', 'C');

		userCache.clearAllExcept('user-002');

		expect(userCache.get('course_registrations', 'user-001')).toBeNull();
		expect(userCache.get('learning_progress', 'user-003')).toBeNull();
		expect(userCache.get('enrollment_status', 'user-002')).toBe('B');
	});

	it('should not clear non-user cache keys', () => {
		localStorage.setItem('auth_token', 'token');
		userCache.set('enrollment_status', 'user-001', 'A');

		userCache.clearUser('user-001');

		expect(localStorage.getItem('auth_token')).toBe('token');
		expect(userCache.get('enrollment_status', 'user-001')).toBeNull();
	});
});
