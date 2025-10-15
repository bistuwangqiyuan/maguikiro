<script lang="ts">
	/**
	 * 仪表盘组件 / Gauge Component
	 * 
	 * 显示数值型指标，如检测速度、信号强度等
	 * Displays numeric metrics like detection speed, signal strength, etc.
	 */
	
	export let value: number = 0;
	export let unit: string = '';
	export let label: string = '';
	export let min: number = 0;
	export let max: number = 100;
	export let warningThreshold: number | null = null;
	export let dangerThreshold: number | null = null;
	
	// 计算百分比 / Calculate percentage
	$: percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
	
	// 确定颜色 / Determine color
	$: color = getColor(value);
	
	function getColor(val: number): string {
		if (dangerThreshold !== null && val >= dangerThreshold) {
			return 'var(--error)';
		}
		if (warningThreshold !== null && val >= warningThreshold) {
			return 'var(--warning)';
		}
		return 'var(--primary-orange)';
	}
	
	// 格式化数值 / Format value
	$: displayValue = typeof value === 'number' ? value.toFixed(2) : '0.00';
</script>

<div class="gauge-card">
	<div class="gauge-header">
		<h3 class="gauge-title">{label}</h3>
	</div>
	
	<div class="gauge-body">
		<!-- 圆形仪表 / Circular gauge -->
		<div class="gauge-circle">
			<svg viewBox="0 0 200 200" class="gauge-svg">
				<!-- 背景圆 / Background circle -->
				<circle
					cx="100"
					cy="100"
					r="80"
					fill="none"
					stroke="var(--bg-light)"
					stroke-width="12"
				/>
				
				<!-- 进度圆 / Progress circle -->
				<circle
					cx="100"
					cy="100"
					r="80"
					fill="none"
					stroke={color}
					stroke-width="12"
					stroke-linecap="round"
					stroke-dasharray="502.4"
					stroke-dashoffset={502.4 - (502.4 * percentage) / 100}
					class="gauge-progress"
					style="transform: rotate(-90deg); transform-origin: center;"
				/>
			</svg>
			
			<!-- 中心数值 / Center value -->
			<div class="gauge-center">
				<div class="gauge-value" style="color: {color}">
					{displayValue}
				</div>
				{#if unit}
					<div class="gauge-unit">{unit}</div>
				{/if}
			</div>
		</div>
		
		<!-- 范围标签 / Range labels -->
		<div class="gauge-range">
			<span class="range-min">{min}</span>
			<span class="range-max">{max}</span>
		</div>
	</div>
</div>

<style>
	.gauge-card {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	
	.gauge-header {
		margin-bottom: 16px;
	}
	
	.gauge-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	
	.gauge-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.gauge-circle {
		position: relative;
		width: 200px;
		height: 200px;
	}
	
	.gauge-svg {
		width: 100%;
		height: 100%;
	}
	
	.gauge-progress {
		transition: stroke-dashoffset 0.5s ease, stroke 0.3s ease;
	}
	
	.gauge-center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
	}
	
	.gauge-value {
		font-size: 36px;
		font-weight: bold;
		font-family: 'Roboto Mono', monospace;
		line-height: 1;
		transition: color 0.3s ease;
	}
	
	.gauge-unit {
		font-size: 16px;
		color: var(--text-secondary);
		font-family: 'Roboto Mono', monospace;
		margin-top: 4px;
	}
	
	.gauge-range {
		display: flex;
		justify-content: space-between;
		width: 180px;
		margin-top: 8px;
		font-size: 12px;
		color: var(--text-secondary);
		font-family: 'Roboto Mono', monospace;
	}
	
	/* 响应式设计 / Responsive design */
	@media (max-width: 768px) {
		.gauge-circle {
			width: 160px;
			height: 160px;
		}
		
		.gauge-value {
			font-size: 28px;
		}
		
		.gauge-unit {
			font-size: 14px;
		}
	}
</style>
