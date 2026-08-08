import type { FormSchema } from '$lib/types/form.types';

export const safetySchema: FormSchema = {
	category: '安全管理',
	label: '安全管理扩展信息',
	fields: [
		{
			key: 'certNo',
			label: '安全资格证书编号',
			type: 'text',
			required: true,
			pattern: '^SAF\\d{8}$',
			placeholder: '如 SAF12345678',
			helpText: '需提供有效的国家级安全认证编号'
		},
		{
			key: 'certExpiry',
			label: '证书有效期',
			type: 'date',
			required: true
		},
		{
			key: 'riskLevel',
			label: '岗位风险等级',
			type: 'select',
			required: true,
			options: [
				{ label: '低风险', value: 'low' },
				{ label: '中等风险', value: 'medium' },
				{ label: '高风险', value: 'high' }
			]
		}
	]
};
