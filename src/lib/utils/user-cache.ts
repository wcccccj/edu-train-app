/**
 * 按用户隔离的缓存层
 *
 * 所有用户个性化缓存统一走该模块，缓存键由「作用域 + user_id」共同构成，
 * 保证不同用户之间的缓存数据完全隔离，杜绝用户切换时的数据混淆。
 *
 * 键格式：TAS_CACHE_<scope>_<userId>
 */
const isBrowser = typeof window !== 'undefined';

export type CacheScope =
	| 'course_list'
	| 'course_registrations'
	| 'enrollment_status'
	| 'learning_progress'
	| 'user_profile';

const PREFIX = 'TAS_CACHE';

/** 生成按用户隔离的缓存键 */
export function userCacheKey(scope: CacheScope, userId: string): string {
	return `${PREFIX}_${scope}_${userId}`;
}

/** 判断一个缓存键是否属于 TAS 用户缓存体系 */
function isUserCacheKey(key: string): boolean {
	return key.startsWith(`${PREFIX}_`);
}

/** 判断一个缓存键是否属于指定用户 */
function isUserCacheKeyFor(key: string, userId: string): boolean {
	return isUserCacheKey(key) && key.endsWith(`_${userId}`);
}

export const userCache = {
	get<T>(scope: CacheScope, userId: string): T | null {
		if (!isBrowser) return null;
		try {
			const raw = localStorage.getItem(userCacheKey(scope, userId));
			return raw ? (JSON.parse(raw) as T) : null;
		} catch {
			return null;
		}
	},

	set(scope: CacheScope, userId: string, value: unknown): void {
		if (!isBrowser) return;
		try {
			localStorage.setItem(userCacheKey(scope, userId), JSON.stringify(value));
		} catch {
			// 存储失败（如配额超限）时静默降级，不影响主流程
		}
	},

	remove(scope: CacheScope, userId: string): void {
		if (!isBrowser) return;
		localStorage.removeItem(userCacheKey(scope, userId));
	},

	/** 清除指定用户的全部缓存（登出时调用） */
	clearUser(userId: string): void {
		if (!isBrowser) return;
		const keys: string[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && isUserCacheKeyFor(key, userId)) keys.push(key);
		}
		keys.forEach((key) => localStorage.removeItem(key));
	},

	/** 保留指定用户，清除其他所有用户的缓存（切换用户时调用） */
	clearAllExcept(userId: string): void {
		if (!isBrowser) return;
		const keys: string[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && isUserCacheKey(key) && !isUserCacheKeyFor(key, userId)) keys.push(key);
		}
		keys.forEach((key) => localStorage.removeItem(key));
	}
};
