/**
 * 地点内存数据存储（含 CAS 乐观锁）
 */
import type { Location } from '$lib/types/course.types';

class LocationStore {
	/** courseId+locationId 拼接为 store key */
	private readonly data = new Map<string, Location>();

	private key(courseId: number, locationId: string): string {
		return `${courseId}::${locationId}`;
	}

	listByCourse(courseId: number): Location[] {
		const out: Location[] = [];
		for (const [k, v] of this.data) {
			if (k.startsWith(`${courseId}::`)) out.push(v);
		}
		return out;
	}

	findById(courseId: number, locationId: string): Location | null {
		return this.data.get(this.key(courseId, locationId)) ?? null;
	}

	upsert(courseId: number, loc: Location): void {
		this.data.set(this.key(courseId, loc.id), loc);
	}

	count(): number {
		return this.data.size;
	}

	private chains = new Map<string, Promise<unknown>>();

	private withLock<T>(id: string, fn: () => Promise<T>): Promise<T> {
		const prev = this.chains.get(id) ?? Promise.resolve();
		const next = prev.then(fn, fn);
		this.chains.set(id, next.catch(() => undefined));
		return next;
	}

	// CAS 实现
	async tryEnroll(
		courseId: number,
		locationId: string,
		expectedEnrolled: number
	): Promise<{ ok: boolean; reason?: string; current?: Location }> {
		const key = this.key(courseId, locationId);
		return this.withLock(key, async () => {
			const loc = this.data.get(key);
			if (!loc) return { ok: false, reason: 'not_found' };
			if (loc.enrolled !== expectedEnrolled) {
				return { ok: false, reason: 'cas_conflict', current: { ...loc } };
			}
			if (loc.enrolled >= loc.capacity) {
				return { ok: false, reason: 'full', current: { ...loc } };
			}
			
			// 模拟轻微的网络延迟与处理耗时
			await new Promise((resolve) => setTimeout(resolve, 5 + Math.random() * 10));

			const updated = { ...loc, enrolled: loc.enrolled + 1 };
			this.data.set(key, updated);
			return { ok: true, current: { ...updated } };
		});
	}
}

export const locationStore = new LocationStore();
