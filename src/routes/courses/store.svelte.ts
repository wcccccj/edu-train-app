import type { CourseLocation } from '$lib/components/CourseCard.svelte';
import type { CourseExtraField } from '$lib/types/course.types';
import type { EnrollmentExtraField } from '$lib/stores/enrollments.store.svelte';
import { userCache } from '$lib/utils/user-cache';

export interface Course {
	id: string;
	title: string;
	description: string;
	startTime: string;
	locations: CourseLocation[];
	capacity: number;
	type: 'online' | 'offline';
	/** 课程已报名人数（来自 mock 数据源） */
	enrolled?: number;
	/** 特殊活动课程的额外填写项 */
	extraFields?: CourseExtraField[];
}

export interface Registration {
	id: string;
	courseId: string;
	name: string;
	phone: string;
	address: string;
	location?: string;
	timeSlot?: string;
	/** 特殊活动课程的额外填写字段（含配置与用户填写值） */
	extraFields?: EnrollmentExtraField[];
}

const isBrowser = typeof window !== 'undefined';

export class CoursesStore {
	registrations = $state<Registration[]>([]);

	private currentUserId: string | null = null;

	/**
	 * 按当前登录用户加载报名记录；切换用户时重新加载，
	 * 避免不同用户之间出现报名状态串数据。
	 */
	init(userId: string | null): void {
		if (this.currentUserId === userId) return;
		this.currentUserId = userId;
		this.registrations = userId ? this.load(userId) : [];
	}

	private load(userId: string): Registration[] {
		return isBrowser ? (userCache.get<Registration[]>('course_registrations', userId) ?? []) : [];
	}

	private save(): void {
		if (!isBrowser || !this.currentUserId) return;
		userCache.set('course_registrations', this.currentUserId, this.registrations);
	}

	addRegistration(reg: Registration) {
		this.registrations.push(reg);
		this.save();
	}

	updateRegistration(id: string, updates: Partial<Registration>) {
		const index = this.registrations.findIndex((r) => r.id === id);
		if (index !== -1) {
			this.registrations[index] = { ...this.registrations[index], ...updates };
			this.save();
		}
	}

	removeRegistration(id: string) {
		this.registrations = this.registrations.filter((r) => r.id !== id);
		this.save();
	}

	getRegistrationForCourse(courseId: string): Registration | undefined {
		return this.registrations.find((r) => r.courseId === courseId);
	}

	getRegisteredCount(courseId: string): number {
		return this.registrations.filter((r) => r.courseId === courseId).length;
	}

	/** 清空当前用户的报名记录（内存 + 持久化缓存） */
	clear(): void {
		this.registrations = [];
		if (isBrowser && this.currentUserId) {
			userCache.remove('course_registrations', this.currentUserId);
		}
	}
}

export const coursesStore = new CoursesStore();
