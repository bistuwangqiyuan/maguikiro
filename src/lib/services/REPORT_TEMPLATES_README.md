# 报告模板系统 / Report Template System

## 概述 / Overview

报告模板系统提供了符合国际标准的报告格式，支持 ASME、ISO、EN、ASTM 等标准。系统允许自定义模板内容、变量替换和签名配置。

The report template system provides standardized report formats compliant with international standards including ASME, ISO, EN, and ASTM. The system allows custom template content, variable replacement, and signature configuration.

## 可用模板 / Available Templates

### 1. ASME Section V Article 7
- **标准**: ASME Section V, Article 7 - Magnetic Particle Testing
- **适用**: 压力容器、管道、结构件的磁粉检测
- **签名**: 操作员 + 检验员

### 2. ISO 9712
- **标准**: ISO 9712 - Non-destructive Testing Personnel Qualification
- **适用**: 国际通用的无损检测报告
- **签名**: 操作员 + 检验员 + 审核员

### 3. EN 10228
- **标准**: EN 10228 - Non-destructive Testing of Steel Forgings
- **适用**: 钢锻件的无损检测
- **签名**: 操作员 + 检验员 + 批准人

### 4. ASTM E709
- **标准**: ASTM E709 - Standard Guide for Magnetic Particle Testing
- **适用**: 美国材料试验协会标准
- **签名**: 操作员 + 检验员

### 5. Custom Template
- **标准**: 自定义
- **适用**: 特殊要求的报告格式
- **签名**: 可配置

## 使用方法 / Usage

### 基本使用 / Basic Usage

```typescript
import { ReportGenerator } from '$lib/services/report-generator';
import { getReportTemplate } from '$lib/services/report-templates';

// 创建报告生成器
const generator = new ReportGenerator();

// 获取模板
const template = getReportTemplate('ASME');

// 生成报告
const pdfBlob = await generator.generateReport(
  sessionData,
  'John Doe',
  {
    template: template,
    companyName: 'DOPPLER Industries',
    equipmentModel: 'MT-2000',
    testLocation: 'Factory A',
    customerName: 'ABC Corporation',
    partNumber: 'P-12345',
    materialType: 'Carbon Steel'
  }
);
```

### 选择标准模板 / Select Standard Template

```typescript
import { getReportTemplate } from '$lib/services/report-templates';

// 通过标准名称获取模板
const asmeTemplate = getReportTemplate('ASME');
const isoTemplate = getReportTemplate('ISO');
const enTemplate = getReportTemplate('EN');
const astmTemplate = getReportTemplate('ASTM');
const customTemplate = getReportTemplate('custom');
```

### 获取所有模板 / Get All Templates

```typescript
import { getAllTemplates } from '$lib/services/report-templates';

const templates = getAllTemplates();

// 在 UI 中显示模板列表
templates.forEach(template => {
  console.log(`${template.name} - ${template.description}`);
});
```

### 模板变量替换 / Template Variable Replacement

```typescript
import { replaceTemplateVariables } from '$lib/services/report-templates';

const text = 'Project: {{projectName}}, Date: {{testDate}}';
const variables = {
  projectName: 'Pipeline Inspection',
  testDate: '2025-01-10'
};

const result = replaceTemplateVariables(text, variables);
// Result: "Project: Pipeline Inspection, Date: 2025-01-10"
```

### 验证模板变量 / Validate Template Variables

```typescript
import { validateTemplateVariables, getReportTemplate } from '$lib/services/report-templates';

const template = getReportTemplate('ASME');
const variables = {
  projectName: 'Test Project',
  testDate: '2025-01-10',
  operator: 'John Doe'
  // Missing some required fields...
};

const validation = validateTemplateVariables(template, variables);

if (!validation.valid) {
  console.error('Missing fields:', validation.missingFields);
}
```

## 模板结构 / Template Structure

### ReportTemplate 接口

```typescript
interface ReportTemplate {
  id: string;                    // 模板唯一标识
  name: string;                  // 模板名称
  standard: InternationalStandard; // 标准类型
  description: string;           // 模板描述
  
  header: {
    title: string;               // 报告标题
    subtitle: string;            // 副标题
    standardReference: string;   // 标准引用
    includeCompanyLogo?: boolean; // 是否包含公司 Logo
    includeDate?: boolean;       // 是否包含日期
  };
  
  sections: ReportTemplateSection[]; // 报告章节
  
  footer?: {
    includePageNumbers?: boolean; // 是否包含页码
    customText?: string;         // 自定义页脚文本
  };
  
  signatures: {
    operator: boolean;           // 操作员签名
    inspector: boolean;          // 检验员签名
    reviewer?: boolean;          // 审核员签名
    approver?: boolean;          // 批准人签名
  };
}
```

