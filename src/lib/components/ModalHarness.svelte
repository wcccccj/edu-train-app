<script lang="ts">
	import Modal from './Modal.svelte';

	interface Props {
		title: string;
		onClose: () => void;
		maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
		open?: boolean;
		/** 是否渲染 header 插槽，用于验证 header 条件渲染 */
		useHeader?: boolean;
	}

	export type HarnessProps = Props;

	let { title, onClose, maxWidth, open = true, useHeader = false }: Props = $props();
</script>

{#snippet headerContent()}
	<div>头部提示信息</div>
{/snippet}

<Modal {title} {onClose} {maxWidth} {open} header={useHeader ? headerContent : undefined}>
	弹窗主体内容
</Modal>
