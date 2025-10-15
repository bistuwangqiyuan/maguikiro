/**
 * 波形图表组件示例 / Waveform Chart Component Example
 * 
 * 演示如何使用WaveformChart组件
 * Demonstrates how to use the WaveformChart component
 */

import type { SignalData } from '$lib/types/signal';

/**
 * 示例：生成模拟信号数据 / Example: Generate simulated signal data
 */
export function generateSampleSignalData(count: number = 100): SignalData[] {
	const data: SignalData[] = [];
	const frequency = 100; // Hz
	const amplitude = 1.0;
	const noiseLevel = 0.1;
	
	for (let i = 0; i < count; i++) {
		const time = i / 100; // 100 samples per second
		
		// 基础正弦波 + 噪声 / Base sine wave + noise
		let value = amplitude * Math.sin(2 * Math.PI * frequency * time);
		value += (Math.random() - 0.5) * noiseLevel;
		
		// 添加模拟缺陷 / Add simulated defects
		if (i === 25 || i === 75) {
			value += 2.0; // 缺陷峰值 / Defect peak
		}
		
		data.push({
			timestamp: Date.now() + i * 10,
			amplitude: value,
			phase: 0,
			position: time,
			frequency: frequency
		});
	}
	
	return data;
}

/**
 * 示例：使用WaveformChart组件 / Example: Using WaveformChart component
 * 
 * ```svelte
 * <script lang="ts">
 *   import { WaveformChart } from '$lib/components/waveform';
 *   import { testingStore } from '$lib/stores/testing';
 * </script>
 * 
 * <!-- 基本使用 / Basic usage -->
 * <WaveformChart height={400} refreshRate={30} />
 * 
 * <!-- 自定义高度和刷新率 / Custom height and refresh rate -->
 * <WaveformChart height={600} refreshRate={60} />
 * ```
 */

/**
 * 示例：手动添加数据点 / Example: Manually add data points
 * 
 * 注意：通常不需要手动添加数据，WaveformChart会自动从testingStore订阅数据
 * Note: Usually you don't need to manually add data, WaveformChart automatically subscribes to testingStore
 * 
 * ```typescript
 * import { testingStore } from '$lib/stores/testing';
 * 
 * // 开始检测 / Start testing
 * await testingStore.startTesting('My Project');
 * 
 * // 数据会自动流入图表 / Data will automatically flow into the chart
 * // WaveformChart组件会自动订阅processedBuffer并显示数据
 * // WaveformChart component automatically subscribes to processedBuffer and displays data
 * ```
 */

/**
 * 示例：控制图表状态 / Example: Control chart state
 * 
 * ```typescript
 * import { testingStore } from '$lib/stores/testing';
 * 
 * // 暂停检测（图表也会暂停）/ Pause testing (chart will also pause)
 * testingStore.pauseTesting();
 * 
 * // 恢复检测 / Resume testing
 * testingStore.resumeTesting();
 * 
 * // 停止检测 / Stop testing
 * await testingStore.stopTesting();
 * ```
 */

/**
 * 示例：调整图表参数 / Example: Adjust chart parameters
 * 
 * ```typescript
 * import { testingStore } from '$lib/stores/testing';
 * 
 * // 更新增益（会自动调整Y轴范围）/ Update gain (will automatically adjust Y-axis range)
 * await testingStore.updateParameters({ gain: 60 });
 * 
 * // 更新滤波器 / Update filter
 * await testingStore.updateParameters({ filter: 'lowpass' });
 * ```
 */

/**
 * 性能优化建议 / Performance optimization recommendations
 * 
 * 1. 使用合适的刷新率 / Use appropriate refresh rate
 *    - 30fps 适合大多数场景 / 30fps suitable for most scenarios
 *    - 60fps 用于高精度显示 / 60fps for high-precision display
 *    - 降低刷新率可以提高性能 / Lower refresh rate can improve performance
 * 
 * 2. 限制数据缓冲区大小 / Limit data buffer size
 *    - testingStore会自动批量保存数据到数据库 / testingStore automatically batch saves data to database
 *    - 每100个样本保存一次 / Saves every 100 samples
 * 
 * 3. 使用Canvas渲染 / Use Canvas rendering
 *    - WaveformChart已经使用Canvas，性能优异 / WaveformChart already uses Canvas, excellent performance
 *    - 避免使用SVG绘制大量数据点 / Avoid using SVG to draw large amounts of data points
 */

/**
 * 故障排除 / Troubleshooting
 * 
 * 问题：图表不显示数据 / Issue: Chart doesn't display data
 * 解决：
 * 1. 确保已启动检测 / Ensure testing is started
 * 2. 检查testingStore.processedBuffer是否有数据 / Check if testingStore.processedBuffer has data
 * 3. 检查浏览器控制台是否有错误 / Check browser console for errors
 * 
 * 问题：图表性能差 / Issue: Poor chart performance
 * 解决：
 * 1. 降低刷新率 / Lower refresh rate
 * 2. 减少数据缓冲区大小 / Reduce data buffer size
 * 3. 检查是否有其他性能瓶颈 / Check for other performance bottlenecks
 * 
 * 问题：Y轴范围不正确 / Issue: Incorrect Y-axis range
 * 解决：
 * 1. 检查增益参数设置 / Check gain parameter setting
 * 2. 手动调整Y轴范围（在图表配置中）/ Manually adjust Y-axis range (in chart config)
 */

