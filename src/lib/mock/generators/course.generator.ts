/**
 * 课程数据生成器（mockjs）
 * 冷启动时生成 ~30 门课程，混合线上/线下/混合
 */
import Mock from 'mockjs';
import type { Course, CourseType, CourseStatus } from '$lib/types/course.types';

const COURSE_CATEGORIES = ['技术研发', '安全管理', '管理能力', '销售技能', '通用素养'];
const LOCATIONS = [
	{ name: '北京培训中心', address: '北京市海淀区中关村大街 1 号' },
	{ name: '上海实训基地', address: '上海市浦东新区张江高科园区' },
	{ name: '深圳南山校区', address: '深圳市南山区科技园' },
	{ name: '杭州滨江中心', address: '杭州市滨江区江南大道' },
	{ name: '广州天河校区', address: '广州市天河区珠江新城' }
];
const DURATIONS = ['3天', '5天', '7天', '2周', '40课时', '60课时'];

function pickTimeSlot(startStr: string, offsetDays: number): string {
	const end = new Date(new Date(startStr).getTime() + offsetDays * 86400_000)
		.toISOString()
		.slice(0, 10);
	return `${startStr} 至 ${end}（周一至周五）`;
}

function buildLocations(seed: number): Course['locations'] {
	// 至少 1 个，最多 3 个；满员概率 ~20%
	const count = (seed % 3) + 1;
	const selected = LOCATIONS.slice(0, count).map((loc, i) => {
		const capacity = 20 + ((seed + i * 7) % 60);
		const isFull = (seed + i) % 5 === 0;
		return {
			id: `loc-${padId(seed, i)}`,
			name: loc.name,
			address: loc.address,
			capacity,
			enrolled: isFull ? capacity : Math.floor((capacity * ((seed + i) % 80)) / 100)
		};
	});
	return selected;
}

function padId(seed: number, i: number): string {
	return `${(seed * 10 + i).toString().padStart(4, '0')}`;
}

function deriveStatus(enrolled: number, max: number, startDate: string): CourseStatus {
	const start = new Date(startDate).getTime();
	if (Number.isFinite(start) && start < Date.now()) return 'closed';
	if (enrolled >= max) return 'full';
	return 'open';
}

export function generateCourses(count = 30): Course[] {
	const list: Course[] = [];
	const now = Date.now();

	for (let i = 0; i < count; i++) {
		const id = 1001 + i;
		const seed = i + 1;
		const type = (['online', 'offline', 'hybrid'] as CourseType[])[seed % 3];
		const category = COURSE_CATEGORIES[seed % COURSE_CATEGORIES.length];
		const maxStudents = 20 + ((seed * 7) % 80);

		// 使得大约 2/3 的课程在未来（未过期），1/3 的课程在过去
		const isFuture = seed % 3 !== 0;
		const offsetFromNow = (seed * 13) % 90; // 0 到 90 天
		const startTimestamp = isFuture
			? now + offsetFromNow * 86400_000
			: now - (offsetFromNow + 10) * 86400_000;

		const startDate = new Date(startTimestamp).toISOString().slice(0, 10);
		const offsetDays = 3 + (seed % 5);
		const endDate = new Date(startTimestamp + offsetDays * 86400_000).toISOString().slice(0, 10);

		const enrolled = Math.min(maxStudents, Math.floor((maxStudents * ((seed * 13) % 100)) / 100));
		const status = deriveStatus(enrolled, maxStudents, startDate);
		const desc = Mock.mock('@cparagraph(2, 4)');
		const locations = type === 'online' ? [] : buildLocations(seed);
		const timeSlots = type === 'online' ? [] : [pickTimeSlot(startDate, offsetDays)];

		const course: Course = {
			id,
			name: `${category} · ${DURATIONS[seed % DURATIONS.length]} 培训`,
			type,
			category,
			startDate,
			endDate,
			duration: DURATIONS[seed % DURATIONS.length],
			instructor: Mock.Random.cname(),
			price: Math.floor((seed * 137) % 5000),
			maxStudents,
			enrolled,
			status,
			description: typeof desc === 'string' ? desc : String(desc),
			locations,
			timeSlots
		};
		list.push(course);
	}
	return list;
}
