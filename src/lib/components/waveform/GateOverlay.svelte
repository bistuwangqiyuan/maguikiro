<script lang="ts">
	import type { GateConfig } from '$lib/types/signal';
	
	/**
	 * 闸门可视化覆盖层组件 / Gate Visualization Overlay Component
	 * 
	 * 在波形图上绘制闸门A和闸门B的矩形边界
	 * Draws rectangular boundaries for Gate A and Gate B on the waveform chart
	 */
	
	// Props
	export let gateA: GateConfig;
	export let gateB: GateConfig;
	export let chartWidth: number = 800;
	export let chartHeight: number = 400;
	export let timeScale: number = 1; // 时间轴缩放比例 / Time axis scale
	export let amplitudeScale: number = 1; // 幅值轴缩放比例 / Amplitude axis scale
	
	/**
	 * 计算闸门在画布上的位置和尺寸
	 * Calculate gate position and dimensions on canvas
	 */
	function calculateGateRect(gate: GateConfig) {
		if (!gate.enabled) return null;
		
		// 将闸门参数转换为像素坐标
		// Convert gate parameters to pixel coordinates
		const x = gate.start * timeScale;
		const width = gate.width * timeScale;
		const centerY = chartHeight / 2;
		const height = gate.height * amplitudeScale;
		const y = centerY - height / 2;
		
		// 报警阈值线的Y坐标
		// Y coordinate for alarm threshold line
		const alarmY = centerY - (gate.alarmThreshold * amplitudeScale);
		
		return { x, y, width, height, alarmY };
	}
	
	$: gateARect = calculateGateRect(gateA);
	$: gateBRect = calculateGateRect(gateB);
</script>

<svg 
	class="gate-overlay" 
	width={chartWidth} 
	height={chartHeight}
	style="position: absolute; top: 0; left: 0; pointer-events: none;"
>
	<!-- 闸门A / Gate A -->
	{#if gateARect}
		<g class="gate-a">
			<!-- 闸门边界矩形 / Gate boundary rectangle -->
			<rect
				x={gateARect.x}
				y={gateARect.y}
				width={gateARect.width}
				height={gateARect.height}
				fill={gateA.color}
				fill-opacity="0.15"
				stroke={gateA.color}
				stroke-width="2"
				stroke-dasharray="5,5"
			/>
			
			<!-- 报警阈值线 / Alarm threshold line -->
			<line
				x1={gateARect.x}
				y1={gateARect.alarmY}
				x2={gateARect.x + gateARect.width}
				y2={gateARect.alarmY}
				stroke={gateA.color}
				stroke-width="2"
				stroke-dasharray="10,5"
			/>
			
			<!-- 闸门标签 / Gate label -->
			<text
				x={gateARect.x + 5}
				y={gateARect.y + 20}
				fill={gateA.color}
				font-size="14"
				font-weight="bold"
				font-family="monospace"
			>
				GATE A
			</text>
			
			<!-- 报警阈值标签 / Alarm threshold label -->
			<text
				x={gateARect.x + 5}
				y={gateARect.alarmY - 5}
				fill={gateA.color}
				font-size="12"
				font-family="monospace"
			>
				ALARM: {gateA.alarmThreshold.toFixed(2)}
			</text>
		</g>
	{/if}
	
	<!-- 闸门B / Gate B -->
	{#if gateBRect}
		<g class="gate-b">
			<!-- 闸门边界矩形 / Gate boundary rectangle -->
			<rect
				x={gateBRect.x}
				y={gateBRect.y}
				width={gateBRect.width}
				height={gateBRect.height}
				fill={gateB.color}
				fill-opacity="0.15"
				stroke={gateB.color}
				stroke-width="2"
				stroke-dasharray="5,5"
			/>
			
			<!-- 报警阈值线 / Alarm threshold line -->
			<line
				x1={gateBRect.x}
				y1={gateBRect.alarmY}
				x2={gateBRect.x + gateBRect.width}
				y2={gateBRect.alarmY}
				stroke={gateB.color}
				stroke-width="2"
				stroke-dasharray="10,5"
			/>
			
			<!-- 闸门标签 / Gate label -->
			<text
				x={gateBRect.x + 5}
				y={gateBRect.y + 20}
				fill={gateB.color}
				font-size="14"
				font-weight="bold"
				font-family="monospace"
			>
				GATE B
			</text>
			
			<!-- 报警阈值标签 / Alarm threshold label -->
			<text
				x={gateBRect.x + 5}
				y={gateBRect.alarmY - 5}
				fill={gateB.color}
				font-size="12"
				font-family="monospace"
			>
				ALARM: {gateB.alarmThreshold.toFixed(2)}
			</text>
		</g>
	{/if}
</svg>

<style>
	.gate-overlay {
		z-index: 10;
	}
	
	.gate-a, .gate-b {
		transition: opacity 0.3s ease;
	}
	
	/* 文字阴影增强可读性 / Text shadow for better readability */
	text {
		text-shadow: 
			0 0 4px rgba(0, 0, 0, 0.8),
			0 0 8px rgba(0, 0, 0, 0.6);
	}
</style>
