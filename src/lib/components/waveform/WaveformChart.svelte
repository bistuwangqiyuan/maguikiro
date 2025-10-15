<!--
  实时波形图表组件 / Real-time Waveform Chart Component
  
  使用Chart.js和chartjs-plugin-streaming实现实时磁信号波形显示
  Uses Chart.js and chartjs-plugin-streaming for real-time magnetic signal waveform display
-->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { testingStore } from '$lib/stores/testing';
	import type { SignalData } from '$lib/types/signal';
	import {
		Chart,
		LineController,
		LineElement,
		PointElement,
		LinearScale,
		TimeScale,
		Title,
		Tooltip,
		Legend,
		Filler,
		type ChartConfiguration
	} from 'chart.js';
	import 'chartjs-adapter-date-fns';
	import StreamingPlugin from 'chartjs-plugin-streaming';

	// 注册Chart.js组件 / Register Chart.js components
	Chart.register(
		LineController,
		LineElement,
		PointElement,
		LinearScale,
		TimeScale,
		Title,
		Tooltip,
		Legend,
		Filler,
		StreamingPlugin
	);

	// Props
	export let height: number = 400;
	export let refreshRate: number = 30; // fps

	// 组件状态 / Component state
	let canvasElement: HTMLCanvasElement;
	let chart: Chart | null = null;
	let unsubscribe: (() => void) | null = null;

	/**
	 * 初始化图表 / Initialize chart
	 */
	function initChart() {
		if (!canvasElement) return;

		const ctx = canvasElement.getContext('2d');
		if (!ctx) return;

		const config: ChartConfiguration = {
			type: 'line',
			data: {
				datasets: [
					{
						label: '磁信号波形 / Magnetic Signal',
						data: [],
						borderColor: '#00FF00', // 绿色波形 / Green waveform
						backgroundColor: 'rgba(0, 255, 0, 0.1)',
						borderWidth: 2,
						pointRadius: 0, // 不显示数据点 / No data points
						fill: false,
						tension: 0.1 // 平滑曲线 / Smooth curve
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: false, // 禁用动画以提高性能 / Disable animation for performance
				interaction: {
					intersect: false,
					mode: 'index'
				},
				plugins: {
					legend: {
						display: true,
						position: 'top',
						labels: {
							color: '#FFFFFF',
							font: {
								family: 'Roboto Mono',
								size: 12
							}
						}
					},
					tooltip: {
						enabled: true,
						mode: 'index',
						intersect: false,
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						titleColor: '#FFFFFF',
						bodyColor: '#FFFFFF',
						borderColor: '#FF6B35',
						borderWidth: 1,
						callbacks: {
							label: function (context) {
								const value = context.parsed.y;
								return `幅值: ${value.toFixed(3)} V`;
							}
						}
					},
					title: {
						display: true,
						text: '实时磁信号波形 / Real-time Magnetic Signal Waveform',
						color: '#FFFFFF',
						font: {
							family: 'Roboto',
							size: 16,
							weight: 'bold'
						}
					}
				},
				scales: {
					x: {
						type: 'realtime',
						realtime: {
							duration: 10000, // 显示最近10秒数据 / Show last 10 seconds
							refresh: 1000 / refreshRate, // 刷新间隔 / Refresh interval
							delay: 100, // 延迟100ms / Delay 100ms
							pause: false,
							ttl: undefined,
							frameRate: refreshRate,
							onRefresh: (chart) => {
								// 从store获取最新数据 / Get latest data from store
								const state = testingStore;
								// 这个回调会在每次刷新时调用 / This callback is called on each refresh
							}
						},
						ticks: {
							color: '#B0B0B0',
							font: {
								family: 'Roboto Mono',
								size: 10
							}
						},
						grid: {
							color: '#333333', // 网格线颜色 / Grid line color
							lineWidth: 1
						},
						title: {
							display: true,
							text: '时间 / Time',
							color: '#FFFFFF',
							font: {
								family: 'Roboto',
								size: 12
							}
						}
					},
					y: {
						type: 'linear',
						min: -5,
						max: 5,
						ticks: {
							color: '#B0B0B0',
							font: {
								family: 'Roboto Mono',
								size: 10
							},
							callback: function (value) {
								return value.toFixed(1) + ' V';
							}
						},
						grid: {
							color: '#333333',
							lineWidth: 1
						},
						title: {
							display: true,
							text: '幅值 / Amplitude (V)',
							color: '#FFFFFF',
							font: {
								family: 'Roboto',
								size: 12
							}
						}
					}
				}
			}
		};

		chart = new Chart(ctx, config);
	}

	/**
	 * 添加数据点到图表 / Add data point to chart
	 */
	function addDataPoint(signalData: SignalData) {
		if (!chart) return;

		const dataset = chart.data.datasets[0];
		if (dataset && dataset.data) {
			dataset.data.push({
				x: Date.now(),
				y: signalData.amplitude
			});

			chart.update('none'); // 'none'模式不触发动画，性能更好 / 'none' mode doesn't trigger animation, better performance
		}
	}

	/**
	 * 更新图表Y轴范围（根据增益调整）/ Update chart Y-axis range (adjust based on gain)
	 */
	function updateYAxisRange(gain: number) {
		if (!chart || !chart.options.scales?.y) return;

		// 根据增益调整Y轴范围 / Adjust Y-axis range based on gain
		const range = 5 * Math.pow(10, -gain / 20);
		chart.options.scales.y.min = -range;
		chart.options.scales.y.max = range;
		chart.update('none');
	}

	/**
	 * 暂停/恢复图表更新 / Pause/resume chart updates
	 */
	function togglePause(isPaused: boolean) {
		if (!chart || !chart.options.scales?.x) return;

		const xScale = chart.options.scales.x as any;
		if (xScale.realtime) {
			xScale.realtime.pause = isPaused;
			chart.update('none');
		}
	}

	/**
	 * 清空图表数据 / Clear chart data
	 */
	function clearChart() {
		if (!chart) return;

		const dataset = chart.data.datasets[0];
		if (dataset && dataset.data) {
			dataset.data = [];
			chart.update('none');
		}
	}

	// 生命周期 / Lifecycle
	onMount(() => {
		initChart();

		// 订阅testing store / Subscribe to testing store
		unsubscribe = testingStore.subscribe((state) => {
			// 当有新的处理后数据时，添加到图表 / When there's new processed data, add to chart
			if (state.processedBuffer.length > 0) {
				const latestData = state.processedBuffer[state.processedBuffer.length - 1];
				addDataPoint(latestData);
			}

			// 根据状态控制图表 / Control chart based on state
			if (state.status === 'paused') {
				togglePause(true);
			} else if (state.status === 'running') {
				togglePause(false);
			} else if (state.status === 'completed') {
				togglePause(true);
			}

			// 根据增益调整Y轴 / Adjust Y-axis based on gain
			if (state.currentSession?.parameters.gain) {
				updateYAxisRange(state.currentSession.parameters.gain);
			}
		});
	});

	onDestroy(() => {
		// 清理 / Cleanup
		if (unsubscribe) {
			unsubscribe();
		}
		if (chart) {
			chart.destroy();
			chart = null;
		}
	});

</script>

<div class="waveform-chart-container" style="height: {height}px;">
	<canvas bind:this={canvasElement} id="waveform-chart"></canvas>
</div>

<style>
	.waveform-chart-container {
		width: 100%;
		background-color: #1a1a1a;
		border: 2px solid #ff6b35;
		border-radius: 4px;
		padding: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
	}

	canvas {
		width: 100% !important;
		height: 100% !important;
	}
</style>
