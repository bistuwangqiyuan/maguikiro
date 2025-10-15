<script lang="ts">
	import type { GateConfig } from '$lib/types/signal';
	import { testingStore } from '$lib/stores/testing';
	import { createEventDispatcher } from 'svelte';
	
	/**
	 * 闸门设置组件 / Gate Settings Component
	 * 
	 * 提供闸门A和闸门B的独立配置界面
	 * Provides independent configuration interface for Gate A and Gate B
	 */
	
	const dispatch = createEventDispatcher<{
		save: { gateA: GateConfig; gateB: GateConfig };
		apply: { gateA: GateConfig; gateB: GateConfig };
	}>();
	
	// 从store获取当前参数 / Get current parameters from store
	$: currentParameters = $testingStore.currentSession?.parameters;
	
	// 本地状态 / Local state
	let gateA: GateConfig = {
		enabled: true,
		start: 0,
		width: 1.0,
		height: 5.0,
		alarmThreshold: 1.5,
		color: '#FFD700'
	};
	
	let gateB: GateConfig = {
		enabled: true,
		start: 1.0,
		width: 1.0,
		height: 5.0,
		alarmThreshold: 2.0,
		color: '#FF69B4'
	};
	
	// 从当前会话加载参数 / Load parameters from current session
	$: if (currentParameters) {
		gateA = { ...currentParameters.gateA };
		gateB = { ...currentParameters.gateB };
	}
	
	// 验证状态 / Validation state
	let errors = {
		gateA: { start: '', width: '', height: '', alarmThreshold: '' },
		gateB: { start: '', width: '', height: '', alarmThreshold: '' }
	};
	
	/**
	 * 验证闸门参数 / Validate gate parameters
	 */
	function validateGate(gate: GateConfig, gateName: 'gateA' | 'gateB'): boolean {
		let isValid = true;
		errors[gateName] = { start: '', width: '', height: '', alarmThreshold: '' };
		
		// 验证起始位置 / Validate start position
		if (gate.start < 0) {
			errors[gateName].start = '起始位置不能为负数';
			isValid = false;
		}
		
		// 验证宽度 / Validate width
		if (gate.width <= 0) {
			errors[gateName].width = '宽度必须大于0';
			isValid = false;
		} else if (gate.width > 10) {
			errors[gateName].width = '宽度不能超过10';
			isValid = false;
		}
		
		// 验证高度 / Validate height
		if (gate.height <= 0) {
			errors[gateName].height = '高度必须大于0';
			isValid = false;
		} else if (gate.height > 10) {
			errors[gateName].height = '高度不能超过10';
			isValid = false;
		}
		
		// 验证报警阈值 / Validate alarm threshold
		if (gate.alarmThreshold <= 0) {
			errors[gateName].alarmThreshold = '报警阈值必须大于0';
			isValid = false;
		} else if (gate.alarmThreshold > gate.height) {
			errors[gateName].alarmThreshold = '报警阈值不能超过闸门高度';
			isValid = false;
		}
		
		return isValid;
	}
	
	/**
	 * 应用设置 / Apply settings
	 */
	async function handleApply() {
		const isGateAValid = validateGate(gateA, 'gateA');
		const isGateBValid = validateGate(gateB, 'gateB');
		
		if (!isGateAValid || !isGateBValid) {
			return;
		}
		
		// 更新store中的参数 / Update parameters in store
		await testingStore.updateParameters({
			gateA,
			gateB
		});
		
		dispatch('apply', { gateA, gateB });
	}
	
	/**
	 * 保存设置 / Save settings
	 */
	async function handleSave() {
		const isGateAValid = validateGate(gateA, 'gateA');
		const isGateBValid = validateGate(gateB, 'gateB');
		
		if (!isGateAValid || !isGateBValid) {
			return;
		}
		
		// 更新store中的参数 / Update parameters in store
		await testingStore.updateParameters({
			gateA,
			gateB
		});
		
		dispatch('save', { gateA, gateB });
	}
	
	/**
	 * 重置为默认值 / Reset to defaults
	 */
	function handleReset() {
		gateA = {
			enabled: true,
			start: 0,
			width: 1.0,
			height: 5.0,
			alarmThreshold: 1.5,
			color: '#FFD700'
		};
		
		gateB = {
			enabled: true,
			start: 1.0,
			width: 1.0,
			height: 5.0,
			alarmThreshold: 2.0,
			color: '#FF69B4'
		};
		
		errors = {
			gateA: { start: '', width: '', height: '', alarmThreshold: '' },
			gateB: { start: '', width: '', height: '', alarmThreshold: '' }
		};
	}
