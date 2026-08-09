/**
 * 课程种子数据（单一数据源）
 * 由课程中心页的 28 门精选课程迁移而来，作为 /api/courses 的 mock 数据源。
 * 字段遵循 lib/mock 的 Course 契约；核心内容（名称/描述/容量/类型/时间/地点）取自页面原 mockCourses。
 */
import type { Course, CourseStatus, Location } from '$lib/types/course.types';

/** 以相对当前时间的偏移天数生成 YYYY-MM-DD（负数为过去） */
function dateOffset(days: number): string {
	return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
}

interface SeedLocation {
	name: string;
	capacity?: number;
}

interface SeedExtraField {
	name: string;
	label: string;
	type: 'text' | 'select';
	required?: boolean;
	options?: { label: string; value: string }[];
}

interface SeedCourse {
	id: number;
	name: string;
	description: string;
	type: 'online' | 'offline';
	category: string;
	/** 距今天数偏移，负数表示已开始（过去） */
	startOffset: number;
	durationDays: number;
	maxStudents: number;
	enrolled: number;
	locations: SeedLocation[];
	/** 特殊活动课程的额外填写项 */
	extraFields?: SeedExtraField[];
}

function buildCourse(seed: SeedCourse): Course {
	const startDate = dateOffset(seed.startOffset);
	const endDate = dateOffset(seed.startOffset + seed.durationDays);
	const status: CourseStatus =
		seed.startOffset < 0 ? 'closed' : seed.enrolled >= seed.maxStudents ? 'full' : 'open';

	// 线下课程按地点拆分为 lib/mock Location；线上课程无地点
	const locations: Location[] = seed.locations.map((loc, i) => ({
		id: `c${seed.id}-loc${i + 1}`,
		name: loc.name,
		address: loc.name,
		capacity: loc.capacity ?? 0,
		enrolled: Math.min(
			loc.capacity ?? 0,
			Math.floor((seed.enrolled * (i + 1)) / Math.max(1, seed.locations.length))
		)
	}));

	const timeSlots = seed.type === 'online' ? [] : [`${startDate} 至 ${endDate}（周一至周五）`];

	return {
		id: seed.id,
		name: seed.name,
		type: seed.type,
		category: seed.category,
		startDate,
		endDate,
		duration: `${seed.durationDays}天`,
		instructor: '陈老师',
		price: (seed.id * 137) % 5000,
		maxStudents: seed.maxStudents,
		enrolled: seed.enrolled,
		status,
		description: seed.description,
		locations,
		timeSlots,
		extraFields: seed.extraFields
	};
}

