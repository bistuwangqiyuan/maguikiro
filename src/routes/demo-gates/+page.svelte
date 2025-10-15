<script lang="ts">
	import WaveformWithGates from '$lib/components/waveform/WaveformWithGates.svelte';
	import type { GateConfig, Defect } from '$lib/types/signal';
	
	/**
	 * 闸门和缺陷标记可视化演示页面 / Gate and Defect Marker Visualization Demo Page
	 */
	
	// 闸门A配置 / Gate A configuration
	let gateA: GateConfig = {
		enabled: true,
		start: 2.0,
		width: 2.0,
		height: 3.0,
		alarmThreshold: 1.5,
		color: '#FFD700' // 金色 / Gold
	};
	
	// 闸门B配置 / Gate B configuration
	let gateB: GateConfig = {
		enabled: true,
		start: 5.5,
		width: 1.5,
		height: 2.5,
		alarmThreshold: 2.0,
		color: '#FF69B4' // 粉色 / Pink
	};
	
	// 模拟缺陷数据 / Simulated defect data
	let defects: Defect[] = [
		{
			id: 'defect-1',
			position: 2.5,
			amplitude: 2.0,
			severity: 'high',
			timestamp: new Date(),
			gateTriggered: 'A',
			notes: '高幅值缺陷 / High amplitude defect'
		},
		{
			id: 'defect-2',
			position: 3.2,
			amplitude: 1.8,
			severity: 'medium',
			timestamp: new Date(),
			gateTriggered: 'A',
			notes: '中等缺陷 / Medium defect'
		},
		{
			id: 'defect-3',
			position: 6.0,
			amplitude: 2.5,
			severity: 'critical',
			timestamp: new Date(),
			gateTriggered: 'B',
			notes: '严重缺陷 / Critical defect'
		},
		{
			id: 'defect-4',
			position: 6.8,
			amplitude: 1.2,
			severity: 'low',
			timestamp: new Date(),
			gateTriggered: 'B',
			notes: '低幅值缺陷 / Low amplitude defect'
		},
		{
			id: 'defect-5',
			position: 8.5,
			amplitude: 1.6,
			severity: 'medium',
			timestamp: new Date(),
			gateTriggered: 'both',
			notes: '双闸门触发 / Both gates triggered'
		}
	];
	
	// 图表尺寸 / Chart dimensions
	let width = 800;
	let height = 400;
	
	// 选中的缺陷 / Selected defect
	let selectedDefect: Defect | null = null;
	
	/**
	 * 处理缺陷点击 / Handle defect click
	 */
	function handleDefectClick(defect: Defect) {
		selectedDefect = defect;
		console.log('Defect clicked:', defect);
	}
 
</
script>

