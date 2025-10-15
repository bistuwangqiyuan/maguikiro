<script lang="ts">
	import type { Defect } from '$lib/types/signal';
	
	/**
	 * 缺陷标记组件 / Defect Marker Component
	 * 
	 * 在波形图上标记缺陷位置，根据严重程度使用不同颜色
	 * Marks defect positions on waveform chart with different colors based on severity
	 */
	
	// Props
	export let defects: Defect[] = [];
	export let chartWidth: number = 800;
	export let chartHeight: number = 400;
	export let timeScale: number = 1; // 时间轴缩放比例 / Time axis scale
	export let amplitudeScale: number = 1; // 幅值轴缩放比例 / Amplitude axis scale
	export let onDefectClick: ((defect: Defect) => void) | null = null;
	
	// 状态 / State
	let selectedDefect: Defect | null = null;
	let hoveredDefect: Defect | null = null;
	
	/**
	 * 根据严重程度获取颜色 / Get color based on severity
	 */
	function getSeverityColor(severity: Defect['severity']): string {
		const colors = {
			low: '#4CAF50',      // 绿色 / Green
			medium: '#FFC107',   // 黄色 / Yellow
			high: '#FF9800',     // 橙色 / Orange
			critical: '#F44336'  // 红色 / Red
		};
		return colors[severity];
	}
	
	/**
	 * 计算缺陷标记的位置 / Calculate defect marker position
	 */
	function calculateMarkerPosition(defect: Defect) {
		const x = defect.position * timeScale;
		const centerY = chartHeight / 2;
		const y = centerY - (defect.amplitude * amplitudeScale);
		
		return { x, y };
	}
	
	/**
	 * 处理缺陷点击 / Handle defect click
	 */
	function handleDefectClick(defect: Defect) {
		selectedDefect = defect;
		if (onDefectClick) {
			onDefectClick(defect);
		}
	}
	
	/**
	 * 处理鼠标悬停 / Handle mouse hover
	 */
	function handleMouseEnter(defect: Defect) {
		hoveredDefect = defect;
	}
	
	function handleMouseLeave() {
		hoveredDefect = null;
	}
	
	/**
	 * 获取严重程度标签 / Get severity label
	 */
	function getSeverityLabel(severity: Defect['severity']): string {
		const labels = {
			low: '低 / Low',
			medium: '中 / Medium',
			high: '高 / High',
			critical: '严重 / Critical'
		};
		return labels[severity];
	}
	
	// 按严重程度分组缺陷 / Group defects by severity
	$: defectsBySeverity = {
		critical: defects.filter(d => d.severity === 'critical').length,
		high: defects.filter(d => d.severity === 'high').length,
		medium: defects.filter(d => d.severity === 'medium').length,
		low: defects.filter(d => d.severity === 'low').length
	};
	
	$: totalDefects = defects.length;
</script>

<svg 
	class="signal-marker-overlay" 
	width={chartWidth} 
	height={chartHeight}
	style="position: absolute; top: 0; left: 0; pointer-events: auto;"
