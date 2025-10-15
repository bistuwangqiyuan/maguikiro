<script lang="ts">
	import { testingStore } from '$lib/stores/testing';
	import type { TestingParameters, FilterType } from '$lib/types/signal';
	import { validateGain, validateRange } from '$lib/utils/validators';
	import { MAX_GAIN_DB, MIN_GAIN_DB, FILTER_TYPES } from '$lib/utils/constants';
	import {
		getAllPresets,
		getPresetParameters,
		matchPreset,
		type StandardPreset
	} from '$lib/utils/standard-presets';

	// Props
	export let disabled = false;

	// Local state for parameters
	let parameters: TestingParameters = $testingStore.currentSession?.parameters || {
		gain: 40,
		filter: 'bandpass',
		velocity: 1.0,
		gateA: {
			enabled: true,
			start: 0,
			width: 1.0,
			height: 5.0,
			alarmThreshold: 1.5,
			color: '#FFD700'
		},
		gateB: {
			enabled: true,
			start: 1.0,
			width: 1.0,
			height: 5.0,
			alarmThreshold: 2.0,
			color: '#FF69B4'
		},
		threshold: 1.0
	};

	// Standard presets
	let presets: StandardPreset[] = getAllPresets();
	let selectedStandard: string = 'CUSTOM';

	// Validation errors
	let errors: Record<string, string> = {};

	// Reactive: Update local parameters when session changes
	$: if ($testingStore.currentSession) {
		parameters = { ...$testingStore.currentSession.parameters };
		selectedStandard = matchPreset(parameters);
	}

	// Validate gain
	function validateGainValue(value: number): boolean {
		if (!validateGain(value)) {
			errors.gain = `增益必须在 ${MIN_GAIN_DB}-${MAX_GAIN_DB} dB 之间`;
			return false;
		}
		delete errors.gain;
		return true;
	}

	// Validate velocity
	function validateVelocityValue(value: number): boolean {
		if (!validateRange(value, 0.1, 10)) {
			errors.velocity = '速度必须在 0.1-10 m/s 之间';
			return false;
		}
		delete errors.velocity;
		return true;
	}

	// Validate threshold
	function validateThresholdValue(value: number): boolean {
		if (!validateRange(value, 0.1, 10)) {
			errors.threshold = '阈值必须在 0.1-10 之间';
			return false;
		}
		delete errors.threshold;
		return true;
	}

	// Handle standard selection change
	function handleStandardChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const standardId = target.value;
		selectedStandard = standardId;

		if (standardId !== 'CUSTOM') {
			const presetParams = getPresetParameters(standardId);
			if (presetParams) {
				parameters = { ...presetParams };
				applyParameters();
			}
		}
	}

	// Handle gain change
	function handleGainChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = parseFloat(target.value);
		if (validateGainValue(value)) {
			parameters.gain = value;
			selectedStandard = matchPreset(parameters);
			applyParameters();
		}
	}

	// Handle filter change
	function handleFilterChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		parameters.filter = target.value as FilterType;
		selectedStandard = matchPreset(parameters);
		applyParameters();
	}

	// Handle velocity change
	function handleVelocityChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = parseFloat(target.value);
		if (validateVelocityValue(value)) {
			parameters.velocity = value;
			selectedStandard = matchPreset(parameters);
			applyParameters();
		}
	}

	// Handle threshold change
	function handleThresholdChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = parseFloat(target.value);
		if (validateThresholdValue(value)) {
			parameters.threshold = value;
			selectedStandard = matchPreset(parameters);
			applyParameters();
		}
	}

	// Apply parameters to store
	async function applyParameters() {
		if (Object.keys(errors).length === 0) {
			await testingStore.updateParameters(parameters);
		}
	}

	// Save parameters to database
	async function saveParameters() {
		// Validate all parameters
		const gainValid = validateGainValue(parameters.gain);
		const velocityValid = validateVelocityValue(parameters.velocity);
		const thresholdValid = validateThresholdValue(parameters.threshold);

		if (gainValid && velocityValid && thresholdValid) {
			await testingStore.updateParameters(parameters);
		}
	}
</script>

