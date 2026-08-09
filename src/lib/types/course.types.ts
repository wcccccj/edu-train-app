/**
 * 课程与地点类型契约
 */

export type CourseType = 'online' | 'offline' | 'hybrid';
export type CourseStatus = 'open' | 'full' | 'closed';

export interface Location {
	id: string;
	name: string;
	address: string;
	capacity: number;
	enrolled: number;
}

export interface Course {
	id: number;
	name: string;
	type: CourseType;
	category: string;
	startDate: string;
	endDate: string;
	duration: string;
	instructor: string;
	price: number;
	maxStudents: number;
	enrolled: number;
	status: CourseStatus;
	description: string;
	locations: Location[];
	timeSlots: string[];
}

/** 课程列表查询参数 */
export interface CourseQuery {
	keyword?: string;
	type?: CourseType | '';
	status?: CourseStatus | '';
	page?: number;
	pageSize?: number;
}
