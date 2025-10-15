# Dashboard Components Usage Guide / 仪表盘组件使用指南

## 快速开始 / Quick Start

### 安装 / Installation
组件已包含在项目中，无需额外安装。
Components are included in the project, no additional installation needed.

### 导入 / Import
```svelte
<script>
  import Gauge from '$lib/components/dashboard/Gauge.svelte';
  import ProgressBar from '$lib/components/dashboard/ProgressBar.svelte';
  import StatusIndicator from '$lib/components/dashboard/StatusIndicator.svelte';
</script>
```

## 组件详解 / Component Details

### 1. Gauge - 仪表盘组件

#### 基础用法 / Basic Usage
```svelte
<Gauge 
  value={85} 
  unit="Hz" 
  label="采样率 / Sampling Rate"
/>
```

#### 带阈值的用法 / With Thresholds
```svelte
<Gauge 
  value={currentValue} 
  unit="V" 
  label="信号强度 / Signal Strength"
  min={0}
  max={5}
  warningThreshold={3}
  dangerThreshold={4}
/>
```

#### Props说明 / Props Description
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | number | 0 | 当前值 / Current value |
| unit | string | '' | 单位 / Unit |
| label | string | '' | 标签 / Label |
| min | number | 0 | 最小值 / Minimum |
| max | number | 100 | 最大值 / Maximum |
| warningThreshold | number \| null | null | 警告阈值 / Warning threshold |
| dangerThreshold | number \| null | null | 危险阈值 / Danger threshold |

#### 颜色规则 / Color Rules
- **正常** (Normal): 橙色 `var(--primary-orange)` - value < warningThreshold
- **警告** (Warning): 黄色 `var(--warning)` - warningThreshold ≤ value < dangerThreshold
- **危险** (Danger): 红色 `var(--error)` - value ≥ dangerThreshold

#### 使用场景 / Use Cases
- 检测速度监控
- 信号强度显示
- 温度监控
- 压力监控
- 任何需要显示数值范围的场景

---

### 2. ProgressBar - 进度条组件

#### 基础用法 / Basic Usage
```svelte
<ProgressBar 
  progress={65} 
  label="检测进度 / Detection Progress"
/>
```

#### 完整用法 / Full Usage
```svelte
<ProgressBar 
  progress={currentProgress}
  label="数据上传 / Data Upload"
  status="上传中 / Uploading"
  showPercentage={true}
  animated={true}
/>
```

#### Props说明 / Props Description
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| progress | number | 0 | 进度值 (0-100) / Progress (0-100) |
| label | string | '' | 标签 / Label |
| status | string | '' | 状态文本 / Status text |
| showPercentage | boolean | true | 显示百分比 / Show percentage |
| animated | boolean | true | 动画效果 / Animated effect |

#### 动画效果 / Animation Effects
- **流光动画** (Shimmer): 当 `animated={true}` 时启用
- **平滑过渡** (Smooth Transition): 进度变化时自动应用

#### 使用场景 / Use Cases
- 检测进度显示
- 文件上传进度
- 数据处理进度
- 校准进度
- 任何需要显示完成度的场景

---

### 3. StatusIndicator - 状态指示器组件

#### 基础用法 / Basic Usage
```svelte
<StatusIndicator 
  status="running"
  label="设备状态 / Device Status"
/>
```

#### 带详情的用法 / With Details
```svelte
<StatusIndicator 
  status="running"
  label="设备状态 / Device Status"
  details={[
    { label: '增益 / Gain', value: '60 dB' },
    { label: '滤波器 / Filter', value: 'bandpass' },
    { label: '速度 / Velocity', value: '1.5 m/s' }
  ]}
/>
```

#### 带警告的用法 / With Warning
```svelte
<StatusIndicator 
  status="warning"
  label="系统警告 / System Warning"
  details={[
    { label: '警告类型 / Type', value: '信号异常' }
  ]}
  showWarning={true}
/>
```

#### Props说明 / Props Description
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| status | 'idle' \| 'running' \| 'paused' \| 'error' \| 'warning' | 'idle' | 状态 / Status |
| label | string | '' | 标签 / Label |
| details | Array<{label: string, value: string}> | [] | 详情列表 / Details list |
| showWarning | boolean | false | 显示警告图标 / Show warning icon |

