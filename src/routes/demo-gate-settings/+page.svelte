<script lang="ts">
	import GateSettings from '$lib/components/settings/GateSettings.svelte';
	import WaveformWithGates from '$lib/components/waveform/WaveformWithGates.svelte';
	import { testingStore } from '$lib/stores/testing';
	import type { GateConfig } from '$lib/types/signal';
	
	/**
	 * 闸门设置演示页面 / Gate Settings Demo Page
	 * 
	 * 展示闸门设置组件的功能
	 * Demonstrates the Gate Settings component functionality
	 */
	
	let showToast = false;
	let toastMessage = '';
	let toastType: 'success' | 'info' = 'success';
	
	/**
	 * 处理应用事件 / Handle apply event
	 */
	function handleApply(event: CustomEvent<{ gateA: GateConfig; gateB: GateConfig }>) {
		console.log('Gate settings applied:', event.detail);
		showToast = true;
		toastMessage = '闸门设置已应用 / Gate settings applied';
		toastType = 'info';
		
		setTimeout(() => {
			showToast = false;
		}, 3000);
	}
	
	/**
	 * 处理保存事件 / Handle save event
	 */
	function handleSave(event: CustomEvent<{ gateA: GateConfig; gateB: GateConfig }>) {
		console.log('Gate settings saved:', event.detail);
		showToast = true;
		toastMessage = '闸门设置已保存到数据库 / Gate settings saved to database';
		toastType = 'success';
		
		setTimeout(() => {
			showToast = false;
		}, 3000);
	}
	
	// 获取当前闸门配置 / Get current gate configuration
	$: gateA = $testingStore.currentSession?.parameters.gateA || {
		enabled: true,
		start: 0,
		width: 1.0,
		height: 5.0,
		alarmThreshold: 1.5,
		color: '#FFD700'
	};
	
	$: gateB = $testingStore.currentSession?.parameters.gateB || {
		enabled: true,
		start: 1.0,
		width: 1.0,
		height: 5.0,
		alarmThreshold: 2.0,
		color: '#FF69B4'
	};
</script>

<svelte:head>
	<title>闸门设置演示 / Gate Settings Demo</title>
</svelte:head>

