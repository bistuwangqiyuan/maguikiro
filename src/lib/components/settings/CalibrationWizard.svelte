<script lang="ts">
	/**
	 * 校准向导组件 / Calibration Wizard Component
	 * 
	 * 引导用户完成仪器校准流程
	 * Guides users through the instrument calibration process
	 */
	
	import { onMount } from 'svelte';
	import { supabaseService } from '$lib/services/supabase';
	import { authStore } from '$lib/stores/auth';
	import type { CalibrationData, CalibrationCoefficients } from '$lib/types';
	
	// Props
	interface Props {
		onComplete?: (calibrationId: string) => void;
		onCancel?: () => void;
	}
	
	let { onComplete, onCancel }: Props = $props();
	
	// State
	let currentStep = $state(1);
	let calibrationStatus = $state<'idle' | 'in-progress' | 'completed' | 'failed'>('idle');
	let referenceSignal = $state<number[]>([]);
	let calibrationCoefficients = $state<CalibrationCoefficients>({
		gainCorrection: 1.0,
		phaseCorrection: 0.0,
		offsetCorrection: 0.0
	});
	let standardBlock = $state('');
	let operator = $state('');
	let notes = $state('');
	let errorMessage = $state('');
	let deviation = $state(0);
	
	// Constants
	const MAX_DEVIATION = 0.05; // 5% maximum allowed deviation
	
	onMount(() => {
		// Pre-fill operator name from auth store
		const unsubscribe = authStore.subscribe(auth => {
			if (auth.profile?.fullName) {
				operator = auth.profile.fullName;
			} else if (auth.profile?.username) {
				operator = auth.profile.username;
			}
		});
		
		return unsubscribe;
	});
	
	/**
	 * 开始校准流程 / Start calibration process
	 */
	function startCalibration() {
		if (!standardBlock || !operator) {
			errorMessage = '请填写标准试块和操作员信息 / Please fill in standard block and operator information';
			return;
		}
		errorMessage = '';
		currentStep = 2;
		calibrationStatus = 'in-progress';
	}
	
	/**
	 * 采集参考信号 / Capture reference signal
	 */
	async function captureReferenceSignal() {
		calibrationStatus = 'in-progress';
		errorMessage = '';
		
		try {
			// Simulate signal capture (2 seconds)
			await new Promise(resolve => setTimeout(resolve, 2000));
			
			// Generate mock reference signal with known characteristics
			// In production, this would come from actual hardware
			const signalLength = 1000;
			const frequency = 100; // Hz
			const amplitude = 1.0;
			const noise = 0.05;
			
			referenceSignal = Array.from({ length: signalLength }, (_, i) => {
				const t = i / signalLength;
				const signal = amplitude * Math.sin(2 * Math.PI * frequency * t);
				const randomNoise = (Math.random() - 0.5) * noise;
				return signal + randomNoise;
			});
			
			currentStep = 3;
		} catch (error) {
			calibrationStatus = 'failed';
			errorMessage = error instanceof Error ? error.message : '信号采集失败 / Signal capture failed';
		}
	}
	
	/**
	 * 计算校准系数 / Calculate calibration coefficients
	 */
	async function calculateCoefficients() {
		calibrationStatus = 'in-progress';
		errorMessage = '';
		
		try {
			// Simulate calculation (1.5 seconds)
			await new Promise(resolve => setTimeout(resolve, 1500));
			
			// Calculate signal statistics
			const avgAmplitude = referenceSignal.reduce((sum, val) => sum + Math.abs(val), 0) / referenceSignal.length;
			const maxAmplitude = Math.max(...referenceSignal.map(Math.abs));
			const minAmplitude = Math.min(...referenceSignal.map(Math.abs));
			
			// Calculate offset (DC component)
			const offset = referenceSignal.reduce((sum, val) => sum + val, 0) / referenceSignal.length;
			
			// Calculate phase shift (simplified)
			const expectedFirstPeak = Math.PI / 2;
			const actualFirstPeak = referenceSignal.findIndex((val, i, arr) => 
				i > 0 && i < arr.length - 1 && val > arr[i-1] && val > arr[i+1]
			) / referenceSignal.length * 2 * Math.PI;
			const phaseShift = actualFirstPeak - expectedFirstPeak;
			
			// Calculate calibration coefficients
			const expectedAmplitude = 1.0;
			calibrationCoefficients = {
				gainCorrection: expectedAmplitude / avgAmplitude,
				phaseCorrection: -phaseShift,
				offsetCorrection: -offset,
				temperatureCoefficient: 0.001 // Default temperature coefficient
			};
			
			// Calculate deviation from expected values
			deviation = Math.abs(avgAmplitude - expectedAmplitude) / expectedAmplitude;
			
			// Check if deviation is within acceptable range
			if (deviation > MAX_DEVIATION) {
				calibrationStatus = 'failed';
				errorMessage = `校准偏差过大 (${(deviation * 100).toFixed(2)}%)，请重新校准 / Calibration deviation too large (${(deviation * 100).toFixed(2)}%), please recalibrate`;
				return;
			}
			
			currentStep = 4;
			calibrationStatus = 'completed';
		} catch (error) {
			calibrationStatus = 'failed';
			errorMessage = error instanceof Error ? error.message : '系数计算失败 / Coefficient calculation failed';
		}
	}
	
	/**
	 * 保存校准数据到数据库 / Save calibration data to database
	 */
	async function saveCalibration() {
		calibrationStatus = 'in-progress';
		errorMessage = '';
		
		try {
			const auth = authStore;
			let userId: string | undefined;
			
			// Get user ID from auth store
			const unsubscribe = auth.subscribe(state => {
				userId = state.user?.id;
			});
			unsubscribe();
			
			if (!userId) {
				throw new Error('用户未登录 / User not logged in');
			}
			
			// Prepare calibration data
			const calibrationData: Omit<CalibrationData, 'id' | 'createdAt'> = {
				operatorId: userId,
				calibrationType: 'standard_block',
				referenceSignal: {
					data: referenceSignal,
					length: referenceSignal.length,
					avgAmplitude: referenceSignal.reduce((sum, val) => sum + Math.abs(val), 0) / referenceSignal.length,
					maxAmplitude: Math.max(...referenceSignal.map(Math.abs))
				},
				coefficients: calibrationCoefficients,
				standardBlock,
				calibrationDate: new Date(),
				expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
				isActive: true,
				notes: notes || undefined
			};
			
			// Save to database
			const calibrationId = await supabaseService.saveCalibration(calibrationData);
			
			// Call completion callback
			if (onComplete) {
				onComplete(calibrationId);
			}
			
			// Show success message
			alert('校准数据已保存 / Calibration data saved successfully');
			
			// Reset wizard
			resetCalibration();
		} catch (error) {
			calibrationStatus = 'failed';
			errorMessage = error instanceof Error ? error.message : '保存失败 / Save failed';
		}
	}
	
	/**
	 * 重置校准向导 / Reset calibration wizard
	 */
	function resetCalibration() {
		currentStep = 1;
		calibrationStatus = 'idle';
		referenceSignal = [];
		calibrationCoefficients = {
			gainCorrection: 1.0,
			phaseCorrection: 0.0,
			offsetCorrection: 0.0
		};
		standardBlock = '';
		notes = '';
		errorMessage = '';
		deviation = 0;
	}
	
	/**
	 * 取消校准 / Cancel calibration
	 */
	function handleCancel() {
		if (onCancel) {
			onCancel();
		}
		resetCalibration();
	}
