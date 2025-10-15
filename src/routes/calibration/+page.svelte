<script lang="ts">
	import { goto } from '$app/navigation';
	import CalibrationWizard from '$lib/components/settings/CalibrationWizard.svelte';
	import { supabaseService } from '$lib/services/supabase';
	import type { CalibrationData } from '$lib/types';
	
	let recentCalibrations = $state<CalibrationData[]>([]);
	let loading = $state(true);
	let showHistory = $state(false);
	
	// Load recent calibrations on mount
	$effect(() => {
		loadRecentCalibrations();
	});
	
	async function loadRecentCalibrations() {
		try {
			loading = true;
			const calibrations = await supabaseService.getCalibrations();
			recentCalibrations = calibrations.slice(0, 5); // Show last 5
		} catch (error) {
			console.error('Failed to load calibrations:', error);
		} finally {
			loading = false;
		}
	}
	
	function handleCalibrationComplete(calibrationId: string) {
		console.log('Calibration completed:', calibrationId);
		loadRecentCalibrations();
	}
</script>

<div class="calibration-container">
	<div class="calibration-header">
		<h1 class="text-3xl font-bold" style="color: var(--primary-orange);">
			系统校准 / System Calibration
		</h1>
		<p class="text-sm" style="color: var(--text-secondary);">
			使用标准试块进行仪器校准 / Calibrate Instrument Using Standard Test Block
		</p>
	</div>

	<!-- 校准向导 / Calibration Wizard -->
	<CalibrationWizard onComplete={handleCalibrationComplete} />

	<!-- 最近校准记录 / Recent Calibrations -->
	{#if !loading && recentCalibrations.length > 0}
		<div class="recent-calibrations">
			<div class="section-header">
				<h2 class="section-title">最近校准记录 / Recent Calibrations</h2>
				<button class="btn-link" onclick={() => showHistory = !showHistory}>
					{showHistory ? '隐藏 / Hide' : '显示全部 / Show All'}
				</button>
			</div>
			
			{#if showHistory}
				<div class="calibrations-list">
					{#each recentCalibrations as calibration}
						<div class="calibration-card">
							<div class="card-header">
								<span class="card-title">
									{calibration.standardBlock || '未命名 / Unnamed'}
								</span>
								<span class="card-badge {calibration.isActive ? 'active' : 'inactive'}">
									{calibration.isActive ? '活动 / Active' : '已停用 / Inactive'}
								</span>
							</div>
							<div class="card-body">
								<div class="card-row">
									<span class="card-label">校准类型 / Type:</span>
									<span class="card-value">{calibration.calibrationType}</span>
								</div>
								<div class="card-row">
									<span class="card-label">校准日期 / Date:</span>
									<span class="card-value">{calibration.calibrationDate.toLocaleString()}</span>
								</div>
								{#if calibration.expiryDate}
									<div class="card-row">
										<span class="card-label">有效期至 / Expires:</span>
										<span class="card-value">{calibration.expiryDate.toLocaleDateString()}</span>
									</div>
								{/if}
								{#if calibration.notes}
									<div class="card-row">
										<span class="card-label">备注 / Notes:</span>
										<span class="card-value">{calibration.notes}</span>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.calibration-container {
		width: 100%;
		height: 100%;
		padding: 24px;
		overflow-y: auto;
	}

	.calibration-header {
		margin-bottom: 32px;
	}

	.recent-calibrations {
		max-width: 900px;
		margin: 48px auto 0;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.section-title {
		font-size: 20px;
		font-weight: 600;
		color: var(--text-primary);
	}

	.btn-link {
		background: none;
		border: none;
		color: var(--primary-orange);
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		padding: 8px 16px;
		border-radius: 6px;
		transition: all 0.3s ease;
	}

	.btn-link:hover {
		background: rgba(255, 107, 53, 0.1);
	}

	.calibrations-list {
		display: grid;
		gap: 16px;
	}

	.calibration-card {
		background: var(--bg-medium);
		border: 2px solid var(--bg-light);
		border-radius: 8px;
		padding: 20px;
		transition: all 0.3s ease;
	}

	.calibration-card:hover {
		border-color: var(--primary-orange);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 2px solid var(--bg-light);
	}

	.card-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--text-primary);
	}

	.card-badge {
		padding: 4px 12px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;
	}

	.card-badge.active {
		background: rgba(76, 175, 80, 0.2);
		color: var(--success);
	}

	.card-badge.inactive {
		background: rgba(176, 176, 176, 0.2);
		color: var(--text-secondary);
	}

	.card-body {
		display: grid;
		gap: 12px;
	}

	.card-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.card-label {
		font-size: 13px;
		color: var(--text-secondary);
	}

	.card-value {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-primary);
	}

	@media (max-width: 768px) {
		.calibration-container {
			padding: 16px;
		}

		.section-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 12px;
		}

		.card-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 4px;
		}
	}
</style>
