/**
 * 我的报名共享 Store
 *
 * 复用 EnrollmentStore.svelte.ts 的 localStorage 缓存策略：
 * 报名记录按「当前登录用户」维度持久化到浏览器 localStorage，
 * 使 /courses 页面报名后，/enrollments 页面能读取到对应报名信息，
 * 并在刷新/跨页跳转后仍然保留（mock 后端为进程内内存，重启即清空）。
 */
import type { ApplicationStatus } from '$lib/types/application.types';
import { userCache } from '$lib/utils/user-cache';

export type EnrollmentType = 'online' | 'offline' | 'hybrid';

/** 特殊活动课程需额外填写的字段（含配置与用户填写值） */
export interface EnrollmentExtraField {
	name: string;
	label: string;
	type: 'text' | 'select';
	required?: boolean;
	options?: { label: string; value: string }[];
	value: string;
}

/** 报名记录（前端展示所需字段，与后端 Application 解耦） */
export interface Enrollment {
	id: string;
	userId: string;
	courseId: string;
	courseName: string;
	type: EnrollmentType;
	applyDate: string;
	status: ApplicationStatus;
	name: string;
	phone: string;
	/** 常用地址（报名时填写，可修改） */
	address?: string;
	/** 培训地点（线下课程所选地点，线上课程为空） */
	location?: string;
	/** 培训地点下拉选项（报名时的选项，修改时用于重建选择框，保持与报名表单一致） */
	locationOptions?: { label: string; value: string }[];
	/** 培训时段（线下课程：morning / afternoon） */
	timeSlot?: string;
	/** 特殊活动课程的额外填写字段（含配置与用户填写值） */
	extraFields?: EnrollmentExtraField[];
	/** 课程开始时间（ISO 字符串） */
	startTime?: string;
}

const isBrowser = typeof window !== 'undefined';

class EnrollmentsStore {
	enrollments = $state<Enrollment[]>([]);

	private currentUserId: string | null = null;

	/** 按当前登录用户加载缓存；首次调用、切换用户或登出时执行 */
	init(userId: string | null): void {
		if (this.currentUserId === userId) return;
		this.currentUserId = userId;
		this.enrollments = userId ? this.load(userId) : [];
	}

	private load(userId: string): Enrollment[] {
		return userCache.get<Enrollment[]>('enrollment_status', userId) ?? [];
	}

	private save(): void {
		if (!isBrowser || !this.currentUserId) return;
		userCache.set('enrollment_status', this.currentUserId, this.enrollments);
	}

	add(app: Enrollment): void {
		this.enrollments = [app, ...this.enrollments];
		this.save();
	}

	update(id: string, patch: Partial<Enrollment>): void {
		this.enrollments = this.enrollments.map((a) =>
			a.id === id ? { ...a, ...patch, id: a.id, userId: a.userId } : a
		);
		this.save();
	}

	remove(id: string): void {
		this.enrollments = this.enrollments.filter((a) => a.id !== id);
		this.save();
	}

	clear(): void {
		this.enrollments = [];
		if (isBrowser && this.currentUserId) {
			userCache.remove('enrollment_status', this.currentUserId);
		}
	}
}

export const enrollmentsStore = new EnrollmentsStore();