### ReportTemplateSection 接口

```typescript
interface ReportTemplateSection {
  title: string;                 // 章节标题
  fields?: string[];             // 字段列表
  content?: 'waveform' | 'data-table' | 'defect-table' | 'defect-statistics' | 'custom';
  customContent?: string;        // 自定义内容
  required?: boolean;            // 是否必需
}
```

## 自定义模板 / Custom Templates

### 创建自定义模板

```typescript
import type { ReportTemplate } from '$lib/services/report-templates';

const myCustomTemplate: ReportTemplate = {
  id: 'my-custom-template',
  name: 'My Custom Template',
  standard: 'custom',
  description: 'Custom report for special requirements',
  
  header: {
    title: 'Special Testing Report',
    subtitle: 'Custom Format',
    standardReference: 'Internal Standard XYZ-123',
    includeCompanyLogo: true,
    includeDate: true
  },
  
  sections: [
    {
      title: 'Project Information',
      fields: ['projectName', 'testDate', 'operator'],
      required: true
    },
    {
      title: 'Custom Section',
      customContent: 'This is custom content with {{projectName}}',
      required: false
    },
    {
      title: 'Waveform',
      content: 'waveform',
      required: true
    }
  ],
  
  signatures: {
    operator: true,
    inspector: true
  }
};
```

## 配置选项 / Configuration Options

### ReportGenerationConfig

```typescript
interface ReportGenerationConfig {
  standard?: InternationalStandard;  // 标准类型
  template?: ReportTemplate;         // 自定义模板
  includeWaveform?: boolean;         // 包含波形图
  includeDataTable?: boolean;        // 包含数据表
  includeDefectDetails?: boolean;    // 包含缺陷详情
  companyLogo?: string;              // 公司 Logo (base64 或 URL)
  companyName?: string;              // 公司名称
  operatorSignature?: string;        // 操作员签名 (base64)
  equipmentModel?: string;           // 设备型号
  equipmentSerial?: string;          // 设备序列号
  testLocation?: string;             // 测试地点
  customerName?: string;             // 客户名称
  partNumber?: string;               // 零件编号
  materialType?: string;             // 材料类型
}
```

## 模板变量 / Template Variables

### 可用变量列表

| 变量名 | 描述 | 示例 |
|--------|------|------|
| `projectName` | 项目名称 | "Pipeline Inspection" |
| `testDate` | 测试日期 | "2025-01-10 14:30:00" |
| `operator` | 操作员 | "John Doe" |
| `sessionId` | 会话 ID | "abc123..." |
| `status` | 状态 | "COMPLETED" |
| `duration` | 持续时间 | "15m 30s" |
| `companyName` | 公司名称 | "DOPPLER Industries" |
| `equipmentModel` | 设备型号 | "MT-2000" |
| `equipmentSerial` | 设备序列号 | "SN-12345" |
| `testLocation` | 测试地点 | "Factory A" |
| `customerName` | 客户名称 | "ABC Corporation" |
| `partNumber` | 零件编号 | "P-12345" |
| `materialType` | 材料类型 | "Carbon Steel" |

### 在模板中使用变量

在模板的 `customContent` 中使用 `{{variableName}}` 语法：

```typescript
{
  title: 'Project Details',
  customContent: 'Testing project {{projectName}} for customer {{customerName}}. Part number: {{partNumber}}, Material: {{materialType}}.'
}
```

## 最佳实践 / Best Practices

### 1. 选择合适的模板

根据项目要求和客户需求选择合适的标准模板：
- 压力容器项目 → ASME
- 国际项目 → ISO
- 欧洲项目 → EN
- 美国项目 → ASTM

### 2. 提供完整的配置信息

确保提供所有必需的配置信息，避免报告中出现 "N/A"：

```typescript
const config: ReportGenerationConfig = {
  standard: 'ASME',
  companyName: 'Your Company',
  equipmentModel: 'MT-2000',
  equipmentSerial: 'SN-12345',
  testLocation: 'Factory A',
  customerName: 'Customer Name',
  partNumber: 'P-12345',
  materialType: 'Carbon Steel'
};
```

