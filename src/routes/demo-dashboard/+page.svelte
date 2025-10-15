<script lang="ts">
	/**
	 * Dashboard Components Demo / 仪表盘组件演示
	 * 
	 * 展示所有仪表盘组件的功能和用法
	 * Demonstrates all dashboard components functionality and usage
	 */
	
	import Gauge from '$lib/components/dashboard/Gauge.svelte';
	import ProgressBar from '$lib/components/dashboard/ProgressBar.svelte';
	import StatusIndicator from '$lib/components/dashboard/StatusIndicator.svelte';
	import { onMount } from 'svelte';
	
	// 模拟数据 / Mock data
	let samplingRate = 85;
	let signalStrength = 2.3;
	let progress = 45;
	let status: 'idle' | 'running' | 'paused' | 'error' | 'warning' = 'running';
	
	// 模拟实时更新 / Simulate real-time updates
	onMount(() => {
		const interval = setInterval(() => {
			// 更新采样率 / Update sampling rate
			samplingRate = 80 + Math.random() * 20;
			
			// 更新信号强度 / Update signal strength
			signalStrength = 1.5 + Math.random() * 2;
			
			// 更新进度 / Update progress
			progress = Math.min(progress + 1, 100);
			if (progress >= 100) progress = 0;
		}, 1000);
		
		return () => clearInterval(interval);
	});
	
	// 状态详情 / Status details
	const statusDetails = [
		{ label: '增益 / Gain', value: '60 dB' },
		{ label: '滤波器 / Filter', value: 'bandpass' },
		{ label: '速度 / Velocity', value: '1.5 m/s' }
	];
</script>

<div class="demo-container">
	<div class="demo-header">
		<h1 class="text-3xl font-bold" style="color: var(--primary-orange);">
			仪表盘组件演示 / Dashboard Components Demo
		</h1>
		<p class="text-sm" style="color: var(--text-secondary);">
			实时数据监控组件展示 / Real-time Data Monitoring Components Showcase
		</p>
	</div>
	
	<div class="demo-section">
		<h2 class="section-title">Gauge Component / 仪表盘组件</h2>
		<div class="demo-grid">
			<div class="demo-card">
				<Gauge 
					value={samplingRate} 
					unit="Hz" 
					label="检测速度 / Detection Speed"
					min={0}
					max={120}
					warningThreshold={100}
					dangerThreshold={110}
				/>
			</div>
			
			<div class="demo-card">
				<Gauge 
					value={signalStrength} 
					unit="V" 
					label="信号强度 / Signal Strength"
					min={0}
					max={5}
					warningThreshold={3}
					dangerThreshold={4}
				/>
			</div>
			
			<div class="demo-card">
				<Gauge 
					value={75} 
					unit="°C" 
					label="温度 / Temperature"
					min={0}
					max={100}
					warningThreshold={70}
					dangerThreshold={85}
				/>
			</div>
		</div>
	</div>
	
	<div class="demo-section">
		<h2 class="section-title">ProgressBar Component / 进度条组件</h2>
		<div class="demo-grid">
			<div class="demo-card">
				<ProgressBar 
					progress={progress}
					label="检测进度 / Detection Progress"
					status="进行中 / In Progress"
				/>
			</div>
			
			<div class="demo-card">
				<ProgressBar 
					progress={100}
					label="校准完成 / Calibration Complete"
					status="已完成 / Completed"
					animated={false}
				/>
			</div>
			
			<div class="demo-card">
				<ProgressBar 
					progress={33}
					label="数据上传 / Data Upload"
					status="上传中 / Uploading"
					showPercentage={true}
				/>
			</div>
		</div>
	</div>
	
	<div class="demo-section">
		<h2 class="section-title">StatusIndicator Component / 状态指示器组件</h2>
		<div class="demo-grid">
			<div class="demo-card">
				<StatusIndicator 
					status="running"
					label="设备状态 / Device Status"
					details={statusDetails}
				/>
			</div>
			
			<div class="demo-card">
				<StatusIndicator 
					status="paused"
					label="检测状态 / Testing Status"
					details={[
						{ label: '已暂停 / Paused at', value: '12:34:56' },
						{ label: '样本数 / Samples', value: '1,234' }
					]}
				/>
			</div>
			
			<div class="demo-card">
				<StatusIndicator 
					status="warning"
					label="系统警告 / System Warning"
					details={[
						{ label: '警告类型 / Type', value: '信号异常 / Signal Anomaly' },
						{ label: '时间 / Time', value: '12:35:10' }
					]}
					showWarning={true}
				/>
			</div>
			
			<div class="demo-card">
				<StatusIndicator 
					status="idle"
					label="待机状态 / Idle Status"
					details={[
						{ label: '就绪时间 / Ready since', value: '10:00:00' }
					]}
				/>
			</div>
		</div>
	</div>
	
	<div class="demo-section">
		<h2 class="section-title">Combined Dashboard / 组合仪表盘</h2>
		<div class="dashboard-grid">
			<div class="demo-card">
				<Gauge 
					value={samplingRate} 
					unit="Hz" 
					label="采样率 / Sampling Rate"
					min={0}
					max={120}
				/>
			</div>
			
			<div class="demo-card">
				<Gauge 
					value={signalStrength} 
					unit="V" 
					label="信号幅值 / Signal Amplitude"
					min={0}
					max={5}
				/>
			</div>
			
			<div class="demo-card">
				<ProgressBar 
					progress={progress}
					label="检测进度 / Progress"
					status={`${progress}% 完成 / Complete`}
				/>
			</div>
			
			<div class="demo-card">
				<StatusIndicator 
					status={status}
					label="系统状态 / System Status"
					details={statusDetails}
				/>
			</div>
		</div>
	</div>
	
	<div class="demo-controls">
		<h2 class="section-title">Controls / 控制</h2>
		<div class="control-buttons">
			<button 
				class="btn btn-primary"
				on:click={() => status = 'running'}
			>
				运行 / Running
			</button>
			<button 
				class="btn btn-warning"
				on:click={() => status = 'paused'}
			>
				暂停 / Paused
			</button>
			<button 
				class="btn btn-error"
				on:click={() => status = 'error'}
			>
				错误 / Error
			</button>
			<button 
				class="btn btn-ghost"
				on:click={() => status = 'idle'}
			>
				待机 / Idle
			</button>
		</div>
	</div>