<div class="demo-page">
	<div class="demo-header">
		<h1 class="text-3xl font-bold text-primary-orange">闸门设置演示 / Gate Settings Demo</h1>
		<p class="text-text-secondary mt-2">
			配置闸门A和闸门B的参数，实时查看波形图上的变化
			<br />
			Configure Gate A and Gate B parameters and see real-time changes on the waveform
		</p>
	</div>
	
	<div class="demo-content">
		<!-- 闸门设置面板 / Gate Settings Panel -->
		<div class="settings-panel">
			<GateSettings on:apply={handleApply} on:save={handleSave} />
		</div>
		
		<!-- 波形预览 / Waveform Preview -->
		<div class="waveform-preview">
			<h2 class="text-xl font-bold mb-4">波形预览 / Waveform Preview</h2>
			<div class="waveform-container">
				<WaveformWithGates {gateA} {gateB} />
			</div>
			
			<!-- 闸门信息卡片 / Gate Info Cards -->
			<div class="gate-info-cards">
				<div class="info-card" style="border-color: {gateA.color};">
					<h3 class="font-bold" style="color: {gateA.color};">闸门 A</h3>
					<div class="info-grid">
						<div class="info-item">
							<span class="label">状态:</span>
							<span class="value">{gateA.enabled ? '启用' : '禁用'}</span>
						</div>
						<div class="info-item">
							<span class="label">起始:</span>
							<span class="value">{gateA.start.toFixed(2)}s</span>
						</div>
						<div class="info-item">
							<span class="label">宽度:</span>
							<span class="value">{gateA.width.toFixed(2)}s</span>
						</div>
						<div class="info-item">
							<span class="label">高度:</span>
							<span class="value">{gateA.height.toFixed(2)}</span>
						</div>
						<div class="info-item">
							<span class="label">报警:</span>
							<span class="value">{gateA.alarmThreshold.toFixed(2)}</span>
						</div>
					</div>
				</div>
				
				<div class="info-card" style="border-color: {gateB.color};">
					<h3 class="font-bold" style="color: {gateB.color};">闸门 B</h3>
					<div class="info-grid">
						<div class="info-item">
							<span class="label">状态:</span>
							<span class="value">{gateB.enabled ? '启用' : '禁用'}</span>
						</div>
						<div class="info-item">
							<span class="label">起始:</span>
							<span class="value">{gateB.start.toFixed(2)}s</span>
						</div>
						<div class="info-item">
							<span class="label">宽度:</span>
							<span class="value">{gateB.width.toFixed(2)}s</span>
						</div>
						<div class="info-item">
							<span class="label">高度:</span>
							<span class="value">{gateB.height.toFixed(2)}</span>
						</div>
						<div class="info-item">
							<span class="label">报警:</span>
							<span class="value">{gateB.alarmThreshold.toFixed(2)}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	
	<!-- 使用说明 / Usage Instructions -->
	<div class="usage-instructions">
		<h2 class="text-xl font-bold mb-4">使用说明 / Usage Instructions</h2>
		<ul class="instructions-list">
			<li>
				<strong>启用/禁用闸门:</strong> 使用切换开关启用或禁用闸门
				<br />
				<em>Enable/Disable Gate: Use the toggle switch to enable or disable the gate</em>
			</li>
			<li>
				<strong>调整参数:</strong> 修改起始位置、宽度、高度和报警阈值
				<br />
				<em>Adjust Parameters: Modify start position, width, height, and alarm threshold</em>
			</li>
			<li>
				<strong>选择颜色:</strong> 使用颜色选择器或输入十六进制颜色代码
				<br />
				<em>Select Color: Use the color picker or enter a hex color code</em>
			</li>
			<li>
				<strong>应用设置:</strong> 点击"应用"按钮立即应用设置（不保存到数据库）
				<br />
				<em>Apply Settings: Click "Apply" to apply settings immediately (not saved to database)</em>
			</li>
			<li>
				<strong>保存设置:</strong> 点击"保存"按钮保存设置到数据库
				<br />
				<em>Save Settings: Click "Save" to save settings to database</em>
			</li>
			<li>
				<strong>重置:</strong> 点击"重置"按钮恢复默认值
				<br />
				<em>Reset: Click "Reset" to restore default values</em>
			</li>
		</ul>
	</div>
	
	<!-- Toast通知 / Toast Notification -->
	{#if showToast}
		<div class="toast toast-top toast-end">
			<div class="alert" class:alert-success={toastType === 'success'} class:alert-info={toastType === 'info'}>
				<span>{toastMessage}</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.demo-page {
		min-height: 100vh;
		background: var(--bg-dark, #1A1A1A);
		color: var(--text-primary, #FFFFFF);
		padding: 2rem;
	}
	
	.demo-header {
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid var(--primary-orange, #FF6B35);
	}
	
	.demo-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin-bottom: 2rem;
	}
	
	.settings-panel {
		background: var(--bg-medium, #2D2D2D);
		border-radius: 0.5rem;
		padding: 1.5rem;
	}
	
	.waveform-preview {
		background: var(--bg-medium, #2D2D2D);
		border-radius: 0.5rem;
		padding: 1.5rem;
	}
	
	.waveform-container {
		background: var(--bg-dark, #1A1A1A);
		border-radius: 0.5rem;
		padding: 1rem;
		margin-bottom: 1.5rem;
	}
	
	.gate-info-cards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	
	.info-card {
		background: var(--bg-dark, #1A1A1A);
		border: 2px solid;
		border-radius: 0.5rem;
		padding: 1rem;
	}
	
	.info-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
		margin-top: 0.75rem;
	}
	
	.info-item {
		display: flex;
		justify-content: space-between;
		font-size: 0.875rem;
	}
	
	.info-item .label {
		color: var(--text-secondary, #B0B0B0);
	}
	
	.info-item .value {
		font-family: 'Roboto Mono', monospace;
		font-weight: 600;
	}
	
	.usage-instructions {
		background: var(--bg-medium, #2D2D2D);
		border-radius: 0.5rem;
		padding: 1.5rem;
	}
	
	.instructions-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.instructions-list li {
		padding: 1rem;
		background: var(--bg-dark, #1A1A1A);
		border-radius: 0.375rem;
		border-left: 4px solid var(--primary-orange, #FF6B35);
	}
	
	.instructions-list li strong {
		color: var(--primary-orange, #FF6B35);
	}
	
	.instructions-list li em {
		color: var(--text-secondary, #B0B0B0);
		font-size: 0.875rem;
	}
	
	.toast {
		position: fixed;
		z-index: 9999;
	}
	
	.toast-top {
		top: 1rem;
	}
	
	.toast-end {
		right: 1rem;
	}
	
	.alert {
		padding: 1rem 1.5rem;
		border-radius: 0.5rem;
		font-weight: 600;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}
	
	.alert-success {
		background: var(--success, #4CAF50);
		color: white;
	}
	
	.alert-info {
		background: var(--info, #2196F3);
		color: white;
	}
	
	/* 响应式设计 / Responsive Design */
	@media (max-width: 1024px) {
		.demo-content {
			grid-template-columns: 1fr;
		}
		
		.gate-info-cards {
			grid-template-columns: 1fr;
		}
	}
	
	@media (max-width: 768px) {
		.demo-page {
			padding: 1rem;
		}
		
		.info-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
