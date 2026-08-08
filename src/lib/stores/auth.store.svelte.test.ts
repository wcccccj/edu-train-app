import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authStore } from './auth.store.svelte';
import type { User } from '../types/user.types';

vi.mock('$app/environment', () => ({
	browser: true
}));

const browser = true;

describe('AuthStore', () => {
	const mockUser: User = {
		id: 'user-999',
		name: 'testuser',
		password: 'Password123!',
		phone: '13800138000',
		email: 'test@example.com',
		gender: 'male',
		department: '研发部',
		position: '前端工程师'
	};

	beforeEach(() => {
		// Reset store state
		authStore.logout();
		authStore.initialized = false;
		if (browser) {
			localStorage.clear();
			sessionStorage.clear();
		}
	});

	it('should initialize with empty state', () => {
		expect(authStore.currentUser).toBeNull();
		expect(authStore.token).toBeNull();
		expect(authStore.isAuthenticated).toBe(false);
	});

	it('should login and set state correctly', () => {
		authStore.login(mockUser, mockUser.id, true);

		expect(authStore.currentUser).toEqual(mockUser);
		expect(authStore.token).toBe(mockUser.id);
		expect(authStore.isAuthenticated).toBe(true);

		if (browser) {
			expect(localStorage.getItem('auth_token')).toBe(mockUser.id);
			expect(JSON.parse(localStorage.getItem('auth_user')!)).toEqual(mockUser);
		}
	});

	it('should logout and clear state', () => {
		authStore.login(mockUser, mockUser.id, true);
		authStore.logout();

		expect(authStore.currentUser).toBeNull();
		expect(authStore.token).toBeNull();
		expect(authStore.isAuthenticated).toBe(false);

		if (browser) {
			expect(localStorage.getItem('auth_token')).toBeNull();
			expect(localStorage.getItem('auth_user')).toBeNull();
		}
	});

	it('should restore state from localStorage on init', () => {
		if (browser) {
			localStorage.setItem('auth_token', mockUser.id);
			localStorage.setItem('auth_user', JSON.stringify(mockUser));

			authStore.init();

			expect(authStore.currentUser).toEqual(mockUser);
			expect(authStore.token).toBe(mockUser.id);
			expect(authStore.isAuthenticated).toBe(true);
		}
	});

	it('should handle corrupted localStorage gracefully', () => {
		if (browser) {
			localStorage.setItem('auth_token', mockUser.id);
			localStorage.setItem('auth_user', 'invalid-json');

			authStore.init();

			expect(authStore.currentUser).toBeNull();
			expect(authStore.token).toBeNull();
			expect(authStore.isAuthenticated).toBe(false);
		}
	});
});