export default {
	generateSampleSignalData
};

import type { Defect } from '$lib/types/signal';

/**
 * 生成模拟缺陷数据 / Generate simulated defect data
 */
export function generateSampleDefects(): Defect[] {
	return [
		{
			id: 'defect-1',
			position: 2.5,
			amplitude: 2.0,
			severity: 'high',
			timestamp: new Date(),
			gateTriggered: 'A',
			notes: '高幅值缺陷 / High amplitude defect'
		},
		{
			id: 'defect-2',
			position: 3.2,
			amplitude: 1.8,
			severity: 'medium',
			timestamp: new Date(),
			gateTriggered: 'A'
		},
		{
			id: 'defect-3',
			position: 6.0,
			amplitude: 2.5,
			severity: 'critical',
			timestamp: new Date(),
			gateTriggered: 'B',
			notes: '严重缺陷，需要立即处理 / Critical defect, requires immediate attention'
		},
		{
			id: 'defect-4',
			position: 6.8,
			amplitude: 1.2,
			severity: 'low',
			timestamp: new Date(),
			gateTriggered: 'B'
		},
		{
			id: 'defect-5',
			position: 8.5,
			amplitude: 1.6,
			severity: 'medium',
			timestamp: new Date(),
			gateTriggered: 'both',
			notes: '双闸门触发 / Both gates triggered'
		}
	];
}

/**
 * 示例：缺陷标记使用 / Example: Defect marker usage
 * 
 * 在Svelte组件中使用SignalMarker:
 * Using SignalMarker in a Svelte component:
 * 
 * <script lang="ts">
 *   import { SignalMarker } from '$lib/components/waveform';
 *   import type { Defect } from '$lib/types/signal';
 *   
 *   let defects: Defect[] = generateSampleDefects();
 *   
 *   function handleDefectClick(defect: Defect) {
 *     console.log('Defect clicked:', defect);
 *   }
 * </script>
 * 
 * <SignalMarker
 *   {defects}
 *   chartWidth={800}
 *   chartHeight={400}
 *   timeScale={80}
 *   amplitudeScale={80}
 *   onDefectClick={handleDefectClick}
 * />
 */

/**
 * 示例：完整的波形显示系统（包含闸门和缺陷标记）
 * Example: Complete waveform display system (with gates and defect markers)
 * 
 * 在Svelte组件中使用WaveformWithGates:
 * Using WaveformWithGates in a Svelte component:
 * 
 * <script lang="ts">
 *   import { WaveformWithGates } from '$lib/components/waveform';
 *   import type { GateConfig, Defect } from '$lib/types/signal';
 *   
 *   let gateA: GateConfig = {
 *     enabled: true,
 *     start: 2.0,
 *     width: 2.0,
 *     height: 3.0,
 *     alarmThreshold: 1.5,
 *     color: '#FFD700'
 *   };
 *   
 *   let gateB: GateConfig = {
 *     enabled: true,
 *     start: 5.5,
 *     width: 1.5,
 *     height: 2.5,
 *     alarmThreshold: 2.0,
 *     color: '#FF69B4'
 *   };
 *   
 *   let defects: Defect[] = generateSampleDefects();
 *   
 *   function handleDefectClick(defect: Defect) {
 *     console.log('Defect clicked:', defect);
 *   }
 * </script>
 * 
 * <WaveformWithGates
 *   {gateA}
 *   {gateB}
 *   {defects}
 *   width={800}
 *   height={400}
 *   onDefectClick={handleDefectClick}
 * />
 */

/**
 * 缺陷标记特性说明 / Defect marker features
 * 
 * 1. 颜色编码 / Color coding
 *    - 低 / Low: 绿色 (#4CAF50)
 *    - 中 / Medium: 黄色 (#FFC107)
 *    - 高 / High: 橙色 (#FF9800)
 *    - 严重 / Critical: 红色 (#F44336)
 * 
 * 2. 视觉元素 / Visual elements
 *    - 垂直虚线指示缺陷位置 / Vertical dashed line indicates defect position
 *    - 彩色圆点标记缺陷点 / Colored dot marks defect point
 *    - 严重缺陷带脉冲动画 / Critical defects have pulse animation
 * 
 * 3. 交互功能 / Interactive features
 *    - 悬停显示工具提示 / Hover to show tooltip
 *    - 点击选中缺陷 / Click to select defect
 *    - 键盘导航支持 / Keyboard navigation support
 * 
 * 4. 统计面板 / Statistics panel
 *    - 显示总缺陷数 / Shows total defect count
 *    - 按严重程度分类统计 / Breakdown by severity
 *    - 实时更新 / Real-time updates
 */