</script>

<div class="gate-settings">
	<div class="settings-header">
		<h2 class="text-2xl font-bold text-primary-orange">闸门设置 / Gate Settings</h2>
		<p class="text-text-secondary mt-2">配置闸门A和闸门B的参数 / Configure Gate A and Gate B parameters</p>
	</div>
	
	<div class="settings-content">
		<!-- 闸门A配置 / Gate A Configuration -->
		<div class="gate-config-section">
			<div class="gate-header" style="border-color: {gateA.color};">
				<h3 class="text-xl font-bold" style="color: {gateA.color};">闸门 A / GATE A</h3>
				<label class="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						bind:checked={gateA.enabled}
						class="toggle toggle-warning"
					/>
					<span class="text-sm">{gateA.enabled ? '启用' : '禁用'}</span>
				</label>
			</div>
			
			<div class="gate-controls" class:disabled={!gateA.enabled}>
				<!-- 起始位置 / Start Position -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">起始位置 / Start Position</span>
						<span class="label-text-alt text-text-secondary">单位: 秒</span>
					</label>
					<input
						type="number"
						bind:value={gateA.start}
						disabled={!gateA.enabled}
						min="0"
						step="0.1"
						class="input input-bordered"
						class:input-error={errors.gateA.start}
					/>
					{#if errors.gateA.start}
						<label class="label">
							<span class="label-text-alt text-error">{errors.gateA.start}</span>
						</label>
					{/if}
				</div>
				
				<!-- 宽度 / Width -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">宽度 / Width</span>
						<span class="label-text-alt text-text-secondary">单位: 秒</span>
					</label>
					<input
						type="number"
						bind:value={gateA.width}
						disabled={!gateA.enabled}
						min="0.1"
						max="10"
						step="0.1"
						class="input input-bordered"
						class:input-error={errors.gateA.width}
					/>
					{#if errors.gateA.width}
						<label class="label">
							<span class="label-text-alt text-error">{errors.gateA.width}</span>
						</label>
					{/if}
				</div>
				
				<!-- 高度 / Height -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">高度 / Height</span>
						<span class="label-text-alt text-text-secondary">单位: 幅值</span>
					</label>
					<input
						type="number"
						bind:value={gateA.height}
						disabled={!gateA.enabled}
						min="0.1"
						max="10"
						step="0.1"
						class="input input-bordered"
						class:input-error={errors.gateA.height}
					/>
					{#if errors.gateA.height}
						<label class="label">
							<span class="label-text-alt text-error">{errors.gateA.height}</span>
						</label>
					{/if}
				</div>
				
				<!-- 报警阈值 / Alarm Threshold -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">报警阈值 / Alarm Threshold</span>
						<span class="label-text-alt text-text-secondary">单位: 幅值</span>
					</label>
					<input
						type="number"
						bind:value={gateA.alarmThreshold}
						disabled={!gateA.enabled}
						min="0.1"
						max={gateA.height}
						step="0.1"
						class="input input-bordered"
						class:input-error={errors.gateA.alarmThreshold}
					/>
					{#if errors.gateA.alarmThreshold}
						<label class="label">
							<span class="label-text-alt text-error">{errors.gateA.alarmThreshold}</span>
						</label>
					{/if}
				</div>
				
				<!-- 颜色选择器 / Color Picker -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">颜色 / Color</span>
					</label>
					<div class="flex items-center gap-2">
						<input
							type="color"
							bind:value={gateA.color}
							disabled={!gateA.enabled}
							class="color-picker"
						/>
						<input
							type="text"
							bind:value={gateA.color}
							disabled={!gateA.enabled}
							class="input input-bordered flex-1"
							placeholder="#FFD700"
						/>
					</div>
				</div>
			</div>
		</div>
		
		<!-- 闸门B配置 / Gate B Configuration -->
		<div class="gate-config-section">
			<div class="gate-header" style="border-color: {gateB.color};">
				<h3 class="text-xl font-bold" style="color: {gateB.color};">闸门 B / GATE B</h3>
				<label class="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						bind:checked={gateB.enabled}
						class="toggle toggle-secondary"
					/>
					<span class="text-sm">{gateB.enabled ? '启用' : '禁用'}</span>
				</label>
			</div>
			
			<div class="gate-controls" class:disabled={!gateB.enabled}>
				<!-- 起始位置 / Start Position -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">起始位置 / Start Position</span>
						<span class="label-text-alt text-text-secondary">单位: 秒</span>
					</label>
					<input
						type="number"
						bind:value={gateB.start}
						disabled={!gateB.enabled}
						min="0"
						step="0.1"
						class="input input-bordered"
						class:input-error={errors.gateB.start}
					/>
					{#if errors.gateB.start}
						<label class="label">
							<span class="label-text-alt text-error">{errors.gateB.start}</span>
						</label>
					{/if}
				</div>
				
				<!-- 宽度 / Width -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">宽度 / Width</span>
						<span class="label-text-alt text-text-secondary">单位: 秒</span>
					</label>
					<input
						type="number"
						bind:value={gateB.width}
						disabled={!gateB.enabled}
						min="0.1"
						max="10"
						step="0.1"
						class="input input-bordered"
						class:input-error={errors.gateB.width}
					/>
					{#if errors.gateB.width}
						<label class="label">
							<span class="label-text-alt text-error">{errors.gateB.width}</span>
						</label>
					{/if}
				</div>
				
				<!-- 高度 / Height -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">高度 / Height</span>
						<span class="label-text-alt text-text-secondary">单位: 幅值</span>
					</label>
					<input
						type="number"
						bind:value={gateB.height}
						disabled={!gateB.enabled}
						min="0.1"
						max="10"
						step="0.1"
						class="input input-bordered"
						class:input-error={errors.gateB.height}
					/>
					{#if errors.gateB.height}
						<label class="label">
							<span class="label-text-alt text-error">{errors.gateB.height}</span>
						</label>
					{/if}
				</div>
				
				<!-- 报警阈值 / Alarm Threshold -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">报警阈值 / Alarm Threshold</span>
						<span class="label-text-alt text-text-secondary">单位: 幅值</span>
					</label>
					<input
						type="number"
						bind:value={gateB.alarmThreshold}
						disabled={!gateB.enabled}
						min="0.1"
						max={gateB.height}
						step="0.1"
						class="input input-bordered"
						class:input-error={errors.gateB.alarmThreshold}
					/>
					{#if errors.gateB.alarmThreshold}
						<label class="label">
							<span class="label-text-alt text-error">{errors.gateB.alarmThreshold}</span>
						</label>
					{/if}
				</div>
				
				<!-- 颜色选择器 / Color Picker -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">颜色 / Color</span>
					</label>
					<div class="flex items-center gap-2">
						<input
							type="color"
							bind:value={gateB.color}
							disabled={!gateB.enabled}
							class="color-picker"
						/>
						<input
							type="text"
							bind:value={gateB.color}
							disabled={!gateB.enabled}
							class="input input-bordered flex-1"
							placeholder="#FF69B4"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
	
	<!-- 操作按钮 / Action Buttons -->
	<div class="settings-actions">
		<button class="btn btn-ghost" on:click={handleReset}>
			重置 / Reset
		</button>
		<div class="flex gap-2">
			<button class="btn btn-primary" on:click={handleApply}>
				应用 / Apply
			</button>
			<button class="btn btn-success" on:click={handleSave}>
				保存 / Save
			</button>
		</div>
	</div>
</div>

<style>
	.gate-settings {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 1.5rem;
		background: var(--bg-medium, #2D2D2D);
		border-radius: 0.5rem;
		color: var(--text-primary, #FFFFFF);
	}
	
	.settings-header {
		padding-bottom: 1rem;
		border-bottom: 2px solid var(--primary-orange, #FF6B35);
	}
	
	.settings-content {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 2rem;
	}
	
	.gate-config-section {
		background: var(--bg-dark, #1A1A1A);
		border-radius: 0.5rem;
		padding: 1.5rem;
		border: 2px solid transparent;
		transition: border-color 0.3s ease;
	}
	
	.gate-config-section:hover {
		border-color: var(--primary-orange, #FF6B35);
	}
	
	.gate-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 1rem;
		margin-bottom: 1.5rem;
		border-bottom: 2px solid;
	}
	
	.gate-controls {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		transition: opacity 0.3s ease;
	}
	
	.gate-controls.disabled {
		opacity: 0.5;
		pointer-events: none;
	}
	
	.form-control {
		display: flex;
		flex-direction: column;
	}
	
	.label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}
	
	.label-text {
		font-weight: 500;
		color: var(--text-primary, #FFFFFF);
	}
	
	.label-text-alt {
		font-size: 0.875rem;
	}
	
	.input {
		background: var(--bg-medium, #2D2D2D);
		border: 1px solid var(--bg-light, #3D3D3D);
		color: var(--text-primary, #FFFFFF);
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-family: 'Roboto Mono', monospace;
		transition: border-color 0.2s ease;
	}
	
	.input:focus {
		outline: none;
		border-color: var(--primary-orange, #FF6B35);
	}
	
	.input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.input-error {
		border-color: var(--error, #F44336);
	}
	
	.color-picker {
		width: 60px;
		height: 40px;
		border: 2px solid var(--bg-light, #3D3D3D);
		border-radius: 0.375rem;
		cursor: pointer;
		transition: border-color 0.2s ease;
	}
	
	.color-picker:hover {
		border-color: var(--primary-orange, #FF6B35);
	}
	
	.color-picker:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.toggle {
		appearance: none;
		width: 3rem;
		height: 1.5rem;
		background: var(--bg-light, #3D3D3D);
		border-radius: 9999px;
		position: relative;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}
	
	.toggle::before {
		content: '';
		position: absolute;
		width: 1.25rem;
		height: 1.25rem;
		background: white;
		border-radius: 50%;
		top: 0.125rem;
		left: 0.125rem;
		transition: transform 0.2s ease;
	}
	
	.toggle:checked {
		background: var(--primary-orange, #FF6B35);
	}
	
	.toggle:checked::before {
		transform: translateX(1.5rem);
	}
	
	.toggle-warning:checked {
		background: #FFD700;
	}
	
	.toggle-secondary:checked {
		background: #FF69B4;
	}
	
	.settings-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 1rem;
		border-top: 1px solid var(--bg-light, #3D3D3D);
	}
	
	.btn {
		padding: 0.5rem 1.5rem;
		border-radius: 0.375rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
		font-size: 1rem;
	}
	
	.btn-ghost {
		background: transparent;
		color: var(--text-secondary, #B0B0B0);
	}
	
	.btn-ghost:hover {
		background: var(--bg-light, #3D3D3D);
		color: var(--text-primary, #FFFFFF);
	}
	
	.btn-primary {
		background: var(--primary-orange, #FF6B35);
		color: white;
	}
	
	.btn-primary:hover {
		background: var(--primary-orange-dark, #E55A2B);
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(255, 107, 53, 0.3);
	}
	
	.btn-success {
		background: var(--success, #4CAF50);
		color: white;
	}
	
	.btn-success:hover {
		background: #45a049;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
	}
	
	/* 响应式设计 / Responsive Design */
	@media (max-width: 768px) {
		.settings-content {
			grid-template-columns: 1fr;
		}
		
		.settings-actions {
			flex-direction: column;
			gap: 1rem;
		}
		
		.settings-actions > div {
			width: 100%;
		}
		
		.settings-actions .btn {
			width: 100%;
		}
	}
</style>