</script>

<div class="wizard-container">
	<!-- 步骤指示器 / Step Indicator -->
	<div class="steps-indicator">
		<div class="step {currentStep >= 1 ? 'active' : ''} {currentStep > 1 ? 'completed' : ''}">
			<div class="step-number">1</div>
			<div class="step-label">准备 / Prepare</div>
		</div>
		<div class="step-line {currentStep > 1 ? 'completed' : ''}"></div>
		<div class="step {currentStep >= 2 ? 'active' : ''} {currentStep > 2 ? 'completed' : ''}">
			<div class="step-number">2</div>
			<div class="step-label">采集 / Capture</div>
		</div>
		<div class="step-line {currentStep > 2 ? 'completed' : ''}"></div>
		<div class="step {currentStep >= 3 ? 'active' : ''} {currentStep > 3 ? 'completed' : ''}">
			<div class="step-number">3</div>
			<div class="step-label">计算 / Calculate</div>
		</div>
		<div class="step-line {currentStep > 3 ? 'completed' : ''}"></div>
		<div class="step {currentStep >= 4 ? 'active' : ''}">
			<div class="step-number">4</div>
			<div class="step-label">完成 / Complete</div>
		</div>
	</div>

	<!-- 错误消息 / Error Message -->
	{#if errorMessage}
		<div class="error-banner">
			<span class="error-icon">⚠</span>
			<span class="error-text">{errorMessage}</span>
		</div>
	{/if}

	<!-- 步骤内容 / Step Content -->
	<div class="step-content">
		{#if currentStep === 1}
			<div class="step-panel">
				<h2 class="step-title">步骤 1: 准备标准试块 / Step 1: Prepare Standard Test Block</h2>
				<p class="step-description">
					请放置标准试块并填写以下信息。确保试块清洁且正确放置。
					<br />
					Please place the standard test block and fill in the following information. Ensure the block is clean and properly positioned.
				</p>
				
				<div class="form-grid">
					<div class="form-item">
						<label class="form-label">标准试块编号 / Standard Block ID *</label>
						<input 
							type="text" 
							bind:value={standardBlock}
							placeholder="例如: STD-001"
							class="form-input"
						/>
					</div>
					
					<div class="form-item">
						<label class="form-label">操作员 / Operator *</label>
						<input 
							type="text" 
							bind:value={operator}
							placeholder="操作员姓名 / Operator Name"
							class="form-input"
						/>
					</div>
					
					<div class="form-item">
						<label class="form-label">备注 / Notes (可选 / Optional)</label>
						<textarea 
							bind:value={notes}
							placeholder="添加任何相关备注 / Add any relevant notes"
							class="form-textarea"
							rows="3"
						></textarea>
					</div>
				</div>
				
				<div class="step-actions">
					{#if onCancel}
						<button class="btn-secondary" onclick={handleCancel}>
							取消 / Cancel
						</button>
					{/if}
					<button class="btn-primary" onclick={startCalibration}>
						开始校准 / Start Calibration
					</button>
				</div>
			</div>
		{:else if currentStep === 2}
			<div class="step-panel">
				<h2 class="step-title">步骤 2: 采集参考信号 / Step 2: Capture Reference Signal</h2>
				<p class="step-description">
					点击下方按钮开始采集标准试块的参考信号。请保持试块稳定。
					<br />
					Click the button below to start capturing the reference signal from the standard block. Keep the block stable.
				</p>
				
				{#if calibrationStatus === 'in-progress' && referenceSignal.length === 0}
					<div class="progress-indicator">
						<span class="loading loading-spinner loading-lg text-primary"></span>
						<p>正在采集信号... / Capturing signal...</p>
					</div>
				{:else if referenceSignal.length > 0}
					<div class="signal-preview">
						<p class="text-success">✓ 信号采集完成 / Signal captured successfully</p>
						<p class="text-sm">采集了 {referenceSignal.length} 个数据点 / Captured {referenceSignal.length} data points</p>
						<div class="signal-stats">
							<div class="stat-item">
								<span class="stat-label">平均幅值 / Avg Amplitude:</span>
								<span class="stat-value">{(referenceSignal.reduce((sum, val) => sum + Math.abs(val), 0) / referenceSignal.length).toFixed(4)}</span>
							</div>
							<div class="stat-item">
								<span class="stat-label">最大幅值 / Max Amplitude:</span>
								<span class="stat-value">{Math.max(...referenceSignal.map(Math.abs)).toFixed(4)}</span>
							</div>
						</div>
					</div>
				{/if}
				
				<div class="step-actions">
					<button class="btn-secondary" onclick={() => currentStep = 1}>
						返回 / Back
					</button>
					{#if referenceSignal.length === 0}
						<button class="btn-primary" onclick={captureReferenceSignal}>
							采集信号 / Capture Signal
						</button>
					{:else}
						<button class="btn-primary" onclick={() => currentStep = 3}>
							下一步 / Next
						</button>
					{/if}
				</div>
			</div>
		{:else if currentStep === 3}
			<div class="step-panel">
				<h2 class="step-title">步骤 3: 计算校准系数 / Step 3: Calculate Calibration Coefficients</h2>
				<p class="step-description">
					系统将根据参考信号计算校准系数。
					<br />
					The system will calculate calibration coefficients based on the reference signal.
				</p>
				
				{#if calibrationStatus === 'in-progress' && calibrationCoefficients.gainCorrection === 1.0}
					<div class="progress-indicator">
						<span class="loading loading-spinner loading-lg text-primary"></span>
						<p>正在计算... / Calculating...</p>
					</div>
				{:else if calibrationStatus === 'failed'}
					<div class="result-display error">
						<p class="text-error">✗ 校准失败 / Calibration Failed</p>
						<p class="deviation-warning">偏差: {(deviation * 100).toFixed(2)}% (最大允许: {(MAX_DEVIATION * 100).toFixed(2)}%)</p>
						<p class="text-sm">请检查标准试块并重新开始 / Please check the standard block and restart</p>
					</div>
				{:else if calibrationCoefficients.gainCorrection !== 1.0}
					<div class="result-display">
						<p class="text-success">✓ 计算完成 / Calculation completed</p>
						<div class="coefficients-display">
							<div class="coefficient-item">
								<span class="coefficient-label">增益校正 / Gain Correction:</span>
								<span class="coefficient-value">{calibrationCoefficients.gainCorrection.toFixed(4)}</span>
							</div>
							<div class="coefficient-item">
								<span class="coefficient-label">相位校正 / Phase Correction:</span>
								<span class="coefficient-value">{calibrationCoefficients.phaseCorrection.toFixed(4)} rad</span>
							</div>
							<div class="coefficient-item">
								<span class="coefficient-label">偏移校正 / Offset Correction:</span>
								<span class="coefficient-value">{calibrationCoefficients.offsetCorrection.toFixed(4)}</span>
							</div>
						</div>
						<div class="deviation-info">
							<span class="deviation-label">偏差 / Deviation:</span>
							<span class="deviation-value {deviation < MAX_DEVIATION ? 'good' : 'bad'}">
								{(deviation * 100).toFixed(2)}%
							</span>
						</div>
					</div>
				{/if}
				
				<div class="step-actions">
					<button class="btn-secondary" onclick={() => currentStep = 2}>
						返回 / Back
					</button>
					{#if calibrationStatus === 'failed'}
						<button class="btn-primary" onclick={resetCalibration}>
							重新开始 / Restart
						</button>
					{:else if calibrationCoefficients.gainCorrection === 1.0}
						<button class="btn-primary" onclick={calculateCoefficients}>
							开始计算 / Start Calculation
						</button>
					{:else}
						<button class="btn-primary" onclick={() => currentStep = 4}>
							下一步 / Next
						</button>
					{/if}
				</div>
			</div>
		{:else if currentStep === 4}
			<div class="step-panel">
				<h2 class="step-title">步骤 4: 校准完成 / Step 4: Calibration Complete</h2>
				<p class="step-description">
					校准已成功完成。请查看校准结果并保存。
					<br />
					Calibration completed successfully. Please review the results and save.
				</p>
				
				<div class="result-summary">
					<div class="summary-item">
						<span class="summary-label">标准试块 / Standard Block:</span>
						<span class="summary-value">{standardBlock}</span>
					</div>
					<div class="summary-item">
						<span class="summary-label">操作员 / Operator:</span>
						<span class="summary-value">{operator}</span>
					</div>
					<div class="summary-item">
						<span class="summary-label">增益校正 / Gain Correction:</span>
						<span class="summary-value">{calibrationCoefficients.gainCorrection.toFixed(4)}</span>
					</div>
					<div class="summary-item">
						<span class="summary-label">相位校正 / Phase Correction:</span>
						<span class="summary-value">{calibrationCoefficients.phaseCorrection.toFixed(4)} rad</span>
					</div>
					<div class="summary-item">
						<span class="summary-label">偏移校正 / Offset Correction:</span>
						<span class="summary-value">{calibrationCoefficients.offsetCorrection.toFixed(4)}</span>
					</div>
					<div class="summary-item">
						<span class="summary-label">偏差 / Deviation:</span>
						<span class="summary-value {deviation < MAX_DEVIATION ? 'good' : 'bad'}">
							{(deviation * 100).toFixed(2)}%
						</span>
					</div>
					<div class="summary-item">
						<span class="summary-label">校准时间 / Time:</span>
						<span class="summary-value">{new Date().toLocaleString()}</span>
					</div>
					{#if notes}
						<div class="summary-item">
							<span class="summary-label">备注 / Notes:</span>
							<span class="summary-value">{notes}</span>
						</div>
					{/if}
				</div>
				
				<div class="step-actions">
					<button class="btn-secondary" onclick={resetCalibration}>
						重新校准 / Recalibrate
					</button>
					<button class="btn-primary" onclick={saveCalibration} disabled={calibrationStatus === 'in-progress'}>
						{calibrationStatus === 'in-progress' ? '保存中... / Saving...' : '保存校准 / Save Calibration'}
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.wizard-container {
		max-width: 900px;
		margin: 0 auto;
	}

	.steps-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 32px;
	}

	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.step-number {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--bg-medium);
		border: 3px solid var(--bg-light);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		font-weight: bold;
		color: var(--text-secondary);
		transition: all 0.3s ease;
	}

	.step.active .step-number {
		background: var(--primary-orange);
		border-color: var(--primary-orange);
		color: white;
	}

	.step.completed .step-number {
		background: var(--success);
		border-color: var(--success);
		color: white;
	}

	.step-label {
		font-size: 13px;
		color: var(--text-secondary);
		text-align: center;
	}

	.step.active .step-label {
		color: var(--primary-orange);
		font-weight: 600;
	}

	.step-line {
		width: 80px;
		height: 3px;
		background: var(--bg-light);
		transition: all 0.3s ease;
	}

	.step-line.completed {
		background: var(--success);
	}

	.error-banner {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		background: rgba(244, 67, 54, 0.1);
		border: 2px solid var(--error);
		border-radius: 8px;
		margin-bottom: 24px;
	}

	.error-icon {
		font-size: 24px;
		color: var(--error);
	}

	.error-text {
		flex: 1;
		color: var(--error);
		font-size: 14px;
	}

	.step-content {
		background: var(--bg-medium);
		border: 2px solid var(--bg-light);
		border-radius: 12px;
		padding: 32px;
	}

	.step-panel {
		max-width: 600px;
		margin: 0 auto;
	}

	.step-title {
		font-size: 24px;
		font-weight: 600;
		color: var(--primary-orange);
		margin-bottom: 16px;
	}

	.step-description {
		font-size: 14px;
		color: var(--text-secondary);
		line-height: 1.6;
		margin-bottom: 32px;
	}

	.form-grid {
		display: grid;
		gap: 20px;
		margin-bottom: 32px;
	}

	.form-item {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-label {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-primary);
	}

	.form-input, .form-textarea {
		padding: 12px 16px;
		background: var(--bg-dark);
		border: 2px solid var(--bg-light);
		border-radius: 8px;
		color: var(--text-primary);
		font-size: 14px;
		font-family: inherit;
	}

	.form-input:focus, .form-textarea:focus {
		outline: none;
		border-color: var(--primary-orange);
	}

	.form-textarea {
		resize: vertical;
	}

	.step-actions {
		display: flex;
		gap: 12px;
		justify-content: center;
	}

	.btn-primary, .btn-secondary {
		padding: 12px 32px;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-primary {
		background: var(--primary-orange);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--primary-orange-dark);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: var(--bg-dark);
		color: var(--text-primary);
		border: 2px solid var(--bg-light);
	}

	.btn-secondary:hover {
		border-color: var(--primary-orange);
	}

	.progress-indicator {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding: 40px 20px;
	}

	.signal-preview, .result-display {
		text-align: center;
		padding: 24px;
		background: var(--bg-dark);
		border-radius: 8px;
		margin-bottom: 24px;
	}

	.result-display.error {
		border: 2px solid var(--error);
	}

	.signal-stats {
		display: grid;
		gap: 12px;
		margin-top: 16px;
	}

	.stat-item, .coefficient-item {
		display: flex;
		justify-content: space-between;
		padding: 8px 0;
		border-bottom: 1px solid var(--bg-light);
	}

	.stat-label, .coefficient-label {
		font-size: 13px;
		color: var(--text-secondary);
	}

	.stat-value, .coefficient-value {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-primary);
		font-family: 'Roboto Mono', monospace;
	}

	.coefficients-display {
		display: grid;
		gap: 8px;
		margin-top: 16px;
	}

	.deviation-info {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 12px;
		margin-top: 20px;
		padding-top: 20px;
		border-top: 2px solid var(--bg-light);
	}

	.deviation-label {
		font-size: 14px;
		color: var(--text-secondary);
	}

	.deviation-value {
		font-size: 20px;
		font-weight: bold;
		font-family: 'Roboto Mono', monospace;
	}

	.deviation-value.good {
		color: var(--success);
	}

	.deviation-value.bad {
		color: var(--error);
	}

	.deviation-warning {
		color: var(--error);
		font-size: 14px;
		margin-top: 8px;
	}

	.result-summary {
		display: grid;
		gap: 16px;
		padding: 24px;
		background: var(--bg-dark);
		border-radius: 8px;
		margin-bottom: 24px;
	}

	.summary-item {
		display: flex;
		justify-content: space-between;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--bg-light);
	}

	.summary-item:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.summary-label {
		font-size: 14px;
		color: var(--text-secondary);
	}

	.summary-value {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-primary);
	}

	.summary-value.good {
		color: var(--success);
	}

	.summary-value.bad {
		color: var(--error);
	}

	.text-success {
		color: var(--success);
		font-weight: 600;
	}

	.text-error {
		color: var(--error);
		font-weight: 600;
	}

	.text-sm {
		font-size: 13px;
		color: var(--text-secondary);
		margin-top: 8px;
	}

	@media (max-width: 768px) {
		.steps-indicator {
			flex-direction: column;
		}

		.step-line {
			width: 3px;
			height: 40px;
		}

		.step-content {
			padding: 20px;
		}

		.step-actions {
			flex-direction: column;
		}

		.btn-primary, .btn-secondary {
			width: 100%;
		}
	}
</style>
