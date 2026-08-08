/**
 * 用户内存数据存储
 * 冷启动时种子化 5 个预定义用户，支持按 ID 查找
 */
import type { User } from '$lib/types/user.types';
import { generateUsers } from '../generators/user.generator';

class UserStore {
	private readonly data = new Map<string, User>();

	constructor() {
		this.seed();
	}

	private seed(): void {
		const users = generateUsers(5);
		for (const u of users) this.data.set(u.id, u);
	}

	findById(id: string): User | null {
		return this.data.get(id) ?? null;
	}

	findByName(name: string): User | null {
		for (const user of this.data.values()) {
			if (user.name === name) return user;
		}
		return null;
	}

	add(user: User): void {
		this.data.set(user.id, user);
	}

	listAll(): User[] {
		return Array.from(this.data.values());
	}

	count(): number {
		return this.data.size;
	}
}

export const userStore = new UserStore();
