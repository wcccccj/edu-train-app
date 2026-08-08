import { describe, it, expect } from 'vitest';
import { buildEnrollmentSchema } from './enrollment-schema';
import dayjs from 'dayjs';

describe('buildEnrollmentSchema', () => {
	it('should return base schema for online course', () => {
		const schema = buildEnrollmentSchema({
			id: 'course-1',
			type: 'online',
			startTime: dayjs().add(2, 'day').toISOString()
		});

		expect(schema.sections).toHaveLength(1);
		expect(schema.sections[0].id).toBe('basic');
		expect(schema.sections[0].fields).toHaveLength(3);
	});

	it('should add location and timeSlot for offline course', () => {
		const schema = buildEnrollmentSchema({
			id: 'course-2',
			type: 'offline',
			startTime: dayjs().add(2, 'day').toISOString()
		});

		expect(schema.sections).toHaveLength(2);
		expect(schema.sections[1].id).toBe('specific');
		expect(schema.sections[1].fields.map((f) => f.name)).toContain('location');
		expect(schema.sections[1].fields.map((f) => f.name)).toContain('timeSlot');
	});

	it('should lock offline fields if within 24 hours of start time and isEdit=true', () => {
		const now = dayjs('2026-08-08T10:00:00Z');
		const startTime = dayjs('2026-08-09T09:00:00Z'); // 23 hours later

		const schema = buildEnrollmentSchema(
			{
				id: 'course-3',
				type: 'offline',
				startTime: startTime.toISOString()
			},
			now,
			true
		);

		const specificSection = schema.sections.find((s) => s.id === 'specific');
		const locationField = specificSection?.fields.find((f) => f.name === 'location');
		const timeSlotField = specificSection?.fields.find((f) => f.name === 'timeSlot');

		expect(locationField?.disabled).toBe(true);
		expect(timeSlotField?.disabled).toBe(true);

		const basicSection = schema.sections.find((s) => s.id === 'basic');
		expect(basicSection?.fields.find((f) => f.name === 'name')?.disabled).toBeFalsy();
	});

	it('should NOT lock offline fields for new enrollment even within 24 hours', () => {
		const now = dayjs('2026-08-08T10:00:00Z');
		const startTime = dayjs('2026-08-09T09:00:00Z'); // 23 hours later

		const schema = buildEnrollmentSchema(
			{
				id: 'course-3b',
				type: 'offline',
				startTime: startTime.toISOString()
			},
			now,
			false
		);

		const specificSection = schema.sections.find((s) => s.id === 'specific');
		const locationField = specificSection?.fields.find((f) => f.name === 'location');
		const timeSlotField = specificSection?.fields.find((f) => f.name === 'timeSlot');

		expect(locationField?.disabled).toBe(false);
		expect(timeSlotField?.disabled).toBe(false);
	});

	it('should not lock offline fields if more than 24 hours from start time', () => {
		const now = dayjs('2026-08-08T10:00:00Z');
		const startTime = dayjs('2026-08-09T11:00:00Z'); // 25 hours later

		const schema = buildEnrollmentSchema(
			{
				id: 'course-4',
				type: 'offline',
				startTime: startTime.toISOString()
			},
			now
		);

		const specificSection = schema.sections.find((s) => s.id === 'specific');
		const locationField = specificSection?.fields.find((f) => f.name === 'location');
		const timeSlotField = specificSection?.fields.find((f) => f.name === 'timeSlot');

		expect(locationField?.disabled).toBe(false);
		expect(timeSlotField?.disabled).toBe(false);
	});

	it('should default isEdit to false (new enrollment) when not provided', () => {
		const now = dayjs('2026-08-08T10:00:00Z');
		const startTime = dayjs('2026-08-09T09:00:00Z'); // 23 hours later

		const schema = buildEnrollmentSchema(
			{
				id: 'course-5',
				type: 'offline',
				startTime: startTime.toISOString()
			},
			now
		);

		const specificSection = schema.sections.find((s) => s.id === 'specific');
		const locationField = specificSection?.fields.find((f) => f.name === 'location');
		expect(locationField?.disabled).toBe(false);
	});

	it('should use course detail locations as location options when provided', () => {
		const schema = buildEnrollmentSchema({
			id: 'course-6',
			type: 'offline',
			startTime: dayjs().add(2, 'day').toISOString(),
			locations: [
				{ label: '北京培训中心 A 栋 301', value: '北京培训中心 A 栋 301' },
				{ label: '线上同步直播', value: '线上同步直播' }
			]
		});

		const specificSection = schema.sections.find((s) => s.id === 'specific');
		const locationField = specificSection?.fields.find((f) => f.name === 'location');
		expect(locationField?.options).toEqual([
			{ label: '北京培训中心 A 栋 301', value: '北京培训中心 A 栋 301' },
			{ label: '线上同步直播', value: '线上同步直播' }
		]);
	});

	it('should fall back to default location options when no course detail locations', () => {
		const schema = buildEnrollmentSchema({
			id: 'course-7',
			type: 'offline',
			startTime: dayjs().add(2, 'day').toISOString()
		});

		const specificSection = schema.sections.find((s) => s.id === 'specific');
		const locationField = specificSection?.fields.find((f) => f.name === 'location');
		expect(locationField?.options).toEqual([
			{ label: '北京中心', value: 'beijing' },
			{ label: '上海中心', value: 'shanghai' },
			{ label: '广州中心', value: 'guangzhou' }
		]);
	});

	it('should add extra fill-in fields (department, position) for special activity course', () => {
		const schema = buildEnrollmentSchema({
			id: 'course-8',
			type: 'online',
			startTime: dayjs().add(2, 'day').toISOString(),
			extraFields: [
				{
					name: 'department',
					label: '选择部门',
					type: 'select',
					required: true,
					options: [
						{ label: '研发部', value: 'rd' },
						{ label: '市场部', value: 'marketing' }
					]
				},
				{
					name: 'position',
					label: '选择岗位',
					type: 'select',
					required: true,
					options: [
						{ label: '工程师', value: 'engineer' },
						{ label: '产品经理', value: 'pm' }
					]
				}
			]
		});

		const extraSection = schema.sections.find((s) => s.id === 'extra');
		expect(extraSection).toBeDefined();
		expect(extraSection?.fields.map((f) => f.name)).toEqual(['department', 'position']);
		expect(extraSection?.fields[0].options).toEqual([
			{ label: '研发部', value: 'rd' },
			{ label: '市场部', value: 'marketing' }
		]);
	});

	it('should validate required extra fields in the schema', () => {
		const schema = buildEnrollmentSchema({
			id: 'course-9',
			type: 'online',
			startTime: dayjs().add(2, 'day').toISOString(),
			extraFields: [
				{
					name: 'department',
					label: '选择部门',
					type: 'select',
					required: true,
					options: [{ label: '研发部', value: 'rd' }]
				}
			]
		});

		const result = schema.validationSchema.safeParse({
			name: '张三',
			phone: '13800138000',
			address: '北京',
			department: ''
		});
		expect(result.success).toBe(false);

		const okResult = schema.validationSchema.safeParse({
			name: '张三',
			phone: '13800138000',
			address: '北京',
			department: 'rd'
		});
		expect(okResult.success).toBe(true);
	});

	it('should add no extra section when no extra fields provided', () => {
		const schema = buildEnrollmentSchema({
			id: 'course-10',
			type: 'online',
			startTime: dayjs().add(2, 'day').toISOString()
		});

		expect(schema.sections.find((s) => s.id === 'extra')).toBeUndefined();
	});
});
