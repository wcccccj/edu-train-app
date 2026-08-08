/**
 * 通用表格组件类型定义
 *
 * 提供数据源、列配置、分页信息、省略显示与列宽等核心 API 的类型约束，
 * 与 DataTable.svelte 解耦，便于单独维护与复用。
 */

/** 省略位置：头部 / 中部 / 尾部 */
export type EllipsisPosition = 'head' | 'middle' | 'tail';

/** 省略显示配置项 */
export interface EllipsisOptions {
	/** 省略位置，默认 tail */
	position?: EllipsisPosition;
	/** 省略符号，默认 … */
	symbol?: string;
	/** 多行显示行数（>1 时使用 -webkit-line-clamp，仅 tail 位置生效），默认 1 */
	lines?: number;
	/** 中部省略时头部保留的字符数，默认 10 */
	headChars?: number;
	/** 中部省略时尾部保留的字符数，默认 6 */
	tailChars?: number;
	/** 是否在 hover 时以 title 展示完整文本，默认 true */
	showTooltip?: boolean;
}

/** 列宽：固定像素 / 百分比 / 自适应 / 最小最大范围 */
export type ColumnWidth = number | `${number}%` | 'auto' | { min?: number; max?: number };

/** 单元格文本对齐方式 */
export type Align = 'left' | 'center' | 'right';

/** 列配置 */
export interface Column<T> {
	/** 列唯一标识，同时作为默认取值时读取的数据字段名 */
	key: string;
	/** 表头标题 */
	title: string;
	/** 列宽：固定像素、百分比或自适应 */
	width?: ColumnWidth;
	/** 单元格对齐方式，默认 left */
	align?: Align;
	/** 文本过长省略显示：传 true 使用默认配置，或传入自定义配置 */
	ellipsis?: boolean | EllipsisOptions;
	/** 额外应用在表头单元格的类名 */
	headerClass?: string;
	/** 额外应用在数据单元格的类名 */
	cellClass?: string;
	/** 空值兜底文本（值为 undefined / null / 空串时展示），用于声明式展示 */
	fallback?: string;
	/** 值 → 标签 映射（如类型、状态等文案），用于声明式展示 */
	map?: Record<string, string>;
	/** 格式化函数（优先级高于 map / fallback），返回字符串或数字 */
	formatter?: (value: unknown, row: T) => string | number;
}

/** 分页配置 */
export interface PaginationConfig {
	/** 当前页码（从 1 开始） */
	currentPage: number;
	/** 每页条数 */
	pageSize: number;
	/** 数据总条数，缺省时取 data.length */
	total?: number;
	/** 页码变化回调 */
	onPageChange: (page: number) => void;
}