#### 状态说明 / Status Description
| Status | Color | Icon | Description |
|--------|-------|------|-------------|
| idle | 灰色 / Gray | ● | 待机状态 / Idle |
| running | 绿色 / Green | ● | 运行中（带脉冲动画）/ Running (with pulse) |
| paused | 黄色 / Yellow | ● | 已暂停 / Paused |
| error | 红色 / Red | ⚠ | 错误 / Error |
| warning | 黄色 / Yellow | ⚠ | 警告 / Warning |

#### 使用场景 / Use Cases
- 设备状态显示
- 系统健康监控
- 连接状态显示
- 任务状态显示
- 任何需要显示状态的场景

---

## 完整示例 / Complete Example

### 集成testingStore的仪表盘 / Dashboard with testingStore

```svelte
<script lang="ts">
  import { testingStore, testingStats } from '$lib/stores/testing';
  import Gauge from '$lib/components/dashboard/Gauge.svelte';
  import ProgressBar from '$lib/components/dashboard/ProgressBar.svelte';
  import StatusIndicator from '$lib/components/dashboard/StatusIndicator.svelte';
  
  $: testing = $testingStore;
  $: stats = $testingStats;
  
  // 计算当前信号强度
  $: currentAmplitude = testing.processedBuffer.length > 0 
    ? Math.abs(testing.processedBuffer[testing.processedBuffer.length - 1].amplitude)
    : 0;
  
  // 状态详情
  $: statusDetails = [
    { label: '增益 / Gain', value: `${testing.currentSession?.parameters.gain || 0} dB` },
    { label: '滤波器 / Filter', value: testing.currentSession?.parameters.filter || 'N/A' }
  ];
</script>

<div class="dashboard-grid">
  <!-- 检测速度 -->
  <div class="card">
    <Gauge 
      value={stats.samplingRate} 
      unit="Hz" 
      label="检测速度 / Detection Speed"
      min={0}
      max={120}
      warningThreshold={100}
      dangerThreshold={110}
    />
  </div>
  
  <!-- 信号强度 -->
  <div class="card">
    <Gauge 
      value={currentAmplitude} 
      unit="V" 
      label="信号强度 / Signal Strength"
      min={0}
      max={5}
      warningThreshold={3}
      dangerThreshold={4}
    />
  </div>
  
  <!-- 检测进度 -->
  <div class="card">
    <ProgressBar 
      progress={testing.status === 'running' ? 100 : 0}
      label="检测进度 / Detection Progress"
      status={testing.status === 'running' ? '进行中' : '未开始'}
    />
  </div>
  
  <!-- 设备状态 -->
  <div class="card">
    <StatusIndicator 
      status={testing.status}
      label="设备状态 / Device Status"
      details={statusDetails}
    />
  </div>
</div>

<style>
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }
  
  .card {
    background: var(--bg-medium);
    border: 2px solid var(--bg-light);
    border-radius: 12px;
    padding: 24px;
  }
</style>
```

---

## 样式定制 / Style Customization

### CSS变量 / CSS Variables
组件使用以下CSS变量，可以在全局或局部覆盖：

```css
:root {
  /* 主色调 */
  --primary-orange: #FF6B35;
  --primary-orange-light: #FF8555;
  
  /* 背景色 */
  --bg-dark: #1A1A1A;
  --bg-medium: #2D2D2D;
  --bg-light: #3D3D3D;
  
  /* 文字颜色 */
  --text-primary: #FFFFFF;
  --text-secondary: #B0B0B0;
  --text-disabled: #666666;
  
  /* 状态颜色 */
  --success: #4CAF50;
  --warning: #FFC107;
  --error: #F44336;
  --info: #2196F3;
}
```

### 自定义样式 / Custom Styles
可以通过包装div添加自定义样式：

```svelte
<div class="custom-gauge">
  <Gauge value={85} unit="Hz" label="Custom Styled Gauge" />
</div>

<style>
  .custom-gauge {
    /* 自定义边框 */
    border: 3px solid gold;
    border-radius: 16px;
    padding: 20px;
    
    /* 自定义背景 */
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  }
</style>
```

