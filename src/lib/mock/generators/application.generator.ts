/**
 * 申请记录数据生成器（mockjs）
 * 冷启动时为 5 个预生成用户种子化 ~40 条申请记录，
 * 覆盖各状态/各培训类型/各部门，使统计报表有真实可展示数据。
 */
import Mock from 'mockjs';
import type { Application, ApplicationStatus } from '$lib/types/application.types';
import type { Course } from '$lib/types/course.types';
import type { User } from '$lib/types/user.types';

const LEARNING_GOALS = [
	'提升岗位专业技能，适应业务发展需要',
	'系统学习相关理论，补齐知识短板',
	'考取相关资格证书，拓展职业发展路径',
	'与同行交流经验，了解行业最佳实践',
	'为后续项目储备必要的方法论与工具',
	'加强安全管理意识，降低岗位风险'
];

const ADDRESSES = [
	'北京市朝阳区建国路 88 号',
	'上海市徐汇区漕溪北路 100 号',
	'深圳市福田区福华三路 168 号',
	'杭州市西湖区文三路 478 号',
	'广州市天河区天河北路 233 号'
];

/** 状态权重：待审核 30% / 已通过 40% / 已拒绝 15% / 已完成 15% */
const STATUS_WEIGHTS: Array<[ApplicationStatus, number]> = [
	['pending', 30],
	['approved', 40],
	['rejected', 15],
	['completed', 15]
];

function pickStatus(seq: number, i: number): ApplicationStatus {
	// 用分散性更好的哈希避免状态集中在单一分类
	const r = (seq * 31 + i * 17 + 11) % 100;
	let acc = 0;
	for (const [status, w] of STATUS_WEIGHTS) {
		acc += w;
		if (r < acc) return status;
	}
	return 'pending';
}

function pad3(n: number): string {
	return n.toString().padStart(3, '0');
}

/**
 * 生成申请种子记录
 * @param users 预生成用户列表
 * @param courses 预生成课程列表
 * @returns 申请记录数组，每个用户 6-10 条，总计约 40 条
 */
export function generateApplications(users: User[], courses: Course[]): Application[] {
	if (users.length === 0 || courses.length === 0) return [];

	const list: Application[] = [];
	const now = Date.now();
	let seq = 1;

	for (const user of users) {
		// 每个用户 6-10 条
		const count = 6 + (seq % 5);
		for (let i = 0; i < count; i++) {
			const course = courses[(seq * 7 + i * 3) % courses.length];
			const applyOffsetDays = (seq * 5 + i * 11) % 90;
			const applyDate = new Date(now - applyOffsetDays * 86400_000)
				.toISOString()
				.slice(0, 10);
			const status = pickStatus(seq, i);

			const app: Application = {
				id: `APP${applyDate.replace(/-/g, '')}${pad3(seq)}`,
				userId: user.id,
				courseId: course.id,
				courseName: course.name,
				type: course.type,
				applyDate,
				status,
				name: user.name,
				gender: user.gender,
				phone: user.phone,
				email: user.email,
				department: user.department ?? '未分配',
				position: user.position ?? '员工',
				address: ADDRESSES[seq % ADDRESSES.length],
				emergencyContact: {
					name: Mock.Random.cname(),
					phone: Mock.mock(/^1[3-9]\d{9}$/) as string
				},
				learningGoal: LEARNING_GOALS[seq % LEARNING_GOALS.length],
				workExperience: (seq * 3) % 15,
				locationId:
					course.type === 'online' ? undefined : course.locations[0]?.id,
				timeSlot: course.type === 'online' ? undefined : course.timeSlots[0],
				dailyStudyTime: course.type === 'online' ? (1 + (seq % 4)) : undefined,
				extraFields: {},
				remarks: ''
			};
			list.push(app);
			seq++;
		}
	}

	return list;
}
