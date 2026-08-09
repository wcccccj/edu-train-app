/**
 * 申请业务逻辑 Handler
 */
import type {
	Application,
	ApplicationCreatePayload,
	ApplicationUpdatePayload,
	ApplicationQuery
} from '$lib/types/application.types';
import type { Page } from '$lib/types/common.types';
import { applicationStore } from '../store/applications.store';
import { courseStore } from '../store/courses.store';
import { locationStore } from '../store/locations.store';
import { normalizePage, paginate } from '../utils/pagination';

export function listApplications(userId: string, query: ApplicationQuery): Page<Application> {
	const { page, pageSize } = normalizePage(query.page, query.pageSize);
	let items = applicationStore.listByUser(userId);
	if (query.status) {
		items = items.filter((a) => a.status === query.status);
	}
	return paginate(items, page, pageSize);
}

export function getApplication(id: string): Application | null {
	return applicationStore.findById(id);
}

// 检查是否处于 24 小时锁定窗口内
function isLocked(startDate: string): boolean {
	const start = new Date(startDate).getTime();
	if (!Number.isFinite(start)) return false;
	const diff = start - Date.now();
	// 开课前 24 小时内，或者已经开课，都不允许修改
	return diff <= 86400_000;
}

export async function createApplication(
	userId: string,
	payload: ApplicationCreatePayload
): Promise<{ ok: boolean; reason?: string; application?: Application }> {
	const course = courseStore.findById(payload.courseId);
	if (!course) return { ok: false, reason: 'course_not_found' };

	if (course.status !== 'open') {
		return { ok: false, reason: 'course_full_or_closed' };
	}

	// 线下/混合课程必须校验地点容量
	if (course.type !== 'online') {
		if (!payload.locationId) return { ok: false, reason: 'missing_location' };
		const loc = locationStore.findById(course.id, payload.locationId);
		if (!loc) return { ok: false, reason: 'location_not_found' };

		// 触发 CAS 容量扣减
		const casRes = await locationStore.tryEnroll(course.id, loc.id, loc.enrolled);
		if (!casRes.ok) {
			return { ok: false, reason: casRes.reason }; // 可能是 cas_conflict 或 full
		}
	}

	// 更新课程维度的总报名人数与状态联动
	course.enrolled += 1;
	if (course.enrolled >= course.maxStudents) {
		course.status = 'full';
	}

	// 生成申请记录
	const app: Application = {
		...payload,
		id: `APP${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}${Math.floor(
			Math.random() * 1000
		)
			.toString()
			.padStart(3, '0')}`,
		userId,
		courseName: course.name,
		type: course.type,
		applyDate: new Date().toISOString().slice(0, 10),
		status: 'pending'
	};

	applicationStore.add(app);
	return { ok: true, application: app };
}

export function updateApplication(
	userId: string,
	appId: string,
	patch: ApplicationUpdatePayload
): { ok: boolean; reason?: string; application?: Application } {
	const app = applicationStore.findById(appId);
	if (!app) return { ok: false, reason: 'not_found' };
	if (app.userId !== userId) return { ok: false, reason: 'forbidden' };
	if (app.status !== 'pending' && app.status !== 'approved')
		return { ok: false, reason: 'invalid_status' };

	const course = courseStore.findById(app.courseId);
	if (!course) return { ok: false, reason: 'course_not_found' };

	if (isLocked(course.startDate)) {
		return { ok: false, reason: 'locked' };
	}

	const updated = applicationStore.update(appId, patch);
	return { ok: true, application: updated! };
}

export function deleteApplication(userId: string, appId: string): { ok: boolean; reason?: string } {
	const app = applicationStore.findById(appId);
	if (!app) return { ok: false, reason: 'not_found' };
	if (app.userId !== userId) return { ok: false, reason: 'forbidden' };

	// 这里简化处理，不限制撤销条件，实际业务可能需要判断状态
	applicationStore.remove(appId);

	// 注意：理论上撤销需要释放 course 和 location 的 enrolled 容量。
	// 为了保持 mock 的轻量级，此处不做复杂的级联回退补偿。
	return { ok: true };
}
