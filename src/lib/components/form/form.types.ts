import { z } from 'zod';

export type FieldType = 'text' | 'tel' | 'textarea' | 'select' | 'datetime-local';

export interface FormFieldOption {
	label: string;
	value: string;
}

export interface FormField {
	name: string;
	label: string;
	type: FieldType;
	placeholder?: string;
	options?: FormFieldOption[];
	disabled?: boolean;
	required?: boolean;
	fullWidth?: boolean;
}

export interface FormSection {
	id: string;
	title: string;
	theme?: 'default' | 'highlight';
	badge?: string;
	fields: FormField[];
}

export interface SectionedFormSchema {
	sections: FormSection[];
	validationSchema: z.ZodSchema;
}

/**
 * 动态表单数据：字段值统一为字符串（未填则为 undefined）。
 * 报名表单字段均为文本类输入（text/tel/textarea/select/datetime-local）。
 */
export type FormValues = Record<string, string | undefined>;
