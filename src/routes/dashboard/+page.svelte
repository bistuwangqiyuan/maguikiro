<script lang="ts">
	import { testingStore, testingStats } from '$lib/stores/testing';
	import Gauge from '$lib/components/dashboard/Gauge.svelte';
	import ProgressBar from '$lib/components/dashboard/ProgressBar.svelte';
	import StatusIndicator from '$lib/components/dashboard/StatusIndicator.svelte';
	
	$: testing = $testingStore;
	$: stats = $testingStats;
	
	// 计算当前信号强度 / Calculate current signal strength
	$: currentAmplitude = testing.processedBuffer.length > 0 
		? Math.abs(testing.processedBuffer[testing.processedBuffer.length - 1].amplitude)
		: 0;
	
	// 计算检测进度百分比 / Calculate detection progress percentage
	$: progressPercentage = testing.status === 'running' ? 100 : 
		testing.status === 'paused' ? 50 : 0;
	
	// 状态详情 / Status details
	$: statusDetails = [
		{ 
			label: '增益 / Gain', 
			value: `${testing.currentSession?.parameters.gain || 0} dB` 
		},
		{ 
			label: '滤波器 / Filter', 
			value: testing.currentSession?.parameters.filter || 'N/A' 
		},
		{ 
			label: '速度 / Velocity', 
			value: `${testing.currentSession?.parameters.velocity || 0} m/s` 
		}
	];
	
	// 检查是否有异常 / Check for anomalies
	$: hasWarning = stats.defectsDetected > 5 || currentAmplitude > 3.0;
	
	// 质量评分计算 / Quality score calculation
	$: qualityScore = calculateQualityScore(stats.defectsDetected, currentAmplitude);
	
	function calculateQualityScore(defects: number, amplitude: number): number {
		let score = 100;
		
		// 根据缺陷数量扣分 / Deduct points based on defect count
		score -= defects * 2;
		
		// 根据信号异常扣分 / Deduct points based on signal anomalies
		if (amplitude > 3.0) score -= 10;
		if (amplitude > 5.0) score -= 20;
		
		return Math.max(0, Math.min(100, score));
	}
	
	// 质量评级 / Quality rating
	$: qualityRating = getQualityRating(qualityScore);
	
	function getQualityRating(score: number): string {
		if (score >= 95) return '优秀 / Excellent';
		if (score >= 85) return '良好 / Good';
		if (score >= 70) return '合格 / Fair';
		return '需改进 / Needs Improvement';
	}
</script>

