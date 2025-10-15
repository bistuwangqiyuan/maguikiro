# 国际标准预设参数 - 快速使用指南 / Quick Usage Guide

## 快速开始 / Quick Start

### 1. 在参数设置面板中使用 / Using in Parameter Panel

参数设置面板现在包含标准选择功能：

1. 打开参数设置面板
2. 在顶部找到 "检测标准 (Standard)" 下拉框
3. 选择您需要的国际标准
4. 参数会自动应用
5. 查看标准说明和参考文档
6. 点击"保存参数"保存配置

### 2. 查看演示 / View Demo

访问演示页面查看完整功能：
```
http://localhost:5173/demo-standards
```

## 支持的标准 / Supported Standards

### ASME V 第7章 / ASME Section V, Article 7
适用于压力容器和锅炉的磁粉检测
- 增益: 60 dB
- 滤波器: 带通
- 速度: 1.0 m/s

### ISO 9712 二级 / ISO 9712 Level 2
二级无损检测人员资格认证标准
- 增益: 55 dB
- 滤波器: 带通
- 速度: 0.8 m/s

### EN 10228
欧洲钢锻件无损检测标准
- 增益: 65 dB
- 滤波器: 低通
- 速度: 1.2 m/s

### ASTM E709
美国磁粉检测标准指南
- 增益: 58 dB
- 滤波器: 带通
- 速度: 0.9 m/s

## 常见问题 / FAQ

### Q: 如何知道当前使用的是哪个标准？
A: 参数设置面板顶部的下拉框会显示当前匹配的标准。如果手动修改了参数，会自动切换到"自定义"。

### Q: 可以在应用标准后修改参数吗？
A: 可以。应用标准后，您可以根据实际需求微调任何参数。系统会自动检测并切换到"自定义"模式。

### Q: 标准参数是否可以修改？
A: 预设的标准参数是固定的，确保符合国际标准。但您可以应用标准后进行调整，或使用"自定义"模式。

### Q: 如何添加新的标准？
A: 请参考 `STANDARD_PRESETS_README.md` 中的"扩展标准"部分。

## 开发者指南 / Developer Guide

### 在代码中使用预设 / Using Presets in Code

```typescript
import { getPresetParameters } from '$lib/utils/standard-presets';

// 获取 ASME 标准参数
const params = getPresetParameters('ASME-V-Article-7');
if (params) {
  // 使用参数
  console.log('增益:', params.gain);
}
```

### 检测参数匹配 / Detecting Parameter Match

```typescript
import { matchPreset } from '$lib/utils/standard-presets';

const currentStandard = matchPreset(myParameters);
console.log('当前标准:', currentStandard);
// 输出: 'ASME-V-Article-7' 或 'CUSTOM'
```

### 获取所有预设 / Getting All Presets

```typescript
import { getAllPresets } from '$lib/utils/standard-presets';

const presets = getAllPresets();
presets.forEach(preset => {
  console.log(preset.name, preset.nameEn);
});
```

## 相关文件 / Related Files

- 📄 `standard-presets.ts` - 预设配置和工具函数
- 📄 `STANDARD_PRESETS_README.md` - 完整文档
- 📄 `ParameterPanel.svelte` - 参数设置面板
- 📄 `/demo-standards` - 演示页面

## 技术支持 / Technical Support

如有问题，请查看：
1. 完整文档: `STANDARD_PRESETS_README.md`
2. 演示页面: `/demo-standards`
3. 任务总结: `TASK_20_SUMMARY.md`
4. 验证文档: `TASK_20_VERIFICATION.md`
