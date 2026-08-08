import type { User } from '../types/user.types';
import { getUserId } from '../types/user.types';
import { userCache } from '../utils/user-cache';
import { setCurrentUserId } from './current-user';
import { browser } from '$app/environment';

class AuthStore {
	currentUser = $state<User | null>(null);
	token = $state<string | null>(null);
	initialized = $state(false);

	isAuthModalOpen = $state(false);

	constructor() {
		// Do not initialize localStorage immediately in constructor to avoid SSR issues
		// Initialization should be done on client mount
	}

	openModal() {
		this.isAuthModalOpen = true;
	}

	closeModal() {
		this.isAuthModalOpen = false;
	}

	init() {
		if (this.initialized || !browser) return;

		let storedToken = localStorage.getItem('auth_token');
		let storedUser = localStorage.getItem('auth_user');

		if (!storedToken) {
			storedToken = sessionStorage.getItem('auth_token');
			storedUser = sessionStorage.getItem('auth_user');
		}

		if (storedToken && storedUser) {
			try {
				this.token = storedToken;
				this.currentUser = JSON.parse(storedUser);
			} catch {
				this.logout();
			}
		}
		setCurrentUserId(getUserId(this.currentUser));
		this.initialized = true;
	}

	login(user: User, token: string, remember: boolean = true) {
		// 用户切换：仅清除上一个用户的缓存数据，保留其他用户的缓存
		const previousUserId = getUserId(this.currentUser);
		if (previousUserId && previousUserId !== getUserId(user)) {
			userCache.clearUser(previousUserId);
		}

		this.currentUser = user;
		this.token = token;
		setCurrentUserId(getUserId(user));

		if (browser) {
			if (remember) {
				localStorage.setItem('auth_token', token);
				localStorage.setItem('auth_user', JSON.stringify(user));
			} else {
				sessionStorage.setItem('auth_token', token);
				sessionStorage.setItem('auth_user', JSON.stringify(user));
			}
		}
	}

	logout() {
		// 登出：仅清除会话凭证，不清除用户缓存（缓存由用户手动「清空缓存」时才清理）
		this.currentUser = null;
		this.token = null;
		setCurrentUserId(null);

		if (browser) {
			localStorage.removeItem('auth_token');
			localStorage.removeItem('auth_user');
			sessionStorage.removeItem('auth_token');
			sessionStorage.removeItem('auth_user');
			// 清除 mock 用户 cookie
			document.cookie = 'mock_user=; path=/; max-age=0';
		}
	}

	get isAuthenticated(): boolean {
		return !!this.currentUser;
	}
}

export const authStore = new AuthStore();
