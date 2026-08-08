import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import CourseCard, {
	type CourseCardCourse,
	type CourseCardRegistration,
	type CourseCardProps,
	type CourseLocation
} from './CourseCard.svelte';

const FUTURE = new Date(Date.now() + 5 * 86400000).toISOString();
const SOON = new Date(Date.now() + 12 * 3600 * 1000).toISOString();
const PAST = new Date(Date.now() - 2 * 86400000).toISOString();

const SINGLE_LOC_WITH_CAP: CourseLocation[] = [{ name: '线上直播', capacity: 50 }];

const SINGLE_LOC_NO_CAP: CourseLocation[] = [{ name: '腾讯会议（报名后发送链接）' }];

const MULTI_LOC_ALL_CAP: CourseLocation[] = [
	{ name: '深圳培训中心 C 栋 201', capacity: 20 },
	{ name: '杭州培训中心 E 栋 405', capacity: 20 },
	{ name: '成都培训中心 F 栋 308', capacity: 25 }
];

const MULTI_LOC_MIXED: CourseLocation[] = [
	{ name: '上海培训中心 B 栋 102', capacity: 25 },
	{ name: '线上同步直播（无名额限制）' }
];

const MULTI_LOC_NONE_CAP: CourseLocation[] = [
	{ name: '北京 · 中关村创业大街 1 号' },
	{ name: '上海 · 徐汇漕河泾开发区创新中心' },
	{ name: '线上 · Discord 语音频道' }
];

const MULTI_LOC_BOUNDARY: CourseLocation[] = [
	{ name: '容量 0（不应展示）', capacity: 0 },
	{ name: '容量负数（不应展示）', capacity: -5 },
	{ name: '容量 NaN（不应展示）', capacity: NaN },
	{ name: '容量 undefined（不应展示）' },
	{ name: '容量正常正数（应展示）', capacity: 42 }
];

const baseCourse: CourseCardCourse = {
	id: 'c-1',
	title: 'Svelte 5 核心特性实战',
	description: '深入学习 Runes 响应式系统、Snippets 与 SvelteKit 的最佳实践。',
	startTime: FUTURE,
	locations: SINGLE_LOC_WITH_CAP,
	capacity: 50,
	type: 'online'
};

const baseRegistration: CourseCardRegistration = {
	id: 'r-1',
	courseId: 'c-1',
	name: '张三',
	phone: '13800138000',
	address: '北京市朝阳区示例路 1 号',
	location: 'beijing',
	timeSlot: 'morning'
};

function buildProps(overrides: Partial<CourseCardProps> = {}): CourseCardProps {
	return {
		course: baseCourse,
		registeredCount: 10,
		onRegister: vi.fn(),
		onCancel: vi.fn(),
		...overrides
	};
}