export const SEED_COURSES: Course[] = [
	buildCourse({
		id: 1,
		name: 'Svelte 5 核心特性实战',
		description: '深入学习 Runes 响应式系统、Snippets 与 SvelteKit 的最佳实践。',
		type: 'online',
		category: '技术研发',
		startOffset: 5,
		durationDays: 3,
		maxStudents: 50,
		enrolled: 12,
		locations: []
	}),
	buildCourse({
		id: 2,
		name: 'Tailwind CSS 进阶与设计系统',
		description: '掌握 Tailwind CSS 的高级用法，构建高可复用的企业级组件库。',
		type: 'offline',
		category: '技术研发',
		startOffset: 1,
		durationDays: 3,
		maxStudents: 30,
		enrolled: 18,
		locations: [{ name: '北京培训中心 A 栋 301', capacity: 30 }]
	}),
	buildCourse({
		id: 3,
		name: '全栈 TDD 敏捷开发实战',
		description: '从测试用例出发，使用 Vitest 和 Playwright 构建健壮的 Web 应用。',
		type: 'offline',
		category: '技术研发',
		startOffset: -2,
		durationDays: 5,
		maxStudents: 40,
		enrolled: 40,
		locations: [
			{ name: '上海培训中心 B 栋 102', capacity: 25 },
			{ name: '线上同步直播（无名额限制）' }
		]
	}),
	buildCourse({
		id: 4,
		name: 'Cloudflare 边缘计算全栈实训营',
		description: '覆盖 Workers / KV / D1 / R2 / Durable Objects 的真实项目演练。',
		type: 'offline',
		category: '技术研发',
		startOffset: 10,
		durationDays: 7,
		maxStudents: 100,
		enrolled: 65,
		locations: [
			{ name: '深圳培训中心 C 栋 201', capacity: 20 },
			{ name: '杭州培训中心 E 栋 405', capacity: 20 },
			{ name: '远程在线协作班', capacity: 60 },
			{ name: '企业内部定制（报名后协调具体场地）' }
		]
	}),
	buildCourse({
		id: 5,
		name: 'TypeScript 类型系统深入',
		description: '从泛型到条件类型，构建类型安全的复杂业务模型与工具类型。',
		type: 'online',
		category: '技术研发',
		startOffset: 3,
		durationDays: 3,
		maxStudents: 120,
		enrolled: 40,
		locations: []
	}),
	buildCourse({
		id: 6,
		name: 'Node.js 微服务架构实战',
		description: '使用 Fastify 与消息队列构建可水平扩展的高可用微服务体系。',
		type: 'offline',
		category: '技术研发',
		startOffset: 7,
		durationDays: 5,
		maxStudents: 24,
		enrolled: 9,
		locations: [{ name: '广州天河校区 2 栋 501', capacity: 24 }]
	}),
	buildCourse({
		id: 7,
		name: 'PostgreSQL 性能优化与调优',
		description: '深入索引、执行计划与连接池，系统提升数据库查询性能。',
		type: 'online',
		category: '技术研发',
		startOffset: 12,
		durationDays: 3,
		maxStudents: 80,
		enrolled: 30,
		locations: []
	}),
	buildCourse({
		id: 8,
		name: 'Kubernetes 容器编排进阶',
		description: '掌握 Pod 调度、滚动发布与自愈机制，运维生产级集群。',
		type: 'offline',
		category: '技术研发',
		startOffset: 15,
		durationDays: 5,
		maxStudents: 36,
		enrolled: 20,
		locations: [
			{ name: '北京培训中心 C 栋 402', capacity: 18 },
			{ name: '上海实训基地 3 栋 208', capacity: 18 }
		]
	}),
	buildCourse({
		id: 9,
		name: '前端性能优化实战',
		description: '从加载、渲染到运行时，建立前端性能测量与优化的系统方法。',
		type: 'online',
		category: '技术研发',
		startOffset: 1,
		durationDays: 3,
		maxStudents: 200,
		enrolled: 88,
		locations: []
	}),
	buildCourse({
		id: 10,
		name: 'GraphQL API 设计与实践',
		description: '使用 schema 优先的方式设计可演化的查询 API，并落地缓存与权限。',
		type: 'offline',
		category: '技术研发',
		startOffset: 8,
		durationDays: 3,
		maxStudents: 28,
		enrolled: 15,
		locations: [{ name: '深圳南山校区 D 栋 305', capacity: 28 }]
	}),
	buildCourse({
		id: 11,
		name: '持续集成与交付 CI/CD',
		description: '搭建自动化流水线，覆盖构建、测试、镜像与多环境发布全流程。',
		type: 'online',
		category: '技术研发',
		startOffset: 20,
		durationDays: 5,
		maxStudents: 90,
		enrolled: 45,
		locations: []
	}),
	buildCourse({
		id: 12,
		name: '数据结构与算法进阶',
		description: '聚焦高频算法题型与复杂数据结构，提升编码与面试竞争力。',
		type: 'offline',
		category: '技术研发',
		startOffset: -8,
		durationDays: 5,
		maxStudents: 32,
		enrolled: 32,
		locations: [{ name: '杭州滨江中心 4 栋 101', capacity: 32 }]
	}),
	buildCourse({
		id: 13,
		name: 'Web 安全攻防实战',
		description: '覆盖 OWASP Top 10，实战演练注入、XSS、越权与加固方案。',
		type: 'online',
		category: '安全管理',
		startOffset: 18,
		durationDays: 3,
		maxStudents: 150,
		enrolled: 60,
		locations: []
	}),
	buildCourse({
		id: 14,
		name: 'Rust 系统编程入门',
		description: '从所有权模型到并发安全，掌握内存安全的系统级开发语言。',
		type: 'offline',
		category: '技术研发',
		startOffset: 25,
		durationDays: 5,
		maxStudents: 20,
		enrolled: 8,
		locations: [{ name: '上海实训基地 2 栋 306', capacity: 20 }]
	}),
	buildCourse({
		id: 15,
		name: 'Redis 缓存架构设计与实战',
		description: '深入缓存一致性、缓存穿透与分布式锁等企业级实践。',
		type: 'online',
		category: '技术研发',
		startOffset: 4,
		durationDays: 3,
		maxStudents: 100,
		enrolled: 50,
		locations: []
	}),
	buildCourse({
		id: 16,
		name: 'DevOps 云原生实践',
		description: '结合容器、编排与可观测性，打造云原生应用的完整交付链路。',
		type: 'offline',
		category: '技术研发',
		startOffset: -15,
		durationDays: 7,
		maxStudents: 44,
		enrolled: 44,
		locations: [
			{ name: '北京培训中心 A 栋 205', capacity: 22 },
			{ name: '深圳南山校区 B 栋 401', capacity: 22 }
		]
	}),
	buildCourse({
		id: 17,
		name: '微前端架构落地',
		description: '拆解应用边界、模块联邦与公共依赖治理，实现渐进式迁移。',
		type: 'online',
		category: '技术研发',
		startOffset: 30,
		durationDays: 5,
		maxStudents: 70,
		enrolled: 25,
		locations: []
	}),
	buildCourse({
		id: 18,
		name: '数据可视化 ECharts 进阶',
		description: '从图表定制到大数据渲染，打造高性能、可交互的数据看板。',
		type: 'offline',
		category: '技术研发',
		startOffset: 9,
		durationDays: 3,
		maxStudents: 26,
		enrolled: 18,
		locations: [{ name: '杭州滨江中心 2 栋 208', capacity: 26 }]
	}),
	buildCourse({
		id: 19,
		name: '单元测试与测试金字塔',
		description: '围绕 Vitest 与组件测试，建立稳定、可维护的自动化测试体系。',
		type: 'online',
		category: '技术研发',
		startOffset: 6,
		durationDays: 3,
		maxStudents: 110,
		enrolled: 55,
		locations: []
	}),
	buildCourse({
		id: 20,
		name: 'Docker 容器化部署实战',
		description: '掌握镜像构建、多阶段构建与容器安全，落地标准化部署。',
		type: 'offline',
		category: '技术研发',
		startOffset: 22,
		durationDays: 3,
		maxStudents: 30,
		enrolled: 12,
		locations: [{ name: '广州天河校区 1 栋 302', capacity: 30 }]
	}),
	buildCourse({
		id: 21,
		name: '大型项目代码重构',
		description: '识别坏味道，通过安全的重构手法逐步改善既有代码库质量。',
		type: 'online',
		category: '技术研发',
		startOffset: -30,
		durationDays: 5,
		maxStudents: 60,
		enrolled: 60,
		locations: []
	}),
	buildCourse({
		id: 22,
		name: '数据库设计规范与建模',
		description: '从需求到 ER 模型，设计可扩展、可维护的关系型数据库。',
		type: 'offline',
		category: '技术研发',
		startOffset: 11,
		durationDays: 3,
		maxStudents: 25,
		enrolled: 10,
		locations: [{ name: '上海实训基地 1 栋 204', capacity: 25 }]
	}),
	buildCourse({
		id: 23,
		name: '前端工程化最佳实践',
		description: '围绕构建、规范、质量与发布，构建高效稳健的前端工程体系。',
		type: 'online',
		category: '技术研发',
		startOffset: 14,
		durationDays: 5,
		maxStudents: 140,
		enrolled: 70,
		locations: []
	}),
	buildCourse({
		id: 24,
		name: '消息队列与异步架构',
		description: '对比主流 MQ，掌握消息可靠投递、幂等消费与削峰填谷。',
		type: 'offline',
		category: '技术研发',
		startOffset: 16,
		durationDays: 3,
		maxStudents: 21,
		enrolled: 14,
		locations: [{ name: '深圳南山校区 C 栋 202', capacity: 21 }]
	}),
	buildCourse({
		id: 25,
		name: '可观测性与链路追踪',
		description: '整合日志、指标与 Tracing，快速定位分布式系统中的故障。',
		type: 'online',
		category: '技术研发',
		startOffset: 28,
		durationDays: 3,
		maxStudents: 85,
		enrolled: 30,
		locations: []
	}),
	buildCourse({
		id: 26,
		name: 'Serverless 应用开发',
		description: '基于函数计算与边缘平台，构建弹性、低运维的云应用。',
		type: 'offline',
		category: '技术研发',
		startOffset: -45,
		durationDays: 5,
		maxStudents: 23,
		enrolled: 23,
		locations: [{ name: '北京培训中心 D 栋 503', capacity: 23 }]
	}),
	buildCourse({
		id: 27,
		name: '架构设计思维与方法论',
		description: '从业务抽象到技术选型，建立系统化、可落地的架构设计能力。',
		type: 'online',
		category: '管理能力',
		startOffset: 35,
		durationDays: 5,
		maxStudents: 130,
		enrolled: 65,
		locations: []
	}),
	buildCourse({
		id: 28,
		name: '技术写作与知识沉淀',
		description: '学习结构化表达与文档化实践，让技术经验高效复用与传承。',
		type: 'offline',
		category: '通用素养',
		startOffset: 19,
		durationDays: 3,
		maxStudents: 35,
		enrolled: 22,
		locations: [{ name: '杭州滨江中心 3 栋 401', capacity: 35 }]
	}),
	buildCourse({
		id: 29,
		name: '年度新技术嘉年华（特殊活动）',
		description: '汇聚前沿技术展演与实战工作坊，需按部门与岗位选择参与场次。',
		type: 'offline',
		category: '特殊活动',
		startOffset: 6,
		durationDays: 2,
		maxStudents: 120,
		enrolled: 45,
		locations: [{ name: '北京培训中心 A 栋 会展厅', capacity: 120 }],
		extraFields: [
			{
				name: 'department',
				label: '选择部门',
				type: 'select',
				required: true,
				options: [
					{ label: '技术研发部', value: 'rd' },
					{ label: '产品部', value: 'product' },
					{ label: '市场部', value: 'marketing' },
					{ label: '人力资源部', value: 'hr' }
				]
			},
			{
				name: 'position',
				label: '选择岗位',
				type: 'select',
				required: true,
				options: [
					{ label: '前端工程师', value: 'frontend' },
					{ label: '后端工程师', value: 'backend' },
					{ label: '测试工程师', value: 'qa' },
					{ label: '产品经理', value: 'pm' }
				]
			}
		]
	})
];
