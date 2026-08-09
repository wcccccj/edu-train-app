import type { FormSchema } from '$lib/types/form.types';

export const managementSchema: FormSchema = {
	category: '管理能力',
	label: '管理能力扩展信息',
	fields: [
		{
			key: 'teamSize',
			label: '管理团队规模',
			type: 'number',
			required: true,
			min: 1,
			max: 500,
			placeholder: '请输入直属管理人数'
		},
		{
			key: 'managementYears',
			label: '管理年限',
			type: 'number',
			required: true,
			min: 0,
			step: 0.5
		}
	]
};
