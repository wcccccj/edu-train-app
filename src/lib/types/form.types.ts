/**
 * 动态表单 Schema 类型契约
 * 用于驱动前端根据课程分类渲染扩展字段
 */

export type FormFieldType = 'text' | 'number' | 'date' | 'select' | 'textarea';

export interface BaseFormField {
	key: string;
	label: string;
	type: FormFieldType;
	required: boolean;
	placeholder?: string;
	helpText?: string;
}

export interface TextFormField extends BaseFormField {
	type: 'text' | 'textarea';
	pattern?: string;
	maxLength?: number;
}

export interface NumberFormField extends BaseFormField {
	type: 'number';
	min?: number;
	max?: number;
	step?: number;
}

export interface DateFormField extends BaseFormField {
	type: 'date';
	minDate?: string;
	maxDate?: string;
}

export interface SelectFormField extends BaseFormField {
	type: 'select';
	options: Array<{ label: string; value: string }>;
}

export type FormField = TextFormField | NumberFormField | DateFormField | SelectFormField;

export interface FormSchema {
	category: string;
	label: string;
	fields: FormField[];
}

/** Schema 索引（category → schema） */
export type FormSchemaMap = Record<string, FormSchema>;
