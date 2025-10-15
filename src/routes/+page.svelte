<script lang="ts">
	import { testingStore, testingStats } from '$lib/stores/testing';
	import { WaveformChart } from '$lib/components/waveform';
	
	// 订阅testing store / Subscribe to testing store
	$: testing = $testingStore;
	$: stats = $testingStats;
	$: showWaveform = testing.status === 'running' || testing.status === 'paused' || testing.processedBuffer.length > 0;
</script>

<div class="main-content">
	{#if showWaveform}
		<!-- 波形显示模式 / Waveform Display Mode -->
		<div class="waveform-section">
			<div class="waveform-header">
				<h2 class="text-2xl font-bold" style="color: var(--primary-orange);">
					实时波形监测 / Real-time Waveform Monitoring
				</h2>
				<div class="stats-bar">
					<div class="stat-item">
						<span class="stat-label">时长 / Duration:</span>
						<span class="stat-value">{stats.duration}</span>
					</div>
					<div class="stat-item">
						<span class="stat-label">采样数 / Samples:</span>
						<span class="stat-value">{stats.samplesCollected}</span>
					</div>
					<div class="stat-item">
						<span class="stat-label">缺陷 / Defects:</span>
						<span class="stat-value">{stats.defectsDetected}</span>
					</div>
					<div class="stat-item">
						<span class="stat-label">采样率 / Rate:</span>
						<span class="stat-value">{stats.samplingRate} Hz</span>
					</div>
				</div>
			</div>
			
			<div class="waveform-display">
				<WaveformChart height={450} refreshRate={30} />
			</div>
			
			<div class="waveform-info">
				<div class="info-row">
					<span class="info-label">项目名称 / Project:</span>
					<span class="info-value">{testing.currentSession?.projectName || 'N/A'}</span>
				</div>
				<div class="info-row">
					<span class="info-label">增益 / Gain:</span>
					<span class="info-value">{testing.currentSession?.parameters.gain || 0} dB</span>
				</div>
				<div class="info-row">
					<span class="info-label">滤波器 / Filter:</span>
					<span class="info-value">{testing.currentSession?.parameters.filter || 'N/A'}</span>
				</div>
				<div class="info-row">
					<span class="info-label">速度 / Velocity:</span>
					<span class="info-value">{testing.currentSession?.parameters.velocity || 0} m/s</span>
				</div>
			</div>
		</div>
	{:else}
		<!-- 欢迎界面 / Welcome Screen -->
		<div class="welcome-section">
			<h1 class="text-4xl font-bold mb-4" style="color: var(--primary-orange);">
				DOPPLER 磁检测仪器系统
			</h1>
			<p class="text-xl mb-8" style="color: var(--text-secondary);">
				Magnetic Testing Instrument System
			</p>
			
			<div class="grid grid-cols-2 gap-6 mt-8">
				<div class="info-card">
					<h3 class="text-lg font-semibold mb-2">系统状态 / System Status</h3>
					<div class="status-indicator">
						<span class="status-dot ready"></span>
						<span>就绪 / Ready</span>
					</div>
				</div>
				
				<div class="info-card">
					<h3 class="text-lg font-semibold mb-2">设备型号 / Model</h3>
					<p class="font-mono-digits">MT-2000 Series</p>
				</div>
				
				<div class="info-card">
					<h3 class="text-lg font-semibold mb-2">检测模式 / Mode</h3>
					<p>接触式磁检测 / Contact Magnetic Testing</p>
				</div>
				
				<div class="info-card">
					<h3 class="text-lg font-semibold mb-2">标准 / Standards</h3>
					<p>ASME, ISO, EN, ASTM</p>
				</div>
			</div>
			
			<div class="mt-8 text-center">
				<p class="text-sm" style="color: var(--text-disabled);">
					点击左侧"播放"按钮开始检测 / Click "Play" button on the left to start testing
				</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.main-content {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 32px;
		overflow-y: auto;
	}

	/* 欢迎界面样式 / Welcome Screen Styles */
	.welcome-section {
		max-width: 800px;
		text-align: center;
	}

	.info-card {
		background: linear-gradient(135deg, var(--bg-medium) 0%, var(--bg-dark) 100%);
		border: 2px solid var(--bg-light);
		border-radius: 8px;
		padding: 20px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
		transition: all 0.3s ease;
	}

	.info-card:hover {
		border-color: var(--primary-orange);
		box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
	}

	.info-card h3 {
		color: var(--primary-orange);
		margin-bottom: 12px;
	}

	.info-card p {
		color: var(--text-secondary);
		font-size: 14px;
	}

	.status-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-size: 16px;
		color: var(--text-primary);
	}

	.status-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		animation: pulse 2s ease-in-out infinite;
	}

	.status-dot.ready {
		background: var(--success);
		box-shadow: 0 0 12px var(--success);
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
	}

	/* 波形显示样式 / Waveform Display Styles */
	.waveform-section {
		width: 100%;
		max-width: 1200px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.waveform-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px;
		background: linear-gradient(135deg, var(--bg-medium) 0%, var(--bg-dark) 100%);
		border: 2px solid var(--bg-light);
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
	}

	.stats-bar {
		display: flex;
		gap: 24px;
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
		letter-spacing: 0.5px;
	}

	.stat-value {
		font-size: 18px;
		font-weight: bold;
		color: var(--primary-orange);
		font-family: 'Roboto Mono', monospace;
	}

	.waveform-display {
		width: 100%;
	}

	.waveform-info {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
		padding: 16px;
		background: linear-gradient(135deg, var(--bg-medium) 0%, var(--bg-dark) 100%);
		border: 2px solid var(--bg-light);
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
	}

	.info-row {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.info-label {
		font-size: 11px;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.info-value {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-primary);
		font-family: 'Roboto Mono', monospace;
	}

	/* 响应式设计 / Responsive Design */
	@media (max-width: 768px) {
		.waveform-header {
			flex-direction: column;
			gap: 16px;
		}

		.stats-bar {
			width: 100%;
			justify-content: space-around;
		}

		.waveform-info {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