<div class="dashboard-container">
	<div class="dashboard-header">
		<h1 class="text-3xl font-bold" style="color: var(--primary-orange);">
			实时监控仪表盘 / Real-time Monitoring Dashboard
		</h1>
		<p class="text-sm" style="color: var(--text-secondary);">
			系统状态和关键指标概览 / System Status and Key Metrics Overview
		</p>
	</div>

	<div class="dashboard-grid">
		<!-- 检测速度仪表 / Detection Speed Gauge -->
		<div class="dashboard-card">
			<Gauge 
				value={stats.samplingRate} 
				unit="Hz" 
				label="检测速度 / Detection Speed"
				min={0}
				max={120}
				warningThreshold={100}
				dangerThreshold={110}
			/>
		</div>

		<!-- 信号强度仪表 / Signal Strength Gauge -->
		<div class="dashboard-card">
			<Gauge 
				value={currentAmplitude} 
				unit="V" 
				label="信号强度 / Signal Strength"
				min={0}
				max={5}
				warningThreshold={3}
				dangerThreshold={4}
			/>
		</div>

		<!-- 检测进度 / Detection Progress -->
		<div class="dashboard-card">
			<ProgressBar 
				progress={progressPercentage}
				label="检测进度 / Detection Progress"
				status={testing.status === 'running' ? '进行中 / In Progress' : 
					testing.status === 'paused' ? '已暂停 / Paused' : 
					'未开始 / Not Started'}
			/>
			<div class="progress-stats">
				<div class="stat-item">
					<span class="stat-label">时长 / Duration:</span>
					<span class="stat-value">{stats.duration}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">样本数 / Samples:</span>
					<span class="stat-value">{stats.samplesCollected.toLocaleString()}</span>
				</div>
			</div>
		</div>

		<!-- 设备状态 / Device Status -->
		<div class="dashboard-card">
			<StatusIndicator 
				status={testing.status === 'running' ? 'running' : 
					testing.status === 'paused' ? 'paused' : 
					testing.status === 'error' ? 'error' : 'idle'}
				label="设备状态 / Device Status"
				details={statusDetails}
				showWarning={hasWarning}
			/>
		</div>

		<!-- 缺陷计数 / Defect Count -->
		<div class="dashboard-card highlight">
			<h3 class="card-title">缺陷检测 / Defect Detection</h3>
			<div class="defect-count">
				<div class="count-value">{stats.defectsDetected}</div>
				<div class="count-label">检测到的缺陷 / Defects Detected</div>
			</div>
			{#if stats.defectsDetected > 0}
				<div class="defect-severity">
					<div class="severity-item critical">
						<span class="severity-dot"></span>
						<span>严重 / Critical: 0</span>
					</div>
					<div class="severity-item high">
						<span class="severity-dot"></span>
						<span>高 / High: 0</span>
					</div>
					<div class="severity-item medium">
						<span class="severity-dot"></span>
						<span>中 / Medium: {stats.defectsDetected}</span>
					</div>
				</div>
			{/if}
		</div>

		<!-- 质量评分 / Quality Score -->
		<div class="dashboard-card">
			<h3 class="card-title">质量评分 / Quality Score</h3>
			<div class="score-container">
				<div class="score-circle">
					<svg viewBox="0 0 100 100">
						<circle cx="50" cy="50" r="45" class="score-bg"></circle>
						<circle 
							cx="50" 
							cy="50" 
							r="45" 
							class="score-progress"
							style="stroke-dashoffset: {283 - (283 * qualityScore / 100)}"
						></circle>
					</svg>
					<div class="score-value">{qualityScore}</div>
				</div>
				<div class="score-label">{qualityRating}</div>
			</div>
		</div>
	</div>
</div>

<style>
	.dashboard-container {
		width: 100%;
		height: 100%;
		padding: 24px;
		overflow-y: auto;
	}

	.dashboard-header {
		margin-bottom: 24px;
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 20px;
	}

	.dashboard-card {
		background: linear-gradient(135deg, var(--bg-medium) 0%, var(--bg-dark) 100%);
		border: 2px solid var(--bg-light);
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		transition: all 0.3s ease;
	}

	.dashboard-card:hover {
		border-color: var(--primary-orange);
		box-shadow: 0 6px 16px rgba(255, 107, 53, 0.3);
		transform: translateY(-2px);
	}

	.dashboard-card.highlight {
		border-color: var(--primary-orange);
		background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, var(--bg-dark) 100%);
	}

	.card-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--primary-orange);
		margin-bottom: 16px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* 进度统计样式 / Progress Stats Styles */
	.progress-stats {
		display: flex;
		justify-content: space-around;
		margin-top: 16px;
		padding-top: 16px;
		border-top: 1px solid var(--bg-light);
	}
	
	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}
	
	.stat-label {
		font-size: 11px;
		color: var(--text-secondary);
		text-transform: uppercase;
	}
	
	.stat-value {
		font-size: 16px;
		font-weight: bold;
		color: var(--text-primary);
		font-family: 'Roboto Mono', monospace;
	}

	/* 缺陷计数样式 / Defect Count Styles */
	.defect-count {
		text-align: center;
		margin: 20px 0;
	}

	.count-value {
		font-size: 56px;
		font-weight: bold;
		color: var(--primary-orange);
		font-family: 'Roboto Mono', monospace;
	}

	.count-label {
		font-size: 14px;
		color: var(--text-secondary);
		margin-top: 8px;
	}

	.defect-severity {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 16px;
	}

	.severity-item {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		color: var(--text-secondary);
	}

	.severity-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
	}

	.severity-item.critical .severity-dot {
		background: var(--error);
	}

	.severity-item.high .severity-dot {
		background: var(--warning);
	}

	.severity-item.medium .severity-dot {
		background: var(--info);
	}

	/* 质量评分样式 / Quality Score Styles */
	.score-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 20px 0;
	}

	.score-circle {
		position: relative;
		width: 120px;
		height: 120px;
	}

	.score-circle svg {
		transform: rotate(-90deg);
	}

	.score-bg {
		fill: none;
		stroke: var(--bg-light);
		stroke-width: 8;
	}

	.score-progress {
		fill: none;
		stroke: var(--primary-orange);
		stroke-width: 8;
		stroke-linecap: round;
		stroke-dasharray: 283;
		transition: stroke-dashoffset 1s ease;
	}

	.score-value {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 32px;
		font-weight: bold;
		color: var(--text-primary);
		font-family: 'Roboto Mono', monospace;
	}

	.score-label {
		margin-top: 12px;
		font-size: 14px;
		color: var(--text-secondary);
	}

	/* 响应式设计 / Responsive Design */
	@media (max-width: 768px) {
		.dashboard-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
