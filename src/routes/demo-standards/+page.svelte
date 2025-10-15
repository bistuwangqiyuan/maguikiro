<script lang="ts">
	import ParameterPanel from '$lib/components/settings/ParameterPanel.svelte';
	import { getAllPresets } from '$lib/utils/standard-presets';

	const presets = getAllPresets();
</script>

<svelte:head>
	<title>国际标准预设参数演示 - Standard Presets Demo</title>
</svelte:head>

<div class="demo-container">
	<div class="demo-header">
		<h1 class="demo-title">国际标准预设参数演示</h1>
		<p class="demo-subtitle">International Standard Presets Demo</p>
	</div>

	<div class="demo-content">
		<!-- Parameter Panel with Standard Selection -->
		<div class="demo-section">
			<h2 class="section-title">参数设置面板 (Parameter Panel)</h2>
			<p class="section-description">
				选择不同的国际标准以自动应用相应的预设参数。参数会根据所选标准自动调整。
			</p>
			<div class="panel-wrapper">
				<ParameterPanel />
			</div>
		</div>

		<!-- Standards Information -->
		<div class="demo-section">
			<h2 class="section-title">支持的国际标准 (Supported Standards)</h2>
			<div class="standards-grid">
				{#each presets.filter((p) => p.id !== 'CUSTOM') as preset}
					<div class="standard-card">
						<div class="card-header">
							<h3 class="card-title">{preset.name}</h3>
							<span class="card-subtitle">{preset.nameEn}</span>
						</div>
						<div class="card-body">
							<p class="card-description">{preset.description}</p>
							<div class="card-parameters">
								<div class="param-item">
									<span class="param-label">增益 (Gain):</span>
									<span class="param-value">{preset.parameters.gain} dB</span>
								</div>
								<div class="param-item">
									<span class="param-label">滤波器 (Filter):</span>
									<span class="param-value">{preset.parameters.filter}</span>
								</div>
								<div class="param-item">
									<span class="param-label">速度 (Velocity):</span>
									<span class="param-value">{preset.parameters.velocity} m/s</span>
								</div>
								<div class="param-item">
									<span class="param-label">阈值 (Threshold):</span>
									<span class="param-value">{preset.parameters.threshold}</span>
								</div>
							</div>
							{#if preset.referenceUrl}
								<a
									href={preset.referenceUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="card-link"
								>
									查看标准文档 →
								</a>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Usage Instructions -->
		<div class="demo-section">
			<h2 class="section-title">使用说明 (Usage Instructions)</h2>
			<div class="instructions">
				<ol class="instruction-list">
					<li>
						<strong>选择标准:</strong> 在参数设置面板顶部的下拉菜单中选择一个国际标准
					</li>
					<li>
						<strong>自动应用:</strong> 系统会自动应用该标准的预设参数（增益、滤波器、速度、阈值等）
					</li>
					<li>
						<strong>查看说明:</strong> 选择标准后会显示该标准的描述和参考文档链接
					</li>
					<li>
						<strong>手动调整:</strong> 您可以在应用预设后手动微调参数，系统会自动切换到"自定义"模式
					</li>
					<li>
						<strong>保存参数:</strong> 点击"保存参数"按钮将当前配置保存到数据库
					</li>
				</ol>
			</div>
		</div>

		<!-- Features -->
		<div class="demo-section">
			<h2 class="section-title">功能特性 (Features)</h2>
			<div class="features-grid">
				<div class="feature-card">
					<div class="feature-icon">📋</div>
					<h3 class="feature-title">标准预设</h3>
					<p class="feature-description">
						支持 ASME、ISO、EN、ASTM 等主流国际无损检测标准
					</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">⚡</div>
					<h3 class="feature-title">快速应用</h3>
					<p class="feature-description">一键应用标准预设参数，无需手动逐项配置</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">🔄</div>
					<h3 class="feature-title">智能识别</h3>
					<p class="feature-description">自动识别当前参数是否匹配某个标准预设</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">📖</div>
					<h3 class="feature-title">标准文档</h3>
					<p class="feature-description">提供标准说明和参考文档链接，便于查阅</p>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.demo-container {
		min-height: 100vh;
		background: var(--bg-dark, #1a1a1a);
		color: var(--text-primary, #ffffff);
		padding: 2rem;
		font-family: 'Roboto', sans-serif;
	}

	.demo-header {
		text-align: center;
		margin-bottom: 3rem;
		padding-bottom: 2rem;
		border-bottom: 2px solid var(--primary-orange, #ff6b35);
	}

	.demo-title {
		font-size: 2.5rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: var(--primary-orange, #ff6b35);
	}

	.demo-subtitle {
		font-size: 1.25rem;
		margin: 0;
		color: var(--text-secondary, #b0b0b0);
	}

	.demo-content {
		max-width: 1400px;
		margin: 0 auto;
	}

	.demo-section {
		margin-bottom: 3rem;
	}

	.section-title {
		font-size: 1.75rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		color: var(--primary-orange, #ff6b35);
	}

	.section-description {
		font-size: 1rem;
		color: var(--text-secondary, #b0b0b0);
		margin: 0 0 1.5rem 0;
		line-height: 1.6;
	}

	.panel-wrapper {
		max-width: 600px;
	}

	.standards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.standard-card {
		background: var(--bg-medium, #2d2d2d);
		border: 2px solid var(--bg-light, #3d3d3d);
		border-radius: 8px;
		overflow: hidden;
		transition: all 0.3s;
	}

	.standard-card:hover {
		border-color: var(--primary-orange, #ff6b35);
		transform: translateY(-4px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
	}

	.card-header {
		background: var(--bg-light, #3d3d3d);
		padding: 1rem;
		border-bottom: 1px solid var(--primary-orange, #ff6b35);
	}

	.card-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.25rem 0;
		color: var(--primary-orange, #ff6b35);
	}

	.card-subtitle {
		font-size: 0.875rem;
		color: var(--text-secondary, #b0b0b0);
	}

	.card-body {
		padding: 1rem;
	}

	.card-description {
		font-size: 0.95rem;
		color: var(--text-secondary, #b0b0b0);
		margin: 0 0 1rem 0;
		line-height: 1.5;
	}

	.card-parameters {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
		padding: 0.75rem;
		background: var(--bg-dark, #1a1a1a);
		border-radius: 4px;
	}

	.param-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.875rem;
	}

	.param-label {
		color: var(--text-secondary, #b0b0b0);
	}

	.param-value {
		color: var(--primary-orange, #ff6b35);
		font-family: 'Roboto Mono', monospace;
		font-weight: 600;
	}

	.card-link {
		display: inline-block;
		color: var(--primary-orange, #ff6b35);
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		transition: color 0.2s;
	}

	.card-link:hover {
		color: var(--primary-orange-light, #ff8555);
		text-decoration: underline;
	}

	.instructions {
		background: var(--bg-medium, #2d2d2d);
		border: 2px solid var(--primary-orange, #ff6b35);
		border-radius: 8px;
		padding: 1.5rem;
	}

	.instruction-list {
		margin: 0;
		padding-left: 1.5rem;
		color: var(--text-primary, #ffffff);
		line-height: 1.8;
	}

	.instruction-list li {
		margin-bottom: 0.75rem;
	}

	.instruction-list strong {
		color: var(--primary-orange, #ff6b35);
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.feature-card {
		background: var(--bg-medium, #2d2d2d);
		border: 2px solid var(--bg-light, #3d3d3d);
		border-radius: 8px;
		padding: 1.5rem;
		text-align: center;
		transition: all 0.3s;
	}

	.feature-card:hover {
		border-color: var(--primary-orange, #ff6b35);
		transform: translateY(-4px);
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.feature-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: var(--primary-orange, #ff6b35);
	}

	.feature-description {
		font-size: 0.95rem;
		color: var(--text-secondary, #b0b0b0);
		margin: 0;
		line-height: 1.5;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.demo-container {
			padding: 1rem;
		}

		.demo-title {
			font-size: 1.75rem;
		}

		.demo-subtitle {
			font-size: 1rem;
		}

		.section-title {
			font-size: 1.5rem;
		}

		.standards-grid,
		.features-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