</div>

<style>
	.demo-container {
		width: 100%;
		height: 100%;
		padding: 24px;
		overflow-y: auto;
		background: var(--bg-dark);
	}
	
	.demo-header {
		margin-bottom: 32px;
	}
	
	.demo-section {
		margin-bottom: 40px;
	}
	
	.section-title {
		font-size: 20px;
		font-weight: 600;
		color: var(--primary-orange);
		margin-bottom: 20px;
		padding-bottom: 8px;
		border-bottom: 2px solid var(--bg-light);
	}
	
	.demo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 20px;
	}
	
	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 20px;
	}
	
	.demo-card {
		background: linear-gradient(135deg, var(--bg-medium) 0%, var(--bg-dark) 100%);
		border: 2px solid var(--bg-light);
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		transition: all 0.3s ease;
		min-height: 200px;
		display: flex;
		flex-direction: column;
	}
	
	.demo-card:hover {
		border-color: var(--primary-orange);
		box-shadow: 0 6px 16px rgba(255, 107, 53, 0.3);
		transform: translateY(-2px);
	}
	
	.demo-controls {
		margin-top: 40px;
		padding: 24px;
		background: var(--bg-medium);
		border-radius: 12px;
		border: 2px solid var(--bg-light);
	}
	
	.control-buttons {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}
	
	.btn {
		padding: 10px 20px;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
		font-size: 14px;
	}
	
	.btn-primary {
		background: var(--success);
		color: white;
	}
	
	.btn-primary:hover {
		background: #45a049;
		transform: translateY(-1px);
	}
	
	.btn-warning {
		background: var(--warning);
		color: var(--bg-dark);
	}
	
	.btn-warning:hover {
		background: #ffb300;
		transform: translateY(-1px);
	}
	
	.btn-error {
		background: var(--error);
		color: white;
	}
	
	.btn-error:hover {
		background: #e53935;
		transform: translateY(-1px);
	}
	
	.btn-ghost {
		background: var(--bg-light);
		color: var(--text-primary);
	}
	
	.btn-ghost:hover {
		background: var(--bg-medium);
		transform: translateY(-1px);
	}
	
	/* 响应式设计 / Responsive Design */
	@media (max-width: 768px) {
		.demo-grid,
		.dashboard-grid {
			grid-template-columns: 1fr;
		}
		
		.control-buttons {
			flex-direction: column;
		}
		
		.btn {
			width: 100%;
		}
	}
</style>