---

## 响应式设计 / Responsive Design

### 断点建议 / Breakpoint Recommendations

```css
/* 桌面 - 多列网格 */
@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 平板 - 两列网格 */
@media (min-width: 768px) and (max-width: 1023px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 移动 - 单列堆叠 */
@media (max-width: 767px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 性能优化建议 / Performance Tips

### 1. 避免频繁更新
```svelte
<!-- ❌ 不推荐：每次都创建新对象 -->
<StatusIndicator 
  details={[
    { label: 'Gain', value: `${gain} dB` }
  ]}
/>

<!-- ✅ 推荐：使用派生变量 -->
<script>
  $: statusDetails = [
    { label: 'Gain', value: `${gain} dB` }
  ];
</script>
<StatusIndicator details={statusDetails} />
```

### 2. 使用派生store
```svelte
<script>
  import { derived } from 'svelte/store';
  import { testingStore } from '$lib/stores/testing';
  
  // ✅ 使用派生store避免重复计算
  const currentAmplitude = derived(
    testingStore,
    $testing => $testing.processedBuffer.length > 0 
      ? Math.abs($testing.processedBuffer[$testing.processedBuffer.length - 1].amplitude)
      : 0
  );
</script>

<Gauge value={$currentAmplitude} unit="V" label="Signal" />
```

### 3. 条件渲染
```svelte
<!-- ✅ 只在需要时渲染 -->
{#if showDashboard}
  <Gauge value={value} unit="Hz" label="Speed" />
{/if}
```

---

## 常见问题 / FAQ

### Q1: 如何改变仪表盘的颜色？
A: 使用CSS变量覆盖：
```css
:root {
  --primary-orange: #your-color;
}
```

### Q2: 如何禁用动画？
A: 对于ProgressBar，设置 `animated={false}`

### Q3: 如何自定义状态颜色？
A: 修改StatusIndicator组件内的statusConfig对象

### Q4: 仪表盘数值不更新？
A: 确保使用响应式语法 `$:` 或 Svelte store

### Q5: 如何添加更多详情项？
A: 向details数组添加更多对象：
```svelte
<StatusIndicator 
  details={[
    { label: 'Item 1', value: 'Value 1' },
    { label: 'Item 2', value: 'Value 2' },
    { label: 'Item 3', value: 'Value 3' }
  ]}
/>
```

---

## 最佳实践 / Best Practices

### 1. 使用语义化标签
```svelte
<!-- ✅ 好 -->
<Gauge value={speed} unit="Hz" label="检测速度 / Detection Speed" />

<!-- ❌ 不好 -->
<Gauge value={speed} unit="Hz" label="Speed" />
```

### 2. 提供有意义的状态文本
```svelte
<!-- ✅ 好 -->
<ProgressBar 
  progress={65}
  status="正在处理第 650/1000 个样本"
/>

<!-- ❌ 不好 -->
<ProgressBar progress={65} status="Processing" />
```

### 3. 合理设置阈值
```svelte
<!-- ✅ 好：根据实际需求设置 -->
<Gauge 
  value={temperature}
  warningThreshold={70}  <!-- 70°C开始警告 -->
  dangerThreshold={85}   <!-- 85°C危险 -->
/>
```

### 4. 保持一致的设计
```svelte
<!-- ✅ 好：所有卡片使用相同的样式 -->
<div class="card">
  <Gauge ... />
</div>
<div class="card">
  <ProgressBar ... />
</div>
```

---

## 演示页面 / Demo Pages

### 查看演示 / View Demos
- **组件演示**: `/demo-dashboard` - 所有组件的独立演示
- **集成演示**: `/dashboard` - 完整的仪表盘集成示例

### 运行演示 / Run Demos
```bash
npm run dev
# 访问 http://localhost:5173/demo-dashboard
# 或 http://localhost:5173/dashboard
```

---

## 支持 / Support

如有问题或建议，请查看：
- 组件README: `src/lib/components/dashboard/README.md`
- 任务总结: `TASK_18_SUMMARY.md`
- 验证文档: `TASK_18_VERIFICATION.md`

---

**最后更新 / Last Updated**: 2025-10-12
**版本 / Version**: 1.0.0
