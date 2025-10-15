<script lang="ts">
	import { ParameterPanel } from '$lib/components/settings';
	import { GateSettings } from '$lib/components/settings';
	import SyncSettings from '$lib/components/settings/SyncSettings.svelte';
	
	let activeTab = $state<'parameters' | 'gates' | 'sync' | 'system'>('parameters');
	let language = $state('zh-CN');
	let theme = $state('dark');
	let autoSave = $state(true);
	let notifications = $state(true);
</script>

<div class="settings-container">
	<div class="settings-header">
		<h1 class="text-3xl font-bold" style="color: var(--primary-orange);">
			系统设置 / System Settings
		</h1>
		<p class="text-sm" style="color: var(--text-secondary);">
			配置系统参数和偏好设置 / Configure System Parameters and Preferences
		</p>
	</div>

	<!-- 标签页导航 / Tab Navigation -->
	<div class="tabs-container">
		<button 
			class="tab-button {activeTab === 'parameters' ? 'active' : ''}"
			onclick={() => activeTab = 'parameters'}
		>
			检测参数 / Detection Parameters
		</button>
		<button 
			class="tab-button {activeTab === 'gates' ? 'active' : ''}"
			onclick={() => activeTab = 'gates'}
		>
			闸门设置 / Gate Settings
		</button>
		<button 
			class="tab-button {activeTab === 'sync' ? 'active' : ''}"
			onclick={() => activeTab = 'sync'}
		>
			数据同步 / Data Sync
		</button>
		<button 
			class="tab-button {activeTab === 'system' ? 'active' : ''}"
			onclick={() => activeTab = 'system'}
		>
			系统配置 / System Config
		</button>
	</div>

	<!-- 标签页内容 / Tab Content -->
	<div class="tab-content">
		{#if activeTab === 'parameters'}
			<div class="settings-section">
				<h2 class="section-title">检测参数设置 / Detection Parameter Settings</h2>
				<ParameterPanel />
			</div>
		{:else if activeTab === 'gates'}
			<div class="settings-section">
				<h2 class="section-title">闸门配置 / Gate Configuration</h2>
				<GateSettings />
			</div>
		{:else if activeTab === 'sync'}
			<div class="settings-section">
				<h2 class="section-title">离线数据同步 / Offline Data Sync</h2>
				<SyncSettings />
			</div>
		{:else if activeTab === 'system'}
			<div class="settings-section">
				<h2 class="section-title">系统配置 / System Configuration</h2>
				
				<div class="config-grid">
					<!-- 语言设置 / Language Settings -->
					<div class="config-item">
						<label class="config-label">
							语言 / Language
						</label>
						<select bind:value={language} class="config-select">
							<option value="zh-CN">中文 / Chinese</option>
							<option value="en-US">English</option>
						</select>
					</div>

					<!-- 主题设置 / Theme Settings -->
					<div class="config-item">
						<label class="config-label">
							主题 / Theme
						</label>
						<select bind:value={theme} class="config-select">
							<option value="dark">深色 / Dark</option>
							<option value="light">浅色 / Light</option>
						</select>
					</div>

					<!-- 自动保存 / Auto Save -->
					<div class="config-item">
						<label class="config-label">
							自动保存 / Auto Save
						</label>
						<input 
							type="checkbox" 
							bind:checked={autoSave}
							class="toggle toggle-primary"
						/>
					</div>

					<!-- 通知 / Notifications -->
					<div class="config-item">
						<label class="config-label">
							通知提醒 / Notifications
						</label>
						<input 
							type="checkbox" 
							bind:checked={notifications}
							class="toggle toggle-primary"
						/>
					</div>
				</div>

				<div class="config-actions">
					<button class="btn-save">
						保存设置 / Save Settings
					</button>
					<button class="btn-reset">
						恢复默认 / Reset to Default
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.settings-container {
		width: 100%;
		height: 100%;
		padding: 24px;
		overflow-y: auto;
	}

	.settings-header {
		margin-bottom: 24px;
	}

	.tabs-container {
		display: flex;
		gap: 8px;
		margin-bottom: 24px;
		border-bottom: 2px solid var(--bg-light);
	}

	.tab-button {
		padding: 12px 24px;
		background: transparent;
		border: none;
		border-bottom: 3px solid transparent;
		color: var(--text-secondary);
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.tab-button:hover {
		color: var(--text-primary);
	}

	.tab-button.active {
		color: var(--primary-orange);
		border-bottom-color: var(--primary-orange);
	}

	.tab-content {
		background: var(--bg-medium);
		border: 2px solid var(--bg-light);
		border-radius: 12px;
		padding: 24px;
	}

	.settings-section {
		max-width: 800px;
	}

	.section-title {
		font-size: 20px;
		font-weight: 600;
		color: var(--primary-orange);
		margin-bottom: 24px;
	}

	.config-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 24px;
		margin-bottom: 32px;
	}

	.config-item {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.config-label {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-primary);
	}

	.config-select {
		padding: 10px 16px;
		background: var(--bg-dark);
		border: 2px solid var(--bg-light);
		border-radius: 8px;
		color: var(--text-primary);
		font-size: 14px;
		cursor: pointer;
	}

	.config-select:focus {
		outline: none;
		border-color: var(--primary-orange);
	}

	.config-actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
	}

	.btn-save, .btn-reset {
		padding: 12px 32px;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-save {
		background: var(--primary-orange);
		color: white;
	}

	.btn-save:hover {
		background: var(--primary-orange-dark);
	}

	.btn-reset {
		background: var(--bg-dark);
		color: var(--text-primary);
		border: 2px solid var(--bg-light);
	}

	.btn-reset:hover {
		border-color: var(--primary-orange);
	}

	@media (max-width: 768px) {
		.tabs-container {
			flex-direction: column;
			border-bottom: none;
		}

		.tab-button {
			border-bottom: none;
			border-left: 3px solid transparent;
		}

		.tab-button.active {
			border-left-color: var(--primary-orange);
		}

		.config-grid {
			grid-template-columns: 1fr;
		}

		.config-actions {
			flex-direction: column;
		}
	}
</style>
