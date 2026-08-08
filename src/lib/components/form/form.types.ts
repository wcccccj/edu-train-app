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
