import { z } from 'zod';
import type { SectionedFormSchema, FormField, FormSection } from './form.types';
import dayjs from 'dayjs';

export interface CourseLocationOption {
	label: string;
	value: string;
}

export interface CourseInfo {
	id: string;
	type: 'online' | 'offline';
	startTime: string;
	/** 课程实际培训地点（来自课程详情 /api/courses/[id]），为空时使用默认地点 */
	locations?: CourseLocationOption[];
	/** 特殊活动课程需额外填写的字段（如选择部门、选择岗位等） */
	extraFields?: FormField[];
}

/** 未取到课程详情时的兜底地点选项 */
export const DEFAULT_LOCATIONS: CourseLocationOption[] = [
	{ label: '北京中心', value: 'beijing' },
	{ label: '上海中心', value: 'shanghai' },
	{ label: '广州中心', value: 'guangzhou' }
];

export function buildEnrollmentSchema(
	course: CourseInfo,
	now?: dayjs.Dayjs,
	isEdit = false
): SectionedFormSchema {
	const currentTime = now || dayjs();
	const isLocked = isEdit && dayjs(course.startTime).diff(currentTime, 'hour') < 24;

	const basicFields: FormField[] = [
		{ name: 'name', label: '姓名', type: 'text', placeholder: '请输入姓名', required: true },
		{ name: 'phone', label: '手机号', type: 'tel', placeholder: '请输入手机号', required: true },
		{
			name: 'address',
			label: '常用地址',
			type: 'text',
			placeholder: '请输入常用地址',
			required: true,
			fullWidth: true
		}
	];

	const zObject: Record<string, z.ZodTypeAny> = {
		name: z.string().min(1, '姓名不能为空'),
		phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
		address: z.string().min(1, '常用地址不能为空')
	};

	const sections: FormSection[] = [
		{
			id: 'basic',
			title: '基础信息',
			theme: 'default',
			fields: basicFields
		}
	];

	if (course.type === 'offline') {
		const locationOptions = course.locations?.length ? course.locations : DEFAULT_LOCATIONS;
		const specificFields: FormField[] = [
			{
				name: 'location',
				label: '培训地点',
				type: 'select',
				disabled: isLocked,
				required: true,
				options: locationOptions
			},
			{
				name: 'timeSlot',
				label: '培训时段',
				type: 'select',
				disabled: isLocked,
				required: true,
				options: [
					{ label: '上午 09:00 - 12:00', value: 'morning' },
					{ label: '下午 14:00 - 17:00', value: 'afternoon' }
				]
			}
		];

		zObject.location = z.string().min(1, '请选择培训地点');
		zObject.timeSlot = z.string().min(1, '请选择培训时段');

		sections.push({
			id: 'specific',
			title: '课程信息',
			theme: 'default',
			fields: specificFields
		});
	}

	// 特殊活动课程：追加额外填写字段（如选择部门、选择岗位）
	if (course.extraFields?.length) {
		const extraFields = course.extraFields.map((field) => ({ ...field }));
		extraFields.forEach((field) => {
			if (!field.required && field.type === 'select') {
				zObject[field.name] = z.string().optional();
			} else {
				zObject[field.name] = z.string().min(1, `${field.label}不能为空`);
				if (field.type === 'select') {
					const values = field.options?.map((o) => o.value) ?? [];
					zObject[field.name] = z.enum(values as [string, ...string[]]) as z.ZodTypeAny;
				}
			}
		});

		sections.push({
			id: 'extra',
			title: '附加信息',
			theme: 'default',
			fields: extraFields
		});
	}

	return {
		sections,
		validationSchema: z.object(zObject)
	};
}
