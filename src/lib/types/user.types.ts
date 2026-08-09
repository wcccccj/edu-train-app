/**
 * 用户类型契约
 */

export type Gender = 'male' | 'female';

export interface User {
	/** 形如 user-001 */
	id: string;
	/** 用户唯一标识（user_id），用于所有用户相关操作的缓存隔离；缺省时回退到 id */
	userId?: string;
	name: string;
	gender: Gender;
	phone: string;
	email: string;
	department?: string;
	position?: string;
	avatar?: string;
	password?: string;
}

/**
 * 解析用户唯一标识（user_id）。
 * 优先使用 userId，缺省回退到 id，保证所有用户相关缓存操作都能拿到稳定且唯一的标识。
 */
export function getUserId(user?: Pick<User, 'userId' | 'id'> | null): string | null {
	return user?.userId ?? user?.id ?? null;
}
