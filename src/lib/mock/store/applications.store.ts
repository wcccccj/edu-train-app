/**
 * 申请记录内存数据存储
 */
import type { Application } from '$lib/types/application.types';

class ApplicationStore {
	private readonly data = new Map<string, Application>();

	listAll(): Application[] {
		return Array.from(this.data.values());
	}

	listByUser(userId: string): Application[] {
		return this.listAll().filter((a) => a.userId === userId);
	}

	findById(id: string): Application | null {
		return this.data.get(id) ?? null;
	}

	add(app: Application): void {
		this.data.set(app.id, app);
	}

	update(id: string, patch: Partial<Application>): Application | null {
		const existing = this.data.get(id);
		if (!existing) return null;
		const updated: Application = { ...existing, ...patch, id: existing.id, userId: existing.userId };
		this.data.set(id, updated);
		return updated;
	}

	remove(id: string): boolean {
		return this.data.delete(id);
	}

	count(): number {
		return this.data.size;
	}
}

export const applicationStore = new ApplicationStore();
