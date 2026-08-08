import { describe, it, expect, beforeEach } from 'vitest';
import { locationStore } from './locations.store';
import type { Location } from '$lib/types/course.types';

describe('locationStore CAS tryEnroll', () => {
	const courseId = 999;
	const locId = 'loc-test';

	beforeEach(() => {
		// 每次测试前重置数据：容量 10，已报名 5
		const loc: Location = {
			id: locId,
			name: 'Test Location',
			address: 'Test Address',
			capacity: 10,
			enrolled: 5
		};
		locationStore.upsert(courseId, loc);
	});

	it('should succeed when expectedEnrolled matches', async () => {
		const res = await locationStore.tryEnroll(courseId, locId, 5);
		expect(res.ok).toBe(true);
		expect(res.current?.enrolled).toBe(6);

		const verify = locationStore.findById(courseId, locId);
		expect(verify?.enrolled).toBe(6);
	});

	it('should fail with cas_conflict when expectedEnrolled mismatches', async () => {
		const res = await locationStore.tryEnroll(courseId, locId, 4); // expect 4 but actual is 5
		expect(res.ok).toBe(false);
		expect(res.reason).toBe('cas_conflict');
		expect(res.current?.enrolled).toBe(5); // should return current actual value
	});

	it('should fail with full when capacity reached', async () => {
		// 先强行占满
		const loc: Location = { id: locId, name: '', address: '', capacity: 10, enrolled: 10 };
		locationStore.upsert(courseId, loc);

		const res = await locationStore.tryEnroll(courseId, locId, 10);
		expect(res.ok).toBe(false);
		expect(res.reason).toBe('full');
	});

	it('should handle concurrent enrollments properly (only 1 succeeds)', async () => {
		// 模拟两个并发的报名请求，都认为当前 enrolled 是 5
		const p1 = locationStore.tryEnroll(courseId, locId, 5);
		const p2 = locationStore.tryEnroll(courseId, locId, 5);

		const [res1, res2] = await Promise.all([p1, p2]);

		// 必然是一个成功，一个 CAS 冲突失败
		const successCount = [res1, res2].filter((r) => r.ok).length;
		const conflictCount = [res1, res2].filter((r) => !r.ok && r.reason === 'cas_conflict').length;

		expect(successCount).toBe(1);
		expect(conflictCount).toBe(1);

		const verify = locationStore.findById(courseId, locId);
		expect(verify?.enrolled).toBe(6); // 最终只增加了 1
	});
});
