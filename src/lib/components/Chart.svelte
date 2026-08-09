<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as echarts from 'echarts';

	interface ChartProps {
		options: echarts.EChartsCoreOption;
		class?: string;
	}

	let { options, class: className = '' }: ChartProps = $props();

	let chartContainer: HTMLDivElement;
	let chartInstance: echarts.ECharts | null = null;

	onMount(() => {
		if (chartContainer) {
			chartInstance = echarts.init(chartContainer);
			chartInstance.setOption(options);
		}

		const resizeObserver = new ResizeObserver(() => {
			chartInstance?.resize();
		});

		if (chartContainer) {
			resizeObserver.observe(chartContainer);
		}

		return () => {
			resizeObserver.disconnect();
		};
	});

	onDestroy(() => {
		if (chartInstance) {
			chartInstance.dispose();
			chartInstance = null;
		}
	});

	$effect(() => {
		if (chartInstance && options) {
			chartInstance.setOption(options, true);
		}
	});
</script>

<div bind:this={chartContainer} class={`h-full w-full ${className}`}></div>

<style>
	/* 保证容器能被正确撑开 */
	div {
		min-height: 300px;
	}
</style>
