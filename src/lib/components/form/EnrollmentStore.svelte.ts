import { getCurrentUserId } from '../../stores/current-user';
import { userCache } from '../../utils/user-cache';

const isBrowser = typeof window !== 'undefined';

export class EnrollmentStore<T extends Record<string, any>> {
	private key: string;
	data = $state<T>({} as T);
	step = $state<'form' | 'preview'>('form');

	constructor(key: string, initialData?: T) {
		this.key = key;
		if (initialData) {
			this.data = initialData;
		}

		if (isBrowser) {
			// 1. Try to load from session storage (current flow)
			const stored = sessionStorage.getItem(this.key);
			let sessionData = null;
			if (stored) {
				try {
					const parsed = JSON.parse(stored);
					if (parsed.data) sessionData = parsed.data;
					if (parsed.step) this.step = parsed.step;
				} catch (e) {
					console.error('Failed to parse enrollment session data', e);
				}
			}

			// 2. Try to load common profile from local storage if missing in session
			const userId = getCurrentUserId();
			const profile = userId ? userCache.get<Record<string, string>>('user_profile', userId) : null;
			if (profile) {
				// Only merge if not already in sessionData
				this.data = { ...profile, ...sessionData, ...initialData };
			} else if (sessionData) {
				this.data = { ...this.data, ...sessionData };
			}
		}
	}

	updateData(newData: Partial<T>) {
		this.data = { ...this.data, ...newData };
		this.save();

		// Save common fields to profile cache（按 user_id 隔离）
		if (isBrowser) {
			const userId = getCurrentUserId();
			const profile = {
				name: this.data.name,
				phone: this.data.phone,
				address: this.data.address
			};
			if (userId && (profile.name || profile.phone || profile.address)) {
				userCache.set('user_profile', userId, profile);
			}
		}
	}

	setStep(newStep: 'form' | 'preview') {
		this.step = newStep;
		this.save();
	}

	clear() {
		this.data = {} as T;
		this.step = 'form';
		if (isBrowser) {
			sessionStorage.removeItem(this.key);
		}
	}

	private save() {
		if (isBrowser) {
			sessionStorage.setItem(
				this.key,
				JSON.stringify({
					data: this.data,
					step: this.step
				})
			);
		}
	}
}
