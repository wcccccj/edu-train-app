/**
 * 个人学习进度 Store
 *
 * 按当前登录用户的 user_id 维度持久化学习进度，
 * 不同用户的学习进度相互隔离，互不干扰。
 */
import { userCache } from '$lib/utils/user-cache';

export interface CourseProgress {
	/** 课程 ID */
	courseId: string;
	/** 学习进度百分比 0-100 */
	progress: number;
	/** 最近学习时间（ISO 字符串） */
	lastStudiedAt: string;
}

const isBrowser = typeof window !== 'undefined';

class LearningProgressStore {
	progress = $state<CourseProgress[]>([]);

	private currentUserId: string | null = null;

	/** 按当前登录用户加载学习进度；切换用户时重新加载 */
	init(userId: string | null): void {
		if (this.currentUserId === userId) return;
		this.currentUserId = userId;
		this.progress = userId && isBrowser ? (userCache.get<CourseProgress[]>('learning_progress', userId) ?? []) : [];
	}

	private save(): void {
		if (!isBrowser || !this.currentUserId) return;
		userCache.set('learning_progress', this.currentUserId, this.progress);
	}

	addOrUpdate(entry: CourseProgress): void {
		const index = this.progress.findIndex((p) => p.courseId === entry.courseId);
		if (index >= 0) {
			this.progress[index] = entry;
		} else {
			this.progress = [...this.progress, entry];
		}
		this.save();
	}

	remove(courseId: string): void {
		this.progress = this.progress.filter((p) => p.courseId !== courseId);
		this.save();
	}

	clear(): void {
		this.progress = [];
		if (isBrowser && this.currentUserId) {
			userCache.remove('learning_progress', this.currentUserId);
		}
	}
}

export const learningProgressStore = new LearningProgressStore();