>
	<!-- 缺陷标记 / Defect markers -->
	{#each defects as defect (defect.id)}
		{@const pos = calculateMarkerPosition(defect)}
		{@const color = getSeverityColor(defect.severity)}
		{@const isSelected = selectedDefect?.id === defect.id}
		{@const isHovered = hoveredDefect?.id === defect.id}
		
		<g 
			class="defect-marker"
			class:selected={isSelected}
			class:hovered={isHovered}
			on:click={() => handleDefectClick(defect)}
			on:mouseenter={() => handleMouseEnter(defect)}
			on:mouseleave={handleMouseLeave}
			role="button"
			tabindex="0"
			aria-label="Defect at position {defect.position.toFixed(2)}"
		>
			<!-- 垂直指示线 / Vertical indicator line -->
			<line
				x1={pos.x}
				y1={0}
				x2={pos.x}
				y2={chartHeight}
				stroke={color}
				stroke-width={isSelected || isHovered ? 2 : 1}
				stroke-opacity={isSelected || isHovered ? 0.8 : 0.4}
				stroke-dasharray="4,4"
			/>
			
			<!-- 缺陷点标记 / Defect point marker -->
			<circle
				cx={pos.x}
				cy={pos.y}
				r={isSelected || isHovered ? 8 : 6}
				fill={color}
				stroke="#FFFFFF"
				stroke-width={isSelected || isHovered ? 3 : 2}
				opacity={isSelected || isHovered ? 1 : 0.9}
				class="defect-point"
			/>
			
			<!-- 脉冲动画圆圈（仅严重缺陷）/ Pulse animation circle (critical defects only) -->
			{#if defect.severity === 'critical'}
				<circle
					cx={pos.x}
					cy={pos.y}
					r="6"
					fill="none"
					stroke={color}
					stroke-width="2"
					opacity="0"
					class="pulse-ring"
				/>
			{/if}
			
			<!-- 悬停/选中时显示详细信息 / Show details on hover/select -->
			{#if isHovered || isSelected}
				<g class="defect-tooltip">
					<!-- 工具提示背景 / Tooltip background -->
					<rect
						x={pos.x + 15}
						y={pos.y - 60}
						width="180"
						height="55"
						fill="rgba(0, 0, 0, 0.9)"
						stroke={color}
						stroke-width="2"
						rx="4"
					/>
					
					<!-- 工具提示文本 / Tooltip text -->
					<text
						x={pos.x + 20}
						y={pos.y - 40}
						fill={color}
						font-size="12"
						font-weight="bold"
						font-family="Roboto Mono"
					>
						{getSeverityLabel(defect.severity)}
					</text>
					
					<text
						x={pos.x + 20}
						y={pos.y - 25}
						fill="#FFFFFF"
						font-size="11"
						font-family="Roboto Mono"
					>
						位置 / Pos: {defect.position.toFixed(3)}
					</text>
					
					<text
						x={pos.x + 20}
						y={pos.y - 10}
						fill="#FFFFFF"
						font-size="11"
						font-family="Roboto Mono"
					>
						幅值 / Amp: {defect.amplitude.toFixed(3)} V
					</text>
				</g>
			{/if}
		</g>
	{/each}
</svg>

<!-- 缺陷计数显示 / Defect count display -->
<div class="defect-count-panel">
	<div class="count-header">
		<span class="icon">⚠</span>
		<span class="title">缺陷统计 / Defects</span>
	</div>
	
	<div class="count-total">
		<span class="label">总计 / Total:</span>
		<span class="value">{totalDefects}</span>
	</div>
	
	<div class="count-breakdown">
		{#if defectsBySeverity.critical > 0}
			<div class="count-item critical">
				<span class="dot" style="background-color: {getSeverityColor('critical')}"></span>
				<span class="label">严重 / Critical:</span>
				<span class="value">{defectsBySeverity.critical}</span>
			</div>
		{/if}
		
		{#if defectsBySeverity.high > 0}
			<div class="count-item high">
				<span class="dot" style="background-color: {getSeverityColor('high')}"></span>
				<span class="label">高 / High:</span>
				<span class="value">{defectsBySeverity.high}</span>
			</div>
		{/if}
		
		{#if defectsBySeverity.medium > 0}
			<div class="count-item medium">
				<span class="dot" style="background-color: {getSeverityColor('medium')}"></span>
				<span class="label">中 / Medium:</span>
				<span class="value">{defectsBySeverity.medium}</span>
			</div>
		{/if}
		
		{#if defectsBySeverity.low > 0}
			<div class="count-item low">
				<span class="dot" style="background-color: {getSeverityColor('low')}"></span>
				<span class="label">低 / Low:</span>
				<span class="value">{defectsBySeverity.low}</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.signal-marker-overlay {
		z-index: 20;
		cursor: pointer;
	}
	
	.defect-marker {
		cursor: pointer;
		transition: all 0.2s ease;
	}
	
	.defect-marker:hover .defect-point,
	.defect-marker.selected .defect-point {
		filter: drop-shadow(0 0 8px currentColor);
	}
	
	.defect-marker:focus {
		outline: none;
	}
	
	/* 脉冲动画 / Pulse animation */
	@keyframes pulse {
		0% {
			r: 6;
			opacity: 1;
		}
		100% {
			r: 20;
			opacity: 0;
		}
	}
	
	.pulse-ring {
		animation: pulse 2s ease-out infinite;
	}
	
	/* 工具提示文字阴影 / Tooltip text shadow */
	.defect-tooltip text {
		text-shadow: 
			0 0 4px rgba(0, 0, 0, 0.8),
			0 0 8px rgba(0, 0, 0, 0.6);
	}
	
	/* 缺陷计数面板 / Defect count panel */
	.defect-count-panel {
		position: absolute;
		top: 10px;
		right: 10px;
		background: rgba(0, 0, 0, 0.85);
		border: 2px solid #FF6B35;
		border-radius: 6px;
		padding: 12px;
		min-width: 200px;
		font-family: 'Roboto Mono', monospace;
		color: #FFFFFF;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
		z-index: 30;
	}
	
	.count-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 10px;
		padding-bottom: 8px;
		border-bottom: 1px solid #FF6B35;
	}
	
	.count-header .icon {
		font-size: 18px;
		color: #FF6B35;
	}
	
	.count-header .title {
		font-size: 13px;
		font-weight: bold;
		color: #FF6B35;
	}
	
	.count-total {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
		padding: 6px 8px;
		background: rgba(255, 107, 53, 0.1);
		border-radius: 4px;
	}
	
	.count-total .label {
		font-size: 12px;
		color: #B0B0B0;
	}
	
	.count-total .value {
		font-size: 18px;
		font-weight: bold;
		color: #FF6B35;
	}
	
	.count-breakdown {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	
	.count-item {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 11px;
		padding: 4px 8px;
		border-radius: 3px;
		background: rgba(255, 255, 255, 0.05);
	}
	
	.count-item .dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	
	.count-item .label {
		flex: 1;
		color: #B0B0B0;
	}
	
	.count-item .value {
		font-weight: bold;
		color: #FFFFFF;
		min-width: 20px;
		text-align: right;
	}
	
	/* 严重程度特定样式 / Severity-specific styles */
	.count-item.critical {
		border-left: 3px solid #F44336;
	}
	
	.count-item.high {
		border-left: 3px solid #FF9800;
	}
	
	.count-item.medium {
		border-left: 3px solid #FFC107;
	}
	
	.count-item.low {
		border-left: 3px solid #4CAF50;
	}
</style>