<div class="parameter-panel">
	<div class="panel-header">
		<h3 class="panel-title">检测参数设置</h3>
		<p class="panel-subtitle">Parameter Settings</p>
	</div>

	<div class="panel-content">
		<!-- Standard Selection -->
		<div class="parameter-group standard-group">
			<label for="standard" class="parameter-label">
				<span class="label-text">检测标准 (Standard)</span>
			</label>
			<select
				id="standard"
				value={selectedStandard}
				on:change={handleStandardChange}
				{disabled}
				class="parameter-select standard-select"
			>
				{#each presets as preset}
					<option value={preset.id}>
						{preset.name} / {preset.nameEn}
					</option>
				{/each}
			</select>
			{#if selectedStandard !== 'CUSTOM'}
				{@const currentPreset = presets.find((p) => p.id === selectedStandard)}
				{#if currentPreset}
					<div class="standard-info">
						<p class="standard-description">{currentPreset.description}</p>
						{#if currentPreset.referenceUrl}
							<a
								href={currentPreset.referenceUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="standard-link"
							>
								查看标准文档 (View Standard Documentation) →
							</a>
						{/if}
					</div>
				{/if}
			{/if}
		</div>

		<!-- Gain Control -->
		<div class="parameter-group">
			<label for="gain" class="parameter-label">
				<span class="label-text">增益 (Gain)</span>
				<span class="label-value">{parameters.gain.toFixed(1)} dB</span>
			</label>
			<input
				id="gain"
				type="range"
				min={MIN_GAIN_DB}
				max={MAX_GAIN_DB}
				step="0.1"
				value={parameters.gain}
				on:input={handleGainChange}
				{disabled}
				class="parameter-slider"
			/>
			{#if errors.gain}
				<span class="error-message">{errors.gain}</span>
			{/if}
		</div>

		<!-- Filter Selection -->
		<div class="parameter-group">
			<label for="filter" class="parameter-label">
				<span class="label-text">滤波器 (Filter)</span>
			</label>
			<select
				id="filter"
				value={parameters.filter}
				on:change={handleFilterChange}
				{disabled}
				class="parameter-select"
			>
				<option value={FILTER_TYPES.NONE}>无滤波 (None)</option>
				<option value={FILTER_TYPES.LOWPASS}>低通 (Low Pass)</option>
				<option value={FILTER_TYPES.HIGHPASS}>高通 (High Pass)</option>
				<option value={FILTER_TYPES.BANDPASS}>带通 (Band Pass)</option>
			</select>
		</div>

		<!-- Velocity Input -->
		<div class="parameter-group">
			<label for="velocity" class="parameter-label">
				<span class="label-text">速度 (Velocity)</span>
				<span class="label-value">{parameters.velocity.toFixed(2)} m/s</span>
			</label>
			<input
				id="velocity"
				type="number"
				min="0.1"
				max="10"
				step="0.1"
				value={parameters.velocity}
				on:change={handleVelocityChange}
				{disabled}
				class="parameter-input"
			/>
			{#if errors.velocity}
				<span class="error-message">{errors.velocity}</span>
			{/if}
		</div>

		<!-- Threshold Slider -->
		<div class="parameter-group">
			<label for="threshold" class="parameter-label">
				<span class="label-text">阈值 (Threshold)</span>
				<span class="label-value">{parameters.threshold.toFixed(2)}</span>
			</label>
			<input
				id="threshold"
				type="range"
				min="0.1"
				max="10"
				step="0.1"
				value={parameters.threshold}
				on:input={handleThresholdChange}
				{disabled}
				class="parameter-slider"
			/>
			{#if errors.threshold}
				<span class="error-message">{errors.threshold}</span>
			{/if}
		</div>

		<!-- Save Button -->
		<div class="parameter-actions">
			<button
				type="button"
				on:click={saveParameters}
				disabled={disabled || Object.keys(errors).length > 0}
				class="btn-save"
			>
				保存参数 (Save)
			</button>
		</div>
	</div>
</div>

<style>
	.parameter-panel {
		background: var(--bg-medium, #2d2d2d);
		border: 2px solid var(--primary-orange, #ff6b35);
		border-radius: 8px;
		padding: 1rem;
		color: var(--text-primary, #ffffff);
		font-family: 'Roboto', sans-serif;
	}

	.panel-header {
		border-bottom: 1px solid var(--bg-light, #3d3d3d);
		padding-bottom: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.panel-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.25rem 0;
		color: var(--primary-orange, #ff6b35);
	}

	.panel-subtitle {
		font-size: 0.875rem;
		margin: 0;
		color: var(--text-secondary, #b0b0b0);
	}

	.panel-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.parameter-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.standard-group {
		background: var(--bg-dark, #1a1a1a);
		padding: 1rem;
		border-radius: 6px;
		border: 1px solid var(--primary-orange, #ff6b35);
	}

	.standard-select {
		font-weight: 600;
		background: var(--bg-medium, #2d2d2d);
	}

	.standard-info {
		margin-top: 0.75rem;
		padding: 0.75rem;
		background: rgba(255, 107, 53, 0.1);
		border-left: 3px solid var(--primary-orange, #ff6b35);
		border-radius: 4px;
	}

	.standard-description {
		margin: 0 0 0.5rem 0;
		font-size: 0.875rem;
		color: var(--text-secondary, #b0b0b0);
		line-height: 1.5;
	}

	.standard-link {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--primary-orange, #ff6b35);
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		transition: color 0.2s;
	}

	.standard-link:hover {
		color: var(--primary-orange-light, #ff8555);
		text-decoration: underline;
	}

	.parameter-label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.95rem;
		font-weight: 500;
	}

	.label-text {
		color: var(--text-primary, #ffffff);
	}

	.label-value {
		color: var(--primary-orange, #ff6b35);
		font-family: 'Roboto Mono', monospace;
		font-weight: 600;
	}

	.parameter-slider {
		width: 100%;
		height: 8px;
		border-radius: 4px;
		background: var(--bg-light, #3d3d3d);
		outline: none;
		-webkit-appearance: none;
		appearance: none;
	}

	.parameter-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--primary-orange, #ff6b35);
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.parameter-slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--primary-orange, #ff6b35);
		cursor: pointer;
		border: none;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.parameter-slider:disabled::-webkit-slider-thumb {
		background: var(--text-disabled, #666666);
		cursor: not-allowed;
	}

	.parameter-slider:disabled::-moz-range-thumb {
		background: var(--text-disabled, #666666);
		cursor: not-allowed;
	}

	.parameter-select {
		width: 100%;
		padding: 0.75rem;
		background: var(--bg-dark, #1a1a1a);
		border: 1px solid var(--bg-light, #3d3d3d);
		border-radius: 4px;
		color: var(--text-primary, #ffffff);
		font-size: 0.95rem;
		cursor: pointer;
		transition: border-color 0.2s;
	}

	.parameter-select:hover:not(:disabled) {
		border-color: var(--primary-orange, #ff6b35);
	}

	.parameter-select:focus {
		outline: none;
		border-color: var(--primary-orange, #ff6b35);
		box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.2);
	}

	.parameter-select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.parameter-input {
		width: 100%;
		padding: 0.75rem;
		background: var(--bg-dark, #1a1a1a);
		border: 1px solid var(--bg-light, #3d3d3d);
		border-radius: 4px;
		color: var(--text-primary, #ffffff);
		font-size: 0.95rem;
		font-family: 'Roboto Mono', monospace;
		transition: border-color 0.2s;
	}

	.parameter-input:hover:not(:disabled) {
		border-color: var(--primary-orange, #ff6b35);
	}

	.parameter-input:focus {
		outline: none;
		border-color: var(--primary-orange, #ff6b35);
		box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.2);
	}

	.parameter-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.error-message {
		color: var(--error, #f44336);
		font-size: 0.875rem;
		margin-top: -0.25rem;
	}

	.parameter-actions {
		display: flex;
		justify-content: flex-end;
		padding-top: 0.5rem;
		border-top: 1px solid var(--bg-light, #3d3d3d);
	}

	.btn-save {
		padding: 0.75rem 2rem;
		background: var(--primary-orange, #ff6b35);
		border: none;
		border-radius: 4px;
		color: var(--text-primary, #ffffff);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.btn-save:hover:not(:disabled) {
		background: var(--primary-orange-dark, #e55a2b);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
		transform: translateY(-1px);
	}

	.btn-save:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.btn-save:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.parameter-panel {
			padding: 0.75rem;
		}

		.panel-title {
			font-size: 1.1rem;
		}

		.parameter-label {
			font-size: 0.875rem;
		}

		.btn-save {
			width: 100%;
		}
	}
</style>
