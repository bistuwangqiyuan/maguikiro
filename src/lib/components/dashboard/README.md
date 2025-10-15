# Dashboard Components / 仪表盘组件

实时数据监控仪表盘组件库，用于显示关键指标和系统状态。
Real-time data monitoring dashboard components for displaying key metrics and system status.

## Components / 组件

### Gauge.svelte - 仪表盘组件

圆形仪表盘，用于显示数值型指标。
Circular gauge for displaying numeric metrics.

**Props:**
- `value: number` - 当前值 / Current value
- `unit: string` - 单位 / Unit
- `label: string` - 标签 / Label
- `min: number` - 最小值 / Minimum value (default: 0)
- `max: number` - 最大值 / Maximum value (default: 100)
- `warningThreshold: number | null` - 警告阈值 / Warning threshold
- `dangerThreshold: number | null` - 危险阈值 / Danger threshold

**Usage:**
```svelte
<Gauge 
  value={75} 
  unit="Hz" 
  label="检测速度 / Detection Speed"
  min={0}
  max={100}
  warningThreshold={80}
  dangerThreshold={90}
/>
```

### ProgressBar.svelte - 进度条组件

水平进度条，用于显示检测进度。
Horizontal progress bar for displaying detection progress.

**Props:**
- `progress: number` - 进度百分比 (0-100) / Progress percentage (0-100)
- `label: string` - 标签 / Label
- `status: string` - 状态文本 / Status text
- `showPercentage: boolean` - 显示百分比 / Show percentage (default: true)
- `animated: boolean` - 动画效果 / Animated effect (default: true)

**Usage:**
```svelte
<ProgressBar 
  progress={65} 
  label="检测进度 / Detection Progress"
  status="进行中 / In Progress"
/>
```

### StatusIndicator.svelte - 状态指示器组件

显示设备状态和详细信息。
Displays device status and detailed information.

**Props:**
- `status: 'idle' | 'running' | 'paused' | 'error' | 'warning'` - 状态 / Status
- `label: string` - 标签 / Label
- `details: Array<{ label: string; value: string }>` - 详细信息 / Details
- `showWarning: boolean` - 显示警告图标 / Show warning icon

**Usage:**
```svelte
<StatusIndicator 
  status="running"
  label="设备状态 / Device Status"
  details={[
    { label: '增益 / Gain', value: '60 dB' },
    { label: '滤波器 / Filter', value: 'bandpass' }
  ]}
/>
```

## Design Guidelines / 设计指南

### Color Scheme / 颜色方案
- Primary: `var(--primary-orange)` - 主要指标
- Success: `var(--success)` - 正常运行状态
- Warning: `var(--warning)` - 警告状态
- Error: `var(--error)` - 错误状态
- Background: `var(--bg-dark)`, `var(--bg-medium)`, `var(--bg-light)`

### Typography / 字体
- Titles: 14px, uppercase, letter-spacing: 0.5px
- Values: 'Roboto Mono', bold
- Labels: 13px, secondary color

### Animations / 动画
- Smooth transitions (0.3s ease)
- Pulse effect for active states
- Shimmer effect for progress bars

## Integration / 集成

These components are designed to work with the `testingStore` and `testingStats` derived stores:

```svelte
<script>
  import { testingStore, testingStats } from '$lib/stores/testing';
  import Gauge from '$lib/components/dashboard/Gauge.svelte';
  import ProgressBar from '$lib/components/dashboard/ProgressBar.svelte';
  import StatusIndicator from '$lib/components/dashboard/StatusIndicator.svelte';
  
  $: testing = $testingStore;
  $: stats = $testingStats;
</script>

<Gauge 
  value={stats.samplingRate} 
  unit="Hz" 
  label="采样率 / Sampling Rate"
/>

<ProgressBar 
  progress={testing.status === 'running' ? 100 : 0}
  label="检测进度 / Detection Progress"
/>

<StatusIndicator 
  status={testing.status}
  label="设备状态 / Device Status"
/>
```

## Responsive Design / 响应式设计

All components are responsive and adapt to different screen sizes:
- Desktop: Full-size gauges and detailed information
- Tablet: Slightly smaller gauges
- Mobile: Compact layout with essential information

## Accessibility / 可访问性

- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast colors for readability
