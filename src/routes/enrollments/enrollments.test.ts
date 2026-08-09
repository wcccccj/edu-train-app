import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';

vi.mock('$app/environment', () => ({ browser: true }));
vi.mock('$app/paths', () => ({ resolve: (path: string) => path }));
import EnrollmentsPage from './+page.svelte';
import { enrollmentsStore, type Enrollment } from '$lib/stores/enrollments.store.svelte';

const mockEnrollments: Enrollment[] = [
	{
		id: 'app-001',
		userId: 'user-1',
		courseId: 'course-1',
		courseName: 'Svelte 基础',
		type: 'online',
		applyDate: '2026-08-01',
		status: 'pending',
		name: '张三',
		phone: '13812345678',
		address: '北京市朝阳区某小区 1 号楼',
		startTime: '2026-09-01T09:00:00'
	},
	{
		id: 'app-002',
		userId: 'user-1',
		courseId: 'course-2',
		courseName: '篮球训练营',
		type: 'offline',
		applyDate: '2026-08-02',
		status: 'approved',
		name: '李四',
		phone: '13987654321',
		address: '上海市浦东新区某路 88 号',
		location: '北京中心',
		locationOptions: [
			{ label: '北京中心', value: '北京中心' },
			{ label: '上海中心', value: '上海中心' },
			{ label: '广州中心', value: '广州中心' }
		],
		timeSlot: 'morning',
		startTime: '2026-09-05T14:00:00'
	}
];

describe('Enrollments Page', () => {
	beforeEach(() => {
		enrollmentsStore.enrollments = structuredClone(mockEnrollments);
	});

	afterEach(() => {
		cleanup();
		enrollmentsStore.enrollments = [];
	});

	it('should hide the 申请编号 column', () => {
		render(EnrollmentsPage);
		expect(screen.queryByText('申请编号')).not.toBeInTheDocument();
	});

	it('should split 报名人 and 联系方式 into separate columns and mask phone', () => {
		render(EnrollmentsPage);
		expect(screen.getByText('报名人')).toBeInTheDocument();
		expect(screen.getByText('联系方式')).toBeInTheDocument();
		expect(screen.getByText('138****5678')).toBeInTheDocument();
		expect(screen.queryByText('13812345678')).not.toBeInTheDocument();
	});

	it('should show 培训地点 and 开始时间 columns', () => {
		render(EnrollmentsPage);
		expect(screen.getByText('培训地点')).toBeInTheDocument();
		expect(screen.getByText('开始时间')).toBeInTheDocument();
		// 线下课程显示地点，线上课程（培训类型 + 培训地点）显示「线上」
		expect(screen.getByText('北京中心')).toBeInTheDocument();
		expect(screen.getAllByText('线上').length).toBeGreaterThan(0);
	});

	it('should filter online enrollments via the dedicated entry', async () => {
		render(EnrollmentsPage);
		const onlineFilter = screen.getByRole('button', { name: '线上课程' });
		await fireEvent.click(onlineFilter);
		expect(screen.queryByText('篮球训练营')).not.toBeInTheDocument();
		expect(screen.getByText('Svelte 基础')).toBeInTheDocument();
	});

	it('should open the edit modal and update the enrollment', async () => {
		render(EnrollmentsPage);
		const editButtons = screen.getAllByRole('button', { name: /修改/ });
		await fireEvent.click(editButtons[0]);

		expect(screen.getByText('修改报名信息')).toBeInTheDocument();

		const nameInput = screen.getByLabelText(/姓名/) as HTMLInputElement;
		await fireEvent.input(nameInput, { target: { value: '张三丰' } });

		const addressInput = screen.getByLabelText(/常用地址/) as HTMLInputElement;
		await fireEvent.input(addressInput, { target: { value: '广东省深圳市某路 66 号' } });

		const submitButton = screen.getByRole('button', { name: '保存修改' });
		await fireEvent.click(submitButton);

		expect(screen.queryByText('修改报名信息')).not.toBeInTheDocument();
		const updated = enrollmentsStore.enrollments.find((e) => e.id === 'app-001');
		expect(updated?.name).toBe('张三丰');
		expect(updated?.phone).toBe('13812345678');
		expect(updated?.address).toBe('广东省深圳市某路 66 号');
	});

	it('should render and update extra fields for a special activity enrollment', async () => {
		enrollmentsStore.enrollments = [
			{
				id: 'app-special',
				userId: 'user-1',
				courseId: 'course-special',
				courseName: '年度新技术嘉年华（特殊活动）',
				type: 'offline',
				applyDate: '2026-08-03',
				status: 'pending',
				name: '王五',
				phone: '13712345678',
				address: '北京市海淀区某路 1 号',
				location: '北京中心',
				timeSlot: 'morning',
				extraFields: [
					{
						name: 'department',
						label: '所属部门',
						type: 'select',
						required: true,
						options: [
							{ label: '技术部', value: 'tech' },
							{ label: '市场部', value: 'market' }
						],
						value: 'tech'
					},
					{ name: 'position', label: '岗位', type: 'text', required: true, value: '前端工程师' }
				],
				startTime: '2026-09-10T09:00:00'
			}
		];
		render(EnrollmentsPage);

		const editButton = screen.getByRole('button', { name: /修改/ });
		await fireEvent.click(editButton);

		// 特殊活动课程应展示「附加信息」分区
		expect(screen.getByText('附加信息')).toBeInTheDocument();
		expect(screen.getByText('所属部门')).toBeInTheDocument();
		expect(screen.getByText('岗位')).toBeInTheDocument();

		// 修改岗位值并保存
		const positionInput = screen.getByLabelText(/岗位/) as HTMLInputElement;
		await fireEvent.input(positionInput, { target: { value: '高级前端工程师' } });

		const submitButton = screen.getByRole('button', { name: '保存修改' });
		await fireEvent.click(submitButton);

		expect(screen.queryByText('修改报名信息')).not.toBeInTheDocument();
		const updated = enrollmentsStore.enrollments.find((e) => e.id === 'app-special');
		expect(updated?.extraFields?.find((f) => f.name === 'position')?.value).toBe('高级前端工程师');
		expect(updated?.extraFields?.find((f) => f.name === 'department')?.value).toBe('tech');
	});

	it('should render 培训地点 as a select in the edit modal for offline enrollments', async () => {
		render(EnrollmentsPage);
		const editButton = screen.getAllByRole('button', { name: /修改/ })[1];
		await fireEvent.click(editButton);

		// 培训地点应为选择框（而非输入框），且选项与报名表单一致（含「请选择」占位 + 3 个地点）
		const locationSelect = screen.getByLabelText(/培训地点/) as HTMLSelectElement;
		expect(locationSelect.tagName).toBe('SELECT');
		expect(locationSelect.options.length).toBe(4);
		expect(screen.getByText('上海中心')).toBeInTheDocument();
	});

	it('should show default placeholder for empty courseName, name and applyDate', () => {
		enrollmentsStore.enrollments = [
			{
				id: 'app-empty',
				userId: 'user-1',
				courseId: 'course-empty',
				courseName: '',
				type: 'online',
				applyDate: '',
				status: 'pending',
				name: '',
				phone: ''
			}
		];
		render(EnrollmentsPage);

		// 空值应显示缺省「—」：课程名称、报名人、手机号、开始时间、申请时间
		expect(screen.getAllByText('—')).toHaveLength(5);
	});
});
