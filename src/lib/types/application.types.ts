/**
 * 申请记录类型契约
 */

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type ApplicationType = 'online' | 'offline' | 'hybrid';

export interface EmergencyContact {
	name: string;
	phone: string;
}

/** 申请记录提交/详情通用结构 */
export interface Application {
	id: string;
	/** 归属用户 ID（与请求头 x-mock-user 对应） */
	userId: string;
	courseId: number;
	courseName: string;
	type: ApplicationType;
	applyDate: string;
	status: ApplicationStatus;
	name: string;
	gender: 'male' | 'female';
	phone: string;
	email: string;
	department: string;
	position: string;
	address: string;
	emergencyContact?: EmergencyContact;
	learningGoal: string;
	workExperience?: number;
	locationId?: string;
	timeSlot?: string;
	dailyStudyTime?: number;
	/** 动态扩展字段（来自 schema 端点） */
	extraFields?: Record<string, unknown>;
	remarks?: string;
}

/** 提交申请时的入参（不包含 id / userId / status 等服务端字段） */
export type ApplicationCreatePayload = Omit<
	Application,
	'id' | 'userId' | 'status' | 'applyDate' | 'courseName' | 'type'
>;

/** 修改申请时的入参（仅允许部分白名单字段） */
export type ApplicationUpdatePayload = Partial<
	Pick<
		Application,
		| 'phone'
		| 'email'
		| 'address'
		| 'emergencyContact'
		| 'learningGoal'
		| 'workExperience'
		| 'timeSlot'
		| 'dailyStudyTime'
		| 'extraFields'
		| 'remarks'
	>
>;

/** 申请列表筛选参数 */
export interface ApplicationQuery {
	status?: ApplicationStatus | '';
	page?: number;
	pageSize?: number;
}