<div class="demo-container">
	<div class="demo-header">
		<h1>闸门和缺陷标记可视化演示 / Gate & Defect Marker Visualization Demo</h1>
		<p>实时波形图上的闸门和缺陷标记显示 / Gate and defect marker display on real-time waveform</p>
	</div>
	
	<div class="waveform-section">
		<WaveformWithGates 
			{gateA}
			{gateB}
			{defects}
			{width}
			{height}
			onDefectClick={handleDefectClick}
		/>
	</div>
	
	{#if selectedDefect}
		<div class="defect-details">
			<h3>选中的缺陷详情 / Selected Defect Details</h3>
			<div class="detail-grid">
				<div class="detail-item">
					<span class="label">ID:</span>
					<span class="value">{selectedDefect.id}</span>
				</div>
				<div class="detail-item">
					<span class="label">位置 / Position:</span>
					<span class="value">{selectedDefect.position.toFixed(3)}s</span>
				</div>
				<div class="detail-item">
					<span class="label">幅值 / Amplitude:</span>
					<span class="value">{selectedDefect.amplitude.toFixed(3)}V</span>
				</div>
				<div class="detail-item">
					<span class="label">严重程度 / Severity:</span>
					<span class="value severity-{selectedDefect.severity}">{selectedDefect.severity.toUpperCase()}</span>
				</div>
				<div class="detail-item">
					<span class="label">触发闸门 / Gate Triggered:</span>
					<span class="value">{selectedDefect.gateTriggered.toUpperCase()}</span>
				</div>
				<div class="detail-item">
					<span class="label">时间 / Time:</span>
					<span class="value">{selectedDefect.timestamp.toLocaleString()}</span>
				</div>
				{#if selectedDefect.notes}
					<div class="detail-item full-width">
						<span class="label">备注 / Notes:</span>
						<span class="value">{selectedDefect.notes}</span>
					</div>
				{/if}
			</div>
			<button class="close-btn" on:click={() => selectedDefect = null}>关闭 / Close</button>
		</div>
	{/if}
	
	<div class="controls-section">
		<div class="gate-controls">
			<h2>闸门A控制 / Gate A Controls</h2>
			<div class="control-group">
				<label>
					<input type="checkbox" bind:checked={gateA.enabled} />
					启用 / Enable
				</label>
			</div>
			<div class="control-group">
				<label>
					起始位置 / Start Position: {gateA.start.toFixed(2)}s
					<input type="range" bind:value={gateA.start} min="0" max="8" step="0.1" />
				</label>
			</div>
			<div class="control-group">
				<label>
					宽度 / Width: {gateA.width.toFixed(2)}s
					<input type="range" bind:value={gateA.width} min="0.5" max="4" step="0.1" />
				</label>
			</div>
			<div class="control-group">
				<label>
					高度 / Height: {gateA.height.toFixed(2)}V
					<input type="range" bind:value={gateA.height} min="1" max="5" step="0.1" />
				</label>
			</div>
			<div class="control-group">
				<label>
					报警阈值 / Alarm Threshold: {gateA.alarmThreshold.toFixed(2)}V
					<input type="range" bind:value={gateA.alarmThreshold} min="0.5" max="3" step="0.1" />
				</label>
			</div>
		</div>
		
		<div class="gate-controls">
			<h2>闸门B控制 / Gate B Controls</h2>
			<div class="control-group">
				<label>
					<input type="checkbox" bind:checked={gateB.enabled} />
					启用 / Enable
				</label>
			</div>
			<div class="control-group">
				<label>
					起始位置 / Start Position: {gateB.start.toFixed(2)}s
					<input type="range" bind:value={gateB.start} min="0" max="8" step="0.1" />
				</label>
			</div>
			<div class="control-group">
				<label>
					宽度 / Width: {gateB.width.toFixed(2)}s
					<input type="range" bind:value={gateB.width} min="0.5" max="4" step="0.1" />
				</label>
			</div>
			<div class="control-group">
				<label>
					高度 / Height: {gateB.height.toFixed(2)}V
					<input type="range" bind:value={gateB.height} min="1" max="5" step="0.1" />
				</label>
			</div>
			<div class="control-group">
				<label>
					报警阈值 / Alarm Threshold: {gateB.alarmThreshold.toFixed(2)}V
					<input type="range" bind:value={gateB.alarmThreshold} min="0.5" max="3" step="0.1" />
				</label>
			</div>
		</div>
	</div>
	
	<div class="info-section">
		<h3>说明 / Instructions</h3>
		<ul>
			<li>闸门A（金色）和闸门B（粉色）显示在波形图上 / Gate A (gold) and Gate B (pink) are displayed on the waveform</li>
			<li>虚线矩形表示闸门的时间和幅值范围 / Dashed rectangles indicate the time and amplitude range of gates</li>
			<li>水平虚线表示报警阈值 / Horizontal dashed lines indicate alarm thresholds</li>
			<li>使用滑块实时调整闸门参数 / Use sliders to adjust gate parameters in real-time</li>
			<li>当信号幅值超过报警阈值时，系统会记录缺陷 / When signal amplitude exceeds alarm threshold, the system records defects</li>
			<li><strong>缺陷标记：</strong>垂直虚线和彩色圆点标记缺陷位置 / <strong>Defect Markers:</strong> Vertical dashed lines and colored dots mark defect positions</li>
			<li><strong>颜色编码：</strong>绿色=低，黄色=中，橙色=高，红色=严重 / <strong>Color Coding:</strong> Green=Low, Yellow=Medium, Orange=High, Red=Critical</li>
			<li><strong>交互：</strong>点击或悬停缺陷标记查看详细信息 / <strong>Interaction:</strong> Click or hover defect markers to view details</li>
			<li><strong>统计面板：</strong>右上角显示缺陷总数和分类统计 / <strong>Statistics Panel:</strong> Top-right shows total defects and breakdown by severity</li>
		</ul>
	</div>
</div>

<style>
	.demo-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		background: #0d0d0d;
		min-height: 100vh;
	}
	
	.demo-header {
		text-align: center;
		margin-bottom: 2rem;
		color: #ffffff;
	}
	
	.demo-header h1 {
		font-size: 2rem;
		font-weight: bold;
		margin-bottom: 0.5rem;
		color: #ff6b35;
	}
	
	.demo-header p {
		font-size: 1rem;
		color: #b0b0b0;
	}
	
	.waveform-section {
		margin-bottom: 2rem;
		display: flex;
		justify-content: center;
	}
	
	.controls-section {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin-bottom: 2rem;
	}
	
	.gate-controls {
		background: #1a1a1a;
		border: 2px solid #2d2d2d;
		border-radius: 8px;
		padding: 1.5rem;
	}
	
	.gate-controls h2 {
		font-size: 1.25rem;
		font-weight: bold;
		margin-bottom: 1rem;
		color: #ff6b35;
	}
	
	.control-group {
		margin-bottom: 1rem;
	}
	
	.control-group label {
		display: block;
		color: #ffffff;
		font-size: 0.9rem;
		margin-bottom: 0.5rem;
	}
	
	.control-group input[type="range"] {
		width: 100%;
		height: 6px;
		background: #2d2d2d;
		border-radius: 3px;
		outline: none;
		margin-top: 0.5rem;
	}
	
	.control-group input[type="range"]::-webkit-slider-thumb {
		appearance: none;
		width: 16px;
		height: 16px;
		background: #ff6b35;
		border-radius: 50%;
		cursor: pointer;
	}
	
	.control-group input[type="range"]::-moz-range-thumb {
		width: 16px;
		height: 16px;
		background: #ff6b35;
		border-radius: 50%;
		cursor: pointer;
		border: none;
	}
	
	.control-group input[type="checkbox"] {
		margin-right: 0.5rem;
		width: 18px;
		height: 18px;
		cursor: pointer;
	}
	
	.info-section {
		background: #1a1a1a;
		border: 2px solid #2d2d2d;
		border-radius: 8px;
		padding: 1.5rem;
		color: #ffffff;
	}
	
	.info-section h3 {
		font-size: 1.25rem;
		font-weight: bold;
		margin-bottom: 1rem;
		color: #ff6b35;
	}
	
	.info-section ul {
		list-style: disc;
		padding-left: 2rem;
		color: #b0b0b0;
	}
	
	.info-section li {
		margin-bottom: 0.5rem;
		line-height: 1.6;
	}
	
	.defect-details {
		background: #1a1a1a;
		border: 2px solid #ff6b35;
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 2rem;
		color: #ffffff;
		animation: slideIn 0.3s ease-out;
	}
	
	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.defect-details h3 {
		font-size: 1.25rem;
		font-weight: bold;
		margin-bottom: 1rem;
		color: #ff6b35;
	}
	
	.detail-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		margin-bottom: 1rem;
	}
	
	.detail-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	
	.detail-item.full-width {
		grid-column: 1 / -1;
	}
	
	.detail-item .label {
		font-size: 0.85rem;
		color: #b0b0b0;
		font-weight: 500;
	}
	
	.detail-item .value {
		font-size: 1rem;
		color: #ffffff;
		font-family: 'Roboto Mono', monospace;
		font-weight: bold;
	}
	
	.detail-item .value.severity-low {
		color: #4CAF50;
	}
	
	.detail-item .value.severity-medium {
		color: #FFC107;
	}
	
	.detail-item .value.severity-high {
		color: #FF9800;
	}
	
	.detail-item .value.severity-critical {
		color: #F44336;
	}
	
	.close-btn {
		background: #ff6b35;
		color: #ffffff;
		border: none;
		border-radius: 4px;
		padding: 0.5rem 1.5rem;
		font-size: 0.9rem;
		font-weight: bold;
		cursor: pointer;
		transition: background 0.2s ease;
	}
	
	.close-btn:hover {
		background: #e55a2b;
	}
	
	.close-btn:active {
		transform: scale(0.98);
	}
	
	@media (max-width: 768px) {
		.controls-section {
			grid-template-columns: 1fr;
		}
		
		.detail-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
