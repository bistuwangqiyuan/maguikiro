# 国际标准预设参数 / International Standard Presets

## 概述 / Overview

本模块提供符合国际无损检测标准的预设参数配置，支持快速应用标准参数组合，确保检测过程符合行业规范。

This module provides preset parameter configurations compliant with international non-destructive testing (NDT) standards, enabling quick application of standard parameter combinations to ensure testing processes meet industry specifications.

## 支持的标准 / Supported Standards

### 1. ASME Section V, Article 7
- **标准名称**: 美国机械工程师协会无损检测标准 - 磁粉检测
- **Standard Name**: ASME Boiler and Pressure Vessel Code - Magnetic Particle Testing
- **应用场景**: 压力容器、锅炉等设备的磁粉检测
- **Application**: Magnetic particle testing of pressure vessels, boilers, and related equipment
- **参考文档**: https://www.asme.org/codes-standards/find-codes-standards/bpvc-v-nde

**预设参数 / Preset Parameters:**
- 增益 (Gain): 60 dB
- 滤波器 (Filter): 带通 (Bandpass)
- 速度 (Velocity): 1.0 m/s
- 阈值 (Threshold): 1.2
- 闸门A (Gate A): 起始 0, 宽度 100, 报警阈值 1.5
- 闸门B (Gate B): 起始 100, 宽度 100, 报警阈值 2.0

### 2. ISO 9712 Level 2
- **标准名称**: ISO无损检测人员资格认证标准 - 二级操作员
- **Standard Name**: ISO Qualification and Certification of NDT Personnel - Level 2
- **应用场景**: 二级无损检测人员的资格认证和操作规范
- **Application**: Qualification and operational standards for Level 2 NDT personnel
- **参考文档**: https://www.iso.org/standard/57037.html

**预设参数 / Preset Parameters:**
- 增益 (Gain): 55 dB
- 滤波器 (Filter): 带通 (Bandpass)
- 速度 (Velocity): 0.8 m/s
- 阈值 (Threshold): 1.0
- 闸门A (Gate A): 起始 0, 宽度 120, 报警阈值 1.3
- 闸门B (Gate B): 起始 120, 宽度 120, 报警阈值 1.8

### 3. EN 10228
- **标准名称**: 欧洲标准 - 钢锻件无损检测
- **Standard Name**: European Standard - Non-destructive Testing of Steel Forgings
- **应用场景**: 钢锻件的磁粉检测
- **Application**: Magnetic particle testing of steel forgings
- **参考文档**: https://www.en-standard.eu/bs-en-10228-3-2016-non-destructive-testing-of-steel-forgings-magnetic-particle-inspection/

**预设参数 / Preset Parameters:**
- 增益 (Gain): 65 dB
- 滤波器 (Filter): 低通 (Lowpass)
- 速度 (Velocity): 1.2 m/s
- 阈值 (Threshold): 1.4
- 闸门A (Gate A): 起始 0, 宽度 80, 报警阈值 1.6
- 闸门B (Gate B): 起始 80, 宽度 80, 报警阈值 2.2

### 4. ASTM E709
- **标准名称**: 美国材料试验协会标准 - 磁粉检测指南
- **Standard Name**: ASTM Standard Guide for Magnetic Particle Testing
- **应用场景**: 铁磁性材料的磁粉检测通用指南
- **Application**: General guide for magnetic particle testing of ferromagnetic materials
- **参考文档**: https://www.astm.org/e0709-21.html

**预设参数 / Preset Parameters:**
- 增益 (Gain): 58 dB
- 滤波器 (Filter): 带通 (Bandpass)
- 速度 (Velocity): 0.9 m/s
- 阈值 (Threshold): 1.1
- 闸门A (Gate A): 起始 0, 宽度 110, 报警阈值 1.4
- 闸门B (Gate B): 起始 110, 宽度 110, 报警阈值 1.9

### 5. Custom (自定义)
- **说明**: 用户自定义参数配置
- **Description**: User-defined parameter configuration
- **应用场景**: 特殊检测需求或非标准应用
- **Application**: Special testing requirements or non-standard applications

## 使用方法 / Usage

### 在组件中使用 / Using in Components

```typescript
import { getAllPresets, getPresetById, getPresetParameters } from '$lib/utils/standard-presets';

// 获取所有预设
const presets = getAllPresets();

// 根据ID获取特定预设
const asmePreset = getPresetById('ASME-V-Article-7');

// 获取预设参数
const parameters = getPresetParameters('ISO-9712-Level-2');
```

### 应用预设参数 / Applying Preset Parameters

```typescript
import { testingStore } from '$lib/stores/testing';
import { getPresetParameters } from '$lib/utils/standard-presets';

// 应用ASME标准预设
const asmeParams = getPresetParameters('ASME-V-Article-7');
if (asmeParams) {
  await testingStore.updateParameters(asmeParams);
}
```

### 检测参数匹配 / Detecting Parameter Match

