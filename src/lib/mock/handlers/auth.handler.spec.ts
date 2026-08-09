import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST as loginPOST } from '../../../routes/api/auth/login/+server';
import { userStore } from '../store/users.store';
import type { RequestEvent } from '@sveltejs/kit';

describe('Auth API Endpoints', () => {
	beforeEach(() => {
		// Clean up userStore for isolation if necessary,
		// but userStore has seed data which is fine.
	});

	function createMockEvent(body: Record<string, unknown>): RequestEvent {
		return {
			request: {
				json: vi.fn().mockResolvedValue(body)
			},
			cookies: {
				set: vi.fn(),
				get: vi.fn()
			}
		} as unknown as RequestEvent;
	}

	describe('POST /api/auth/login', () => {
		it('should return 400 if userId is empty', async () => {
			const event = createMockEvent({});
			const response = await loginPOST(event);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.message).toBe('缺少用户ID');
		});

		it('should return 404 if user does not exist', async () => {
			const event = createMockEvent({ userId: 'nonexistent' });
			const response = await loginPOST(event);
			const data = await response.json();

			expect(response.status).toBe(404);
			expect(data.message).toBe('账号不存在');
		});

		it('should return 200 and user data on successful login', async () => {
			const users = userStore.listAll();
			const existingUser = users[0];

			const event = createMockEvent({ userId: existingUser.id });
			const response = await loginPOST(event);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.data.user.name).toBe(existingUser.name);
			expect(data.data.token).toBe(existingUser.id);
		});
	});
});