function formatDateCN(iso: string) {
	return new Date(iso).toLocaleString('zh-CN', {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

describe('CourseCard 组件 · 培训地点展示优化', () => {
	describe('类型系统：CourseLocation 导出与约束', () => {
		it('CourseLocation 接口仅 name 必填，capacity 完全可选', () => {
			const loc1: CourseLocation = { name: 'A' };
			const loc2: CourseLocation = { name: 'B', capacity: 10 };
			expect(loc1.capacity).toBeUndefined();
			expect(loc2.capacity).toBe(10);
		});

		it('CourseCardCourse 类型要求 locations 为数组，单一字符串不再兼容', () => {
			const course: CourseCardCourse = {
				...baseCourse,
				locations: [{ name: '单地点唯一值' }]
			};
			expect(Array.isArray(course.locations)).toBe(true);
			expect(course.locations.length).toBe(1);
		});
	});

	describe('单地点场景展示逻辑', () => {
		it('单地点 + 有 capacity：同一行展示地点名 + 「限 N 人」徽章', () => {
			render(
				CourseCard,
				buildProps({
					course: { ...baseCourse, locations: SINGLE_LOC_WITH_CAP }
				})
			);
			expect(screen.getByText('线上直播')).toBeInTheDocument();
			const badge = screen.getByText(/限\s*50\s*人/);
			expect(badge).toBeInTheDocument();
			expect(badge.classList.contains('bg-blue-50')).toBe(true);
			expect(badge.classList.contains('text-blue-700')).toBe(true);
		});

		it('单地点 + 无 capacity：仅展示地点名称，完全不渲染「限 N 人」节点', () => {
			render(
				CourseCard,
				buildProps({
					course: { ...baseCourse, locations: SINGLE_LOC_NO_CAP }
				})
			);
			expect(screen.getByText('腾讯会议（报名后发送链接）')).toBeInTheDocument();
			expect(screen.queryByText(/限\s*\d+\s*人/)).not.toBeInTheDocument();
		});

		it('单地点布局：不渲染带标题的多地点分组容器（培训地点 N 块）', () => {
			const { container } = render(
				CourseCard,
				buildProps({
					course: { ...baseCourse, locations: SINGLE_LOC_WITH_CAP }
				})
			);
			const multiTitle = container.querySelector('div > div > div.text-xs.font-semibold');
			expect(multiTitle).toBeNull();
			const ul = container.querySelector('ul.space-y-1');
			expect(ul).toBeNull();
		});
	});

	describe('多地点场景 · 规范化排布与层级', () => {
		it('多地点：渲染带「培训地点（N）」标题的分组容器', () => {
			render(
				CourseCard,
				buildProps({
					course: { ...baseCourse, locations: MULTI_LOC_ALL_CAP }
				})
			);
			const title = screen.getByText(/培训地点\s*（\s*3\s*）/);
			expect(title).toBeInTheDocument();
			expect(title.tagName).toBe('SPAN');
		});

		it('多地点：每个地点以蓝色圆点前缀 + 列表项独立展示', () => {
			const { container } = render(
				CourseCard,
				buildProps({
					course: { ...baseCourse, locations: MULTI_LOC_ALL_CAP }
				})
			);
			const list = container.querySelector('ul.space-y-1');
			expect(list).not.toBeNull();
			const items = list!.querySelectorAll('li');
			expect(items.length).toBe(3);
			items.forEach((li) => {
				const dot = li.querySelector('span.h-1\\.5');
				expect(dot).not.toBeNull();
				expect(dot!.classList.contains('bg-blue-500')).toBe(true);
			});
		});

		it('多地点 · 全部有容量：每个地点均渲染独立容量徽章', () => {
			const { container } = render(
				CourseCard,
				buildProps({
					course: { ...baseCourse, locations: MULTI_LOC_ALL_CAP }
				})
			);
			MULTI_LOC_ALL_CAP.forEach((loc) => {
				expect(screen.getByText(loc.name)).toBeInTheDocument();
				const badges = screen.getAllByText(new RegExp(`^限\\s*${loc.capacity}\\s*人$`));
				expect(badges.length).toBeGreaterThanOrEqual(1);
				badges.forEach((b) => {
					expect(b.classList.contains('bg-blue-50')).toBe(true);
					expect(b.classList.contains('text-blue-700')).toBe(true);
				});
			});
			const total = container.querySelectorAll('.bg-blue-50.text-blue-700').length;
			expect(total).toBe(MULTI_LOC_ALL_CAP.length);
		});

		it('多地点 · 混合容量：仅配置了有效 capacity 的地点显示徽章', () => {
			render(
				CourseCard,
				buildProps({
					course: { ...baseCourse, locations: MULTI_LOC_MIXED }
				})
			);
			expect(screen.getByText('上海培训中心 B 栋 102')).toBeInTheDocument();
			expect(screen.getByText('线上同步直播（无名额限制）')).toBeInTheDocument();
			expect(screen.getByText('限 25 人')).toBeInTheDocument();
			const allBadges = screen.getAllByText(/限\s*\d+\s*人/);
			expect(allBadges.length).toBe(1);
		});

		it('多地点 · 全部无容量：所有地点不显示任何「限 N 人」徽章', () => {
			render(
				CourseCard,
				buildProps({
					course: { ...baseCourse, locations: MULTI_LOC_NONE_CAP }
				})
			);
			MULTI_LOC_NONE_CAP.forEach((loc) => {
				expect(screen.getByText(loc.name)).toBeInTheDocument();
			});
			expect(screen.queryByText(/限\s*\d+\s*人/)).not.toBeInTheDocument();
		});

		it('多地点 · 分组容器样式：圆角 + 浅灰边框 + 背景淡色，确保视觉分组', () => {
			const { container } = render(
				CourseCard,
				buildProps({
					course: { ...baseCourse, locations: MULTI_LOC_ALL_CAP }
				})
			);
			const wrap = container.querySelector(
				'div.mt-3.space-y-1\\.5.rounded-md.border.border-slate-100'
			);
			expect(wrap).not.toBeNull();
			expect(wrap!.classList.contains('bg-slate-50/50')).toBe(true);
			expect(wrap!.classList.contains('p-3')).toBe(true);
		});
	});

	describe('人数限制条件渲染 · 严格守卫 hasValidCapacity', () => {
		it.each([
			['capacity = 0', 0, false],
			['capacity = -1', -1, false],
			['capacity = -999', -999, false],
			['capacity = NaN', NaN, false],
			['capacity = undefined', undefined, false],
			['capacity = 1', 1, true],
			['capacity = 42', 42, true],
			['capacity = 1_000_000', 1_000_000, true]
		])('容量条件渲染：%s → %s', (_name: string, cap: number | undefined, shouldShow: boolean) => {
			const locs: CourseLocation[] = [
				{ name: `地点-${_name}`, capacity: cap as number | undefined }
			];
			render(
				CourseCard,
				buildProps({
					course: { ...baseCourse, locations: locs }
				})
			);
			expect(screen.getByText(`地点-${_name}`)).toBeInTheDocument();
			if (shouldShow) {
				expect(screen.getByText(`限 ${cap} 人`)).toBeInTheDocument();
			} else {
				expect(screen.queryByText(/限\s*-?\d+\s*人/)).not.toBeInTheDocument();
				expect(screen.queryByText(/限\s*NaN\s*人/)).not.toBeInTheDocument();
			}
		});

		it('边界混合：0/负数/NaN/undefined/正常正数 → 仅最后一项显示徽章', () => {
			render(
				CourseCard,
				buildProps({
					course: { ...baseCourse, locations: MULTI_LOC_BOUNDARY }
				})
			);
			MULTI_LOC_BOUNDARY.forEach((loc) => {
				expect(screen.getByText(loc.name)).toBeInTheDocument();
			});
			const badges = screen.queryAllByText(/限\s*-?\d+\s*人/);
			expect(badges.length).toBe(1);
			expect(badges[0].textContent).toContain('42');
		});
	});

	describe('基础渲染 · 原有功能零回归', () => {
		beforeEach(() => {
			render(CourseCard, buildProps());
		});

		it('正确渲染课程标题（H3）', () => {
			const titleEl = screen.getByRole('heading', { level: 3 });
			expect(titleEl).toHaveTextContent(baseCourse.title);
		});

		it('正确渲染课程简介描述', () => {
			expect(screen.getByText(baseCourse.description)).toBeInTheDocument();
		});

		it('正确渲染 zh-CN 本地化开始时间', () => {
			const expected = formatDateCN(baseCourse.startTime);
			expect(screen.getByText(expected)).toBeInTheDocument();
		});

		it('右上角渲染总容量进度：registeredCount / capacity', () => {
			expect(screen.getByText(/10\s*\/\s*50/)).toBeInTheDocument();
		});

		it('描述启用 line-clamp-2 截断', () => {
			const desc = screen.getByText(baseCourse.description);
			expect(desc.classList.contains('line-clamp-2')).toBe(true);
		});
	});

	describe('状态徽章 + 按钮交互 · 零回归', () => {
		it('开放报名中：未报名且有剩余名额', () => {
			render(CourseCard, buildProps({ registeredCount: 5 }));
			expect(screen.getByText('开放报名中')).toBeInTheDocument();
			const btn = screen.getByRole('button', { name: '立即报名' });
			expect(btn).toBeInTheDocument();
			expect(btn).not.toBeDisabled();
		});

		it('名额已满：registeredCount >= capacity', () => {
			render(CourseCard, buildProps({ registeredCount: baseCourse.capacity }));
			expect(screen.getByText('名额已满')).toBeInTheDocument();
			expect(screen.getByRole('button', { name: '无法报名' })).toBeDisabled();
		});

		it('已结束：startTime 早于当前时间', () => {
			render(
				CourseCard,
				buildProps({
					course: { ...baseCourse, startTime: PAST }
				})
			);
			expect(screen.getByText('已结束')).toBeInTheDocument();
			expect(screen.getByRole('button', { name: '无法报名' })).toBeDisabled();
		});

		it('已报名态：左侧蓝色强调边框 + 已报名徽标', () => {
			const { container } = render(CourseCard, buildProps({ registration: baseRegistration }));
			const root = container.firstElementChild as HTMLElement;
			expect(root.classList.contains('border-l-4')).toBe(true);
			expect(root.classList.contains('border-l-blue-500')).toBe(true);
			expect(screen.getByText('已报名')).toBeInTheDocument();
		});

		it('立即报名 → onRegister 回调参数为当前 course 对象', () => {
			const onRegister = vi.fn();
			render(CourseCard, buildProps({ onRegister, registeredCount: 5 }));
			const btn = screen.getByRole('button', { name: '立即报名' });
			fireEvent.click(btn);
			expect(onRegister).toHaveBeenCalledTimes(1);
			expect(onRegister).toHaveBeenCalledWith(expect.objectContaining({ id: baseCourse.id }));
		});

		it('取消报名 → onCancel 双参数（course, registration）', () => {
			const onCancel = vi.fn();
			render(CourseCard, buildProps({ registration: baseRegistration, onCancel }));
			const btn = screen.getByRole('button', { name: '取消报名' });
			fireEvent.click(btn);
			expect(onCancel).toHaveBeenCalledTimes(1);
			expect(onCancel).toHaveBeenCalledWith(
				expect.objectContaining({ id: baseCourse.id }),
				expect.objectContaining({ id: baseRegistration.id })
			);
		});

		it('开课前 24h 内（已报名）：仍可取消报名，不再锁定', () => {
			const onCancel = vi.fn();
			render(
				CourseCard,
				buildProps({
					course: { ...baseCourse, startTime: SOON },
					registration: baseRegistration,
					onCancel
				})
			);
			const btn = screen.getByRole('button', { name: '取消报名' });
			expect(btn).not.toBeDisabled();
			fireEvent.click(btn);
			expect(onCancel).toHaveBeenCalledTimes(1);
		});

		it('已结束态（已报名）：禁用取消入口，显示「不可取消 (已结束)」', () => {
			const onCancel = vi.fn();
			render(
				CourseCard,
				buildProps({
					course: { ...baseCourse, startTime: PAST },
					registration: baseRegistration,
					onCancel
				})
			);
			const btn = screen.getByRole('button', { name: /不可取消/ });
			expect(btn).toBeInTheDocument();
			expect(btn.textContent).toContain('已结束');
			expect(btn).toBeDisabled();
			fireEvent.click(btn);
			expect(onCancel).not.toHaveBeenCalled();
		});
	});

	describe('6 种核心业务场景 · 多地点变体全量覆盖', () => {
		const scenarios: Array<{
			name: string;
			props: Partial<CourseCardProps>;
			assertBadge: string;
			assertButton: RegExp | string;
			buttonDisabled: boolean;
			expectedCapBadges: number;
		}> = [
			{
				name: '单地点·有容量·开放报名',
				props: {
					course: { ...baseCourse, locations: SINGLE_LOC_WITH_CAP },
					registeredCount: 10
				},
				assertBadge: '开放报名中',
				assertButton: '立即报名',
				buttonDisabled: false,
				expectedCapBadges: 1
			},
			{
				name: '单地点·无容量·开放报名',
				props: {
					course: { ...baseCourse, locations: SINGLE_LOC_NO_CAP, capacity: 999 },
					registeredCount: 10
				},
				assertBadge: '开放报名中',
				assertButton: '立即报名',
				buttonDisabled: false,
				expectedCapBadges: 0
			},
			{
				name: '多地点·全容量·已报名·可取消',
				props: {
					course: { ...baseCourse, locations: MULTI_LOC_ALL_CAP, capacity: 65 },
					registeredCount: 38,
					registration: baseRegistration
				},
				assertBadge: '已报名',
				assertButton: '取消报名',
				buttonDisabled: false,
				expectedCapBadges: 3
			},
			{
				name: '多地点·混合容量·名额已满',
				props: {
					course: { ...baseCourse, locations: MULTI_LOC_MIXED, capacity: 40 },
					registeredCount: 40
				},
				assertBadge: '名额已满',
				assertButton: '无法报名',
				buttonDisabled: true,
				expectedCapBadges: 1
			},
			{
				name: '多地点·无容量·已结束',
				props: {
					course: {
						...baseCourse,
						locations: MULTI_LOC_NONE_CAP,
						startTime: PAST,
						capacity: 500
					},
					registeredCount: 156
				},
				assertBadge: '已结束',
				assertButton: '无法报名',
				buttonDisabled: true,
				expectedCapBadges: 0
			},
			{
				name: '多地点·边界容量·已报名·临近开课仍可取消',
				props: {
					course: {
						...baseCourse,
						locations: MULTI_LOC_BOUNDARY,
						startTime: SOON,
						capacity: 42
					},
					registeredCount: 5,
					registration: baseRegistration
				},
				assertBadge: '已报名',
				assertButton: '取消报名',
				buttonDisabled: false,
				expectedCapBadges: 1
			}
		];

		it.each(scenarios)(
			'场景[$name]：徽章=%s 按钮=%s 容量徽章数=%s',
			({ props, assertBadge, assertButton, buttonDisabled, expectedCapBadges }) => {
				const onRegister = vi.fn();
				const onCancel = vi.fn();
				render(CourseCard, buildProps({ ...props, onRegister, onCancel }));

				expect(screen.getByText(assertBadge)).toBeInTheDocument();

				const btn = screen.getByRole('button', { name: assertButton });
				expect(btn).toBeInTheDocument();
				expect(btn.hasAttribute('disabled')).toBe(buttonDisabled);

				const capBadges = screen.queryAllByText(/限\s*\d+\s*人/);
				expect(capBadges.length).toBe(expectedCapBadges);
			}
		);
	});

	describe('图片加载稳定性 · 图标 SVG 渲染验证', () => {
		it('时间图标（时钟 SVG）在所有场景下稳定渲染', () => {
			const { container } = render(
				CourseCard,
				buildProps({
					course: { ...baseCourse, locations: MULTI_LOC_ALL_CAP }
				})
			);
			const clockSvgs = container.querySelectorAll('svg');
			// 至少：1 个时钟 + 地点标题图标 + 每个 li 不额外含 svg，但多地点标题有定位图标
			const hasClockSvg = Array.from(clockSvgs).some(
				(svg) =>
					svg.getAttribute('viewBox') === '0 0 24 24' && svg.querySelector('path[d*="M12 8v4l3 3"]')
			);
			expect(hasClockSvg).toBe(true);
		});

		it('定位图标（location pin SVG）在单地点和多地点标题处均正确渲染', () => {
			const { container: c1 } = render(
				CourseCard,
				buildProps({
					course: { ...baseCourse, locations: SINGLE_LOC_WITH_CAP }
				})
			);
			const pinSvgSelector = 'svg path[d*="M17.657 16.657"], svg path[d*="M15 11a3 3"]';
			expect(c1.querySelector(pinSvgSelector)).not.toBeNull();

			const { container: c2 } = render(
				CourseCard,
				buildProps({
					course: { ...baseCourse, locations: MULTI_LOC_ALL_CAP }
				})
			);
			expect(c2.querySelector(pinSvgSelector)).not.toBeNull();
		});

		it('多地点每项蓝色圆点：数量等于 locations.length', () => {
			const { container } = render(
				CourseCard,
				buildProps({
					course: { ...baseCourse, locations: MULTI_LOC_ALL_CAP }
				})
			);
			const dots = container.querySelectorAll('span.h-1\\.5.w-1\\.5.rounded-full.bg-blue-500');
			expect(dots.length).toBe(MULTI_LOC_ALL_CAP.length);
		});

		it('DOM 结构稳定性：容量徽章样式类名一致，无渲染抖动', () => {
			const { container } = render(
				CourseCard,
				buildProps({
					course: { ...baseCourse, locations: SINGLE_LOC_WITH_CAP }
				})
			);
			const badge = screen.getByText(/限\s*50\s*人/);
			expect(badge.classList.contains('inline-flex')).toBe(true);
			expect(badge.classList.contains('rounded')).toBe(true);
			expect(badge.classList.contains('px-1.5')).toBe(true);
			expect(badge.classList.contains('py-0.5')).toBe(true);
			expect(badge.classList.contains('ring-1')).toBe(true);
			expect(badge.classList.contains('ring-inset')).toBe(true);
			const badges = container.querySelectorAll('.bg-blue-50.text-blue-700');
			expect(badges.length).toBe(1);
		});

		it('Flex 等高钉底布局：根节点 flex-col h-full，描述 flex-1，操作栏 mt-auto', () => {
			const { container } = render(
				CourseCard,
				buildProps({
					course: { ...baseCourse, locations: MULTI_LOC_ALL_CAP }
				})
			);
			const root = container.firstElementChild as HTMLElement;
			expect(root).not.toBeNull();
			expect(root.classList.contains('flex')).toBe(true);
			expect(root.classList.contains('flex-col')).toBe(true);
			expect(root.classList.contains('h-full')).toBe(true);
			const desc = root.querySelector('p.text-sm.text-slate-600');
			expect(desc).not.toBeNull();
			expect((desc as HTMLElement).classList.contains('flex-1')).toBe(true);
			expect((desc as HTMLElement).classList.contains('min-h-0')).toBe(true);
			const footer = root.querySelector('div.border-t.border-slate-100.pt-4');
			expect(footer).not.toBeNull();
			expect((footer as HTMLElement).classList.contains('mt-auto')).toBe(true);
			expect((footer as HTMLElement).classList.contains('shrink-0')).toBe(true);
			const header = root.firstElementChild as HTMLElement;
			expect(header.classList.contains('shrink-0')).toBe(true);
		});
	});
});
