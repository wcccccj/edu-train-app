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

export interface CourseExtraFieldOption {
	label: string;
	value: string;
}

/** 特殊活动课程需额外填写的字段（如选择部门、选择岗位） */
export interface CourseExtraField {
	name: string;
	label: string;
	type: 'text' | 'select';
	required?: boolean;
	options?: CourseExtraFieldOption[];
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
	/** 特殊活动课程的额外填写项（可选） */
	extraFields?: CourseExtraField[];
}

/** 课程列表查询参数 */
export interface CourseQuery {
	keyword?: string;
	type?: CourseType | '';
	status?: CourseStatus | '';
	page?: number;
	pageSize?: number;
}
