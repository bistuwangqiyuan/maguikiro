# 波形组件 / Waveform Components

实时磁信号波形显示组件。

Real-time magnetic signal waveform display components.

## 组件 / Components

### WaveformChart ✅ 已完成

实时波形图表组件，使用 Chart.js 和 chartjs-plugin-streaming 实现。

Real-time waveform chart component using Chart.js and chartjs-plugin-streaming.

#### Props

- `height`: 图表高度（像素），默认 400
- `refreshRate`: 刷新率（fps），默认 30

#### 特性 / Features

- ✅ 实时数据流显示（30fps+）
- ✅ 自动滚动和缩放
- ✅ 网格线和刻度标记
- ✅ 工业风格配色（绿色波形 #00FF00，黑色背景）
- ✅ 根据增益自动调整Y轴范围
- ✅ 支持暂停/恢复
- ✅ Canvas渲染，高性能
- ✅ 响应式设计
- ✅ 自动订阅testingStore
- ✅ 实时显示最近10秒数据

#### 使用示例 / Usage Example

```svelte
<script>
  import { WaveformChart } from '$lib/components/waveform';
</script>

<!-- 基本使用 / Basic usage -->
<WaveformChart height={400} refreshRate={30} />

<!-- 自定义配置 / Custom configuration -->
<WaveformChart height={600} refreshRate={60} />
```

#### 数据源 / Data Source

组件自动订阅 `testingStore`，从 `processedBuffer` 获取实时信号数据。

The component automatically subscribes to `testingStore` and gets real-time signal data from `processedBuffer`.

#### 性能优化 / Performance Optimization

- 使用 Canvas 而非 SVG 渲染
- 禁用动画以提高性能
- 点半径设为 0，减少渲染负担
- 使用 'none' 更新模式避免不必要的动画
- 实时数据流插件优化内存使用

#### 集成说明 / Integration Notes

WaveformChart已集成到主页面（`src/routes/+page.svelte`）中：
- 当检测状态为 `running`、`paused` 或有数据时自动显示
- 显示实时统计信息（时长、采样数、缺陷数、采样率）
- 显示当前检测参数（项目名称、增益、滤波器、速度）

WaveformChart is integrated into the main page (`src/routes/+page.svelte`):
- Automatically displays when testing status is `running`, `paused`, or has data
- Shows real-time statistics (duration, samples, defects, sampling rate)
- Displays current testing parameters (project name, gain, filter, velocity)

### GateOverlay ✅ 已完成

闸门可视化覆盖层组件，在波形图上绘制闸门边界。

Gate visualization overlay component that draws gate boundaries on the waveform chart.

#### Props

- `gateA`: 闸门A配置
- `gateB`: 闸门B配置
- `chartWidth`: 图表宽度
- `chartHeight`: 图表高度
- `timeScale`: 时间轴缩放比例
- `amplitudeScale`: 幅值轴缩放比例

### SignalMarker ✅ 已完成

缺陷标记组件，在波形图上标记缺陷位置。

Defect marker component that marks defect positions on the waveform chart.

#### Props

- `defects`: 缺陷列表（Defect[]）
- `chartWidth`: 图表宽度
- `chartHeight`: 图表高度
- `timeScale`: 时间轴缩放比例
- `amplitudeScale`: 幅值轴缩放比例
- `onDefectClick`: 缺陷点击回调函数（可选）

#### 特性 / Features

- ✅ 根据严重程度使用不同颜色标记
  - 低 / Low: 绿色 (#4CAF50)
  - 中 / Medium: 黄色 (#FFC107)
  - 高 / High: 橙色 (#FF9800)
  - 严重 / Critical: 红色 (#F44336)
- ✅ 垂直虚线指示缺陷位置
- ✅ 彩色圆点标记缺陷点
- ✅ 严重缺陷带脉冲动画效果
- ✅ 悬停/点击显示详细信息工具提示
- ✅ 缺陷计数统计面板
- ✅ 按严重程度分类统计
- ✅ 交互式选择和高亮
- ✅ 键盘导航支持

#### 使用示例 / Usage Example

```svelte
<script>
  import { SignalMarker } from '$lib/components/waveform';
  import type { Defect } from '$lib/types/signal';
  
  let defects: Defect[] = [
    {
      id: 'defect-1',
      position: 2.5,
      amplitude: 2.0,
      severity: 'high',
      timestamp: new Date(),
      gateTriggered: 'A',
      notes: 'High amplitude defect'
    }
  ];
  
  function handleDefectClick(defect: Defect) {
    console.log('Defect clicked:', defect);
  }
</script>

<SignalMarker
  {defects}
  chartWidth={800}
  chartHeight={400}
  timeScale={80}
  amplitudeScale={80}
  onDefectClick={handleDefectClick}
/>
```

#### 缺陷计数面板 / Defect Count Panel

组件右上角自动显示缺陷统计面板，包含：
- 总缺陷数
- 按严重程度分类的缺陷数
- 颜色编码的严重程度指示器

The component automatically displays a defect statistics panel in the top-right corner, including:
- Total defect count
- Defect count by severity
- Color-coded severity indicators

### WaveformWithGates ✅ 已完成

带闸门和缺陷标记的波形显示组件，演示如何集成GateOverlay和SignalMarker。

Waveform display with gates and defect markers component, demonstrates how to integrate GateOverlay and SignalMarker.

#### Props

- `gateA`: 闸门A配置
- `gateB`: 闸门B配置
- `defects`: 缺陷列表（默认为空数组）
- `width`: 图表宽度
- `height`: 图表高度
- `onDefectClick`: 缺陷点击回调函数（可选）

#### 使用示例 / Usage Example

```svelte
<script>
  import { WaveformWithGates } from '$lib/components/waveform';
  
  let gateA = {
    enabled: true,
    start: 2.0,
    width: 2.0,
    height: 3.0,
    alarmThreshold: 1.5,
    color: '#FFD700'
  };
  
  let gateB = {
    enabled: true,
    start: 5.5,
    width: 1.5,
    height: 2.5,
    alarmThreshold: 2.0,
    color: '#FF69B4'
  };
  
  let defects = [/* ... */];
</script>

<WaveformWithGates
  {gateA}
  {gateB}
  {defects}
  width={800}
  height={400}
  onDefectClick={(defect) => console.log(defect)}
/>
```

## 示例和测试 / Examples and Tests

查看 `__tests__/waveform.example.ts` 了解详细的使用示例和最佳实践。

See `__tests__/waveform.example.ts` for detailed usage examples and best practices.

查看 `src/routes/demo-gates/+page.svelte` 了解完整的交互式演示。

See `src/routes/demo-gates/+page.svelte` for a complete interactive demo.

## 未来扩展 / Future Extensions

- WaveformControls: 波形控制面板（缩放、平移等）
- WaveformExport: 波形导出功能
- DefectAnnotation: 缺陷标注和编辑功能
