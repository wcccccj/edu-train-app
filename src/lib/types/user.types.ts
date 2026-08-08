/**
 * 用户类型契约
 */

export type Gender = 'male' | 'female';

export interface User {
	/** 形如 user-001 */
	id: string;
	name: string;
	gender: Gender;
	phone: string;
	email: string;
	department: string;
	position: string;
	avatar?: string;
}
