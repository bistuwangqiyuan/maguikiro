<script lang="ts">
	import { onMount } from 'svelte';
	import GateOverlay from './GateOverlay.svelte';
	import SignalMarker from './SignalMarker.svelte';
	import type { GateConfig, Defect } from '$lib/types/signal';
	
	/**
	 * 带闸门和缺陷标记的波形显示组件 / Waveform Display with Gates and Defect Markers Component
	 * 
	 * 演示如何将GateOverlay和SignalMarker与波形图集成
	 * Demonstrates how to integrate GateOverlay and SignalMarker with waveform chart
	 */
	
	// Props
	export let gateA: GateConfig;
	export let gateB: GateConfig;
	export let defects: Defect[] = [];
	export let width: number = 800;
	export let height: number = 400;
	export let onDefectClick: ((defect: Defect) => void) | null = null;
	
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let animationId: number;
	let time = 0;
	
	// 时间和幅值的缩放比例 / Time and amplitude scale
	const timeScale = width / 10; // 10秒的时间窗口 / 10 second time window
	const amplitudeScale = height / 10; // ±5的幅值范围 / ±5 amplitude range
	
	onMount(() => {
		ctx = canvas.getContext('2d');
		if (ctx) {
			drawWaveform();
		}
		
		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	});
	
	/**
	 * 绘制模拟波形 / Draw simulated waveform
	 */
	function drawWaveform() {
		if (!ctx) return;
		
		// 清空画布 / Clear canvas
		ctx.fillStyle = '#0d0d0d';
		ctx.fillRect(0, 0, width, height);
		
		// 绘制网格线 / Draw grid lines
		drawGrid();
		
		// 绘制波形 / Draw waveform
		ctx.strokeStyle = '#00FF00';
		ctx.lineWidth = 2;
		ctx.beginPath();
		
		const centerY = height / 2;
		const frequency = 100; // Hz
		const amplitude = 1.0;
		const noiseLevel = 0.1;
		
		for (let x = 0; x < width; x++) {
			const t = (x / timeScale) + time;
			
			// 基础正弦波 + 噪声 / Base sine wave + noise
			let y = amplitude * Math.sin(2 * Math.PI * frequency * t / 100);
			y += (Math.random() - 0.5) * noiseLevel;
			
			// 添加模拟缺陷 / Add simulated defects
			const defect1Pos = 2.5;
			const defect2Pos = 6.0;
			y += gaussianPulse(t, defect1Pos, 0.05, 2.0);
			y += gaussianPulse(t, defect2Pos, 0.05, 1.5);
			
			const pixelY = centerY - (y * amplitudeScale);
			
			if (x === 0) {
				ctx.moveTo(x, pixelY);
			} else {
				ctx.lineTo(x, pixelY);
			}
		}
		
		ctx.stroke();
		
		// 继续动画 / Continue animation
		time += 0.01;
		animationId = requestAnimationFrame(drawWaveform);
	}
	
	/**
	 * 高斯脉冲函数（模拟缺陷）/ Gaussian pulse function (simulate defect)
	 */
	function gaussianPulse(t: number, position: number, width: number, amplitude: number): number {
		const distance = t - position;
		return amplitude * Math.exp(-(distance * distance) / (2 * width * width));
	}
	
	/**
	 * 绘制网格线 / Draw grid lines
	 */
	function drawGrid() {
		if (!ctx) return;
		
		ctx.strokeStyle = '#333333';
		ctx.lineWidth = 1;
		
		// 垂直网格线 / Vertical grid lines
		for (let x = 0; x < width; x += timeScale) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, height);
			ctx.stroke();
		}
		
		// 水平网格线 / Horizontal grid lines
		for (let y = 0; y < height; y += amplitudeScale) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
		}
		
		// 中心线 / Center line
		ctx.strokeStyle = '#555555';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(0, height / 2);
		ctx.lineTo(width, height / 2);
		ctx.stroke();
	}
</script>

<div class="waveform-container" style="width: {width}px; height: {height}px;">
	<canvas 
		bind:this={canvas}
		{width}
		{height}
		class="waveform-canvas"
	/>
	<GateOverlay 
		{gateA}
		{gateB}
		chartWidth={width}
		chartHeight={height}
		{timeScale}
		{amplitudeScale}
	/>
	<SignalMarker
		{defects}
		chartWidth={width}
		chartHeight={height}
		{timeScale}
		{amplitudeScale}
		{onDefectClick}
	/>
</div>

<style>
	.waveform-container {
		position: relative;
		background: #0d0d0d;
		border: 2px solid #2d2d2d;
		border-radius: 4px;
		overflow: hidden;
	}
	
	.waveform-canvas {
		display: block;
	}
</style>