```typescript
import { matchPreset } from '$lib/utils/standard-presets';

// 检查当前参数是否匹配某个标准
const currentStandard = matchPreset(currentParameters);
// 返回: 'ASME-V-Article-7', 'ISO-9712-Level-2', 'EN-10228', 'ASTM-E709', 或 'CUSTOM'
```

## API 参考 / API Reference

### Types

#### `StandardPreset`
```typescript
interface StandardPreset {
  id: string;                    // 预设ID
  name: string;                  // 中文名称
  nameEn: string;                // 英文名称
  description: string;           // 中文描述
  descriptionEn: string;         // 英文描述
  standard: string;              // 标准代码
  referenceUrl?: string;         // 参考文档链接
  parameters: TestingParameters; // 预设参数
}
```

### Functions

#### `getAllPresets(): StandardPreset[]`
获取所有标准预设列表。

Returns all standard presets.

#### `getPresetById(id: string): StandardPreset | undefined`
根据ID获取特定的标准预设。

Gets a specific standard preset by ID.

**Parameters:**
- `id`: 预设ID (如 'ASME-V-Article-7')

**Returns:**
- 标准预设对象，如果未找到则返回 `undefined`

#### `getPresetParameters(id: string): TestingParameters | undefined`
获取标准预设的参数配置。

Gets the parameter configuration from a standard preset.

**Parameters:**
- `id`: 预设ID

**Returns:**
- 参数对象的副本，如果未找到则返回 `undefined`

#### `matchPreset(parameters: TestingParameters): string | null`
检查给定参数是否匹配某个标准预设。

Checks if the given parameters match a standard preset.

**Parameters:**
- `parameters`: 要检查的参数对象

**Returns:**
- 匹配的预设ID，如果不匹配任何预设则返回 'CUSTOM'

## 集成示例 / Integration Example

### 在参数设置面板中集成 / Integration in Parameter Panel

```svelte
<script lang="ts">
  import { getAllPresets, getPresetParameters, matchPreset } from '$lib/utils/standard-presets';
  import type { TestingParameters } from '$lib/types/signal';

  let presets = getAllPresets();
  let selectedStandard = 'CUSTOM';
  let parameters: TestingParameters = { /* ... */ };

  // 监听参数变化，自动检测匹配的标准
  $: selectedStandard = matchPreset(parameters);

  // 处理标准选择变化
  function handleStandardChange(event: Event) {
    const standardId = (event.target as HTMLSelectElement).value;
    selectedStandard = standardId;

    if (standardId !== 'CUSTOM') {
      const presetParams = getPresetParameters(standardId);
      if (presetParams) {
        parameters = { ...presetParams };
      }
    }
  }
</script>

<select value={selectedStandard} on:change={handleStandardChange}>
  {#each presets as preset}
    <option value={preset.id}>
      {preset.name} / {preset.nameEn}
    </option>
  {/each}
</select>
```

## 扩展标准 / Extending Standards

要添加新的标准预设，请在 `standard-presets.ts` 文件的 `STANDARD_PRESETS` 对象中添加新条目：

To add a new standard preset, add a new entry to the `STANDARD_PRESETS` object in `standard-presets.ts`:

```typescript
export const STANDARD_PRESETS: Record<string, StandardPreset> = {
  // ... 现有预设
  
  'NEW-STANDARD': {
    id: 'NEW-STANDARD',
    name: '新标准名称',
    nameEn: 'New Standard Name',
    description: '标准描述',
    descriptionEn: 'Standard description',
    standard: 'NEW-STANDARD',
    referenceUrl: 'https://example.com/standard',
    parameters: {
      gain: 60,
      filter: 'bandpass',
      velocity: 1.0,
      gateA: { /* ... */ },
      gateB: { /* ... */ },
      threshold: 1.0
    }
  }
};
```

## 注意事项 / Notes

1. **参数验证**: 应用预设参数前，系统会自动验证参数的有效性
2. **自动检测**: 当用户手动修改参数时，系统会自动检测是否仍匹配某个标准
3. **参数副本**: `getPresetParameters` 返回参数的副本，避免意外修改原始预设
4. **标准符合性**: 预设参数基于标准文档设置，但实际应用时应根据具体情况调整

1. **Parameter Validation**: The system automatically validates parameter validity before applying presets
2. **Auto-detection**: When users manually modify parameters, the system automatically detects if they still match a standard
3. **Parameter Copy**: `getPresetParameters` returns a copy of parameters to avoid accidental modification of original presets
4. **Standard Compliance**: Preset parameters are based on standard documentation but should be adjusted according to specific situations in actual applications

## 演示页面 / Demo Page

访问 `/demo-standards` 查看国际标准预设参数的完整演示。

Visit `/demo-standards` to see a complete demonstration of international standard presets.

## 相关文件 / Related Files

- `src/lib/utils/standard-presets.ts` - 预设配置定义
- `src/lib/components/settings/ParameterPanel.svelte` - 参数面板组件
- `src/routes/demo-standards/+page.svelte` - 演示页面
- `src/lib/types/signal.ts` - 类型定义
- `src/lib/utils/constants.ts` - 常量定义
