# Pagination 通用分页组件

通用可复用分页组件，基于 Svelte 5 Runes 开发。通过「数据总量 + 每页条数」计算总页数，支持页码展示数量自定义、上一页/下一页导航、直接跳转到指定页码，并提供页码变更事件回调。

## 特性

- **总页数自动计算**：只需传入 `totalItems` 与 `pageSize`，无需手动计算总页数
- **页码展示数量自定义**：通过 `maxVisiblePages` 控制最多展示的页码按钮数量，页数过多时自动折叠为省略号
- **上一页/下一页导航**：内置导航按钮，边界处自动禁用
- **直接跳转**：内置跳转输入框，支持点击「确定」或回车触发
- **页码变更回调**：通过 `onPageChange` 回调接收切换后的页码
- **双向绑定**：`currentPage` 使用 `$bindable`，支持 `bind:currentPage` 受控模式
- **可配置**：`showJump` / `showTotal` 控制跳转框与汇总信息显隐

## 安装路径

```ts
import Pagination from '$lib/components/Pagination.svelte';
```

## Props

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `totalItems` | `number` | —（必填） | 数据总量 |
| `pageSize` | `number` | —（必填） | 每页显示条数 |
| `currentPage` | `number` | `1` | 当前页码（可 `bind:` 双向绑定） |
| `maxVisiblePages` | `number` | `7` | 最多展示的页码按钮数量（含首尾页） |
| `onPageChange` | `(page: number) => void` | — | 页码变更回调 |
| `showJump` | `boolean` | `true` | 是否展示跳转输入框 |
| `showTotal` | `boolean` | `false` | 是否展示「共 N 条」汇总信息 |

## 基础用法

```svelte
<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';
	import { courses } from './data';

	const PAGE_SIZE = 8;
	let currentPage = $state(1);

	let paginated = $derived(
		courses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
	);
</script>

{#each paginated as item}
	<Card {item} />
{/each}

<Pagination
	totalItems={courses.length}
	pageSize={PAGE_SIZE}
	bind:currentPage
/>
```

## 受控模式 + 变更回调

当你需要监听页码变化并执行额外逻辑（如跳转、埋点）时，使用 `onPageChange`：

```svelte
<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';

	let currentPage = $state(1);

	function handlePageChange(page: number) {
		currentPage = page;
		console.log('切换到第', page, '页');
	}
</script>

<Pagination
	totalItems={200}
	pageSize={10}
	currentPage={currentPage}
	onPageChange={handlePageChange}
/>
```

## 自定义页码展示数量

数据量较大时通过 `maxVisiblePages` 控制渲染的页码按钮数量，超出部分折叠为省略号：

```svelte
<Pagination totalItems={1000} pageSize={10} maxVisiblePages={5} bind:currentPage />
```

## 汇总信息与关闭跳转框

```svelte
<Pagination
	totalItems={500}
	pageSize={20}
	showTotal
	showJump={false}
	bind:currentPage
/>
```

## 边界场景

- `totalItems` 为 0 或少于 `pageSize` 时，总页数为 1，组件不渲染任何控件
- 跳转页码越界时自动收敛到合法范围（`1 ~ totalPages`）
- 当前页码变化时自动保持高亮，页码序列随当前页滑动

## 测试

```bash
pnpm vitest run src/lib/components/Pagination.test.ts
```