### 3. 验证模板变量

在生成报告前验证所有必需的变量：

```typescript
const validation = validateTemplateVariables(template, variables);
if (!validation.valid) {
  // 提示用户补充缺失的信息
  alert(`Please provide: ${validation.missingFields.join(', ')}`);
  return;
}
```

### 4. 添加公司 Logo

提供 base64 编码的 Logo 图片：

```typescript
const config = {
  companyLogo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
};
```

### 5. 自定义签名

根据组织要求配置签名：

```typescript
const template = {
  ...asmeReportTemplate,
  signatures: {
    operator: true,
    inspector: true,
    reviewer: true,  // 添加审核员
    approver: true   // 添加批准人
  }
};
```

## 示例 / Examples

### 完整示例：生成 ASME 报告

```typescript
import { ReportGenerator } from '$lib/services/report-generator';
import { getReportTemplate } from '$lib/services/report-templates';

async function generateASMEReport(sessionData, operatorName) {
  const generator = new ReportGenerator();
  const template = getReportTemplate('ASME');
  
  const config = {
    template: template,
    companyName: 'DOPPLER Industries',
    companyLogo: 'data:image/png;base64,...',
    equipmentModel: 'MT-2000',
    equipmentSerial: 'SN-12345',
    testLocation: 'Factory A, Building 3',
    customerName: 'ABC Corporation',
    partNumber: 'P-12345-REV-A',
    materialType: 'ASTM A516 Grade 70',
    includeWaveform: true,
    includeDataTable: true,
    includeDefectDetails: true
  };
  
  const pdfBlob = await generator.generateReport(
    sessionData,
    operatorName,
    config
  );
  
  // 下载 PDF
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report-${sessionData.id}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
```

## 故障排除 / Troubleshooting

### 问题：缺少必需字段

**症状**: 报告中显示 "N/A"

**解决方案**: 在配置中提供所有必需的字段

```typescript
const config = {
  // 确保提供所有字段
  equipmentModel: 'MT-2000',
  testLocation: 'Factory A',
  // ...
};
```

### 问题：Logo 不显示

**症状**: 公司 Logo 未出现在报告中

**解决方案**: 
1. 确保 Logo 是 base64 编码的图片
2. 检查图片格式（支持 PNG、JPEG）
3. 确保模板启用了 `includeCompanyLogo`

```typescript
const config = {
  companyLogo: 'data:image/png;base64,iVBORw0KGgo...',
};

const template = {
  ...asmeReportTemplate,
  header: {
    ...asmeReportTemplate.header,
    includeCompanyLogo: true
  }
};
```

### 问题：波形图未包含

**症状**: 报告中没有波形图

**解决方案**: 
1. 确保页面中存在 `id="waveform-chart"` 的元素
2. 确保配置中 `includeWaveform` 不是 `false`

```typescript
const config = {
  includeWaveform: true
};
```

## 扩展 / Extensions

### 添加新的标准模板

1. 在 `report-templates.ts` 中定义新模板
2. 添加到 `reportTemplates` 对象
3. 更新 `InternationalStandard` 类型

```typescript
// 1. 定义模板
export const myNewTemplate: ReportTemplate = {
  // ...
};

// 2. 添加到集合
export const reportTemplates = {
  'ASME': asmeReportTemplate,
  'ISO': isoReportTemplate,
  'EN': enReportTemplate,
  'ASTM': astmReportTemplate,
  'MY_NEW': myNewTemplate,  // 新增
  'custom': customReportTemplate
};
```

### 添加自定义章节类型

扩展 `ReportTemplateSection` 的 `content` 类型：

```typescript
interface ReportTemplateSection {
  content?: 'waveform' | 'data-table' | 'defect-table' | 'defect-statistics' | 'my-custom-content' | 'custom';
}
```

然后在 `ReportGenerator.addTemplateSection()` 中处理新类型。

## 参考 / References

- [ASME Section V](https://www.asme.org/codes-standards/find-codes-standards/bpvc-section-v-nondestructive-examination)
- [ISO 9712](https://www.iso.org/standard/57037.html)
- [EN 10228](https://www.en-standard.eu/bs-en-10228-1-2016-non-destructive-testing-of-steel-forgings-magnetic-particle-inspection/)
- [ASTM E709](https://www.astm.org/e0709-15.html)
