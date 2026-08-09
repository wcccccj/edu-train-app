import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import AuthModal from './AuthModal.svelte';
import { authStore } from '$lib/stores/auth.store.svelte';

vi.mock('$app/environment', () => ({
	browser: true
}));

global.fetch = vi.fn();

describe('AuthModal', () => {
	const mockUsers = [
		{ id: 'u1', name: 'User One', email: 'user1@example.com' },
		{ id: 'u2', name: 'User Two', email: 'user2@example.com' }
	];

	beforeEach(() => {
		authStore.logout();
		authStore.initialized = true;
		authStore.isAuthModalOpen = true;
		vi.resetAllMocks();

		vi.mocked(fetch).mockImplementation((url) => {
			if (String(url) === '/api/users') {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ data: mockUsers })
				} as unknown as Response);
			}
			return Promise.resolve({ ok: false } as unknown as Response);
		});
	});

	it('should render user list correctly', async () => {
		render(AuthModal);

		expect(screen.getByText('TAS 培训系统')).toBeTruthy();

		await waitFor(() => {
			expect(screen.getByText('User One')).toBeTruthy();
			expect(screen.getByText('User Two')).toBeTruthy();
		});
	});

	it('should select user and show continue button', async () => {
		render(AuthModal);

		await waitFor(() => {
			expect(screen.getByText('User One')).toBeTruthy();
		});

		// Select user
		await fireEvent.click(screen.getByText('User One'));

		// Continue button and switch account link should appear
		expect(screen.getByRole('button', { name: '继续' })).toBeTruthy();
		expect(screen.getByText('切换账号')).toBeTruthy();
	});

	it('should handle login successfully', async () => {
		vi.mocked(fetch).mockImplementation((url) => {
			if (String(url) === '/api/users') {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ data: mockUsers })
				} as unknown as Response);
			}
			if (String(url) === '/api/auth/login') {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ data: { user: mockUsers[0], token: 't1' } })
				} as unknown as Response);
			}
			return Promise.resolve({ ok: false } as unknown as Response);
		});

		render(AuthModal);

		await waitFor(() => {
			expect(screen.getByText('User One')).toBeTruthy();
		});

		await fireEvent.click(screen.getByText('User One'));

		const continueBtn = screen.getByRole('button', { name: '继续' });
		await fireEvent.click(continueBtn);

		expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', expect.any(Object));

		await waitFor(() => {
			expect(authStore.isAuthenticated).toBe(true);
			expect(authStore.isAuthModalOpen).toBe(false);
		});
	});

	it('should allow switching back to user list', async () => {
		render(AuthModal);

		await waitFor(() => {
			expect(screen.getByText('User One')).toBeTruthy();
		});

		await fireEvent.click(screen.getByText('User One'));

		const switchBtn = screen.getByText('切换账号');
		await fireEvent.click(switchBtn);

		// Back to list
		expect(screen.getByText('User Two')).toBeTruthy();
		expect(screen.queryByRole('button', { name: '继续' })).toBeNull();
	});
});
