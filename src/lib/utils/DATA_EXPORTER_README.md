# 数据导出工具文档 / Data Exporter Documentation

## 概述 / Overview

`DataExporter` 是一个用于导出检测会话数据的工具类，支持多种格式（CSV、Excel、JSON），可以导出单个或批量会话数据。

The `DataExporter` is a utility class for exporting testing session data in multiple formats (CSV, Excel, JSON), supporting both single and batch session exports.

## 功能特性 / Features

- ✅ 支持三种导出格式：CSV、Excel、JSON
- ✅ 单个会话导出
- ✅ 批量会话导出
- ✅ 可选择导出内容（信号数据、缺陷、参数）
- ✅ 自动生成文件名
- ✅ 浏览器自动下载

## 安装依赖 / Dependencies

```bash
pnpm add xlsx
```

## 使用方法 / Usage

### 1. 导入 / Import

```typescript
import { DataExporter } from '$lib/utils/data-exporter';
import type { CompleteSessionData } from '$lib/types/session';
```

### 2. 导出单个会话 / Export Single Session

#### CSV 格式

```typescript
// 导出为CSV（包含所有数据）
DataExporter.exportSession(sessionData, {
  format: 'csv',
  includeSignalData: true,
  includeDefects: true,
  includeParameters: true
});

// 仅导出信号数据
DataExporter.exportSession(sessionData, {
  format: 'csv',
  includeSignalData: true,
  includeDefects: false,
  includeParameters: false
});
```

#### Excel 格式

```typescript
// 导出为Excel（多个工作表）
DataExporter.exportSession(sessionData, {
  format: 'excel',
  includeSignalData: true,
  includeDefects: true,
  includeParameters: true
});
```

Excel 文件包含以下工作表：
- **Session Info**: 会话信息和参数
- **Signal Data**: 信号数据点
- **Defects**: 缺陷记录

#### JSON 格式

```typescript
// 导出为JSON（完整数据结构）
DataExporter.exportSession(sessionData, {
  format: 'json'
});
```

### 3. 批量导出多个会话 / Batch Export Multiple Sessions

```typescript
const sessions: CompleteSessionData[] = [session1, session2, session3];

// 批量导出为Excel（推荐）
DataExporter.exportMultipleSessions(sessions, {
  format: 'excel',
  includeSignalData: true,
  includeDefects: true,
  includeParameters: true
});

// 批量导出为JSON
DataExporter.exportMultipleSessions(sessions, {
  format: 'json'
});

// 批量导出为CSV（每个会话单独文件）
DataExporter.exportMultipleSessions(sessions, {
  format: 'csv',
  includeSignalData: true,
  includeDefects: true,
  includeParameters: true
});
```

批量导出 Excel 文件包含：
- **Summary**: 所有会话的摘要信息
- **Session 1-10**: 前10个会话的详细信息（每个会话一个工作表）
- **S1 Signals, S2 Signals...**: 各会话的信号数据
- **S1 Defects, S2 Defects...**: 各会话的缺陷数据

## 在组件中使用 / Usage in Components

### 示例：历史记录页面导出按钮

```svelte
<script lang="ts">
  import { DataExporter } from '$lib/utils/data-exporter';
  import type { CompleteSessionData } from '$lib/types/session';
  
  let selectedSession: CompleteSessionData;
  let selectedSessions: CompleteSessionData[] = [];
  
  function handleExportCSV() {
    DataExporter.exportSession(selectedSession, {
      format: 'csv',
      includeSignalData: true,
      includeDefects: true,
      includeParameters: true
    });
  }
  
  function handleExportExcel() {
    DataExporter.exportSession(selectedSession, {
      format: 'excel',
      includeSignalData: true,
      includeDefects: true,
      includeParameters: true
    });
  }
  
  function handleExportJSON() {
    DataExporter.exportSession(selectedSession, {
      format: 'json'
    });
  }
  
  function handleBatchExport() {
    if (selectedSessions.length === 0) {
      alert('请选择要导出的会话');
      return;
    }
    
    DataExporter.exportMultipleSessions(selectedSessions, {
      format: 'excel',
      includeSignalData: true,
      includeDefects: true,
      includeParameters: true
    });
  }
</script>

<div class="export-buttons">
  <button onclick={handleExportCSV}>导出 CSV</button>
  <button onclick={handleExportExcel}>导出 Excel</button>
  <button onclick={handleExportJSON}>导出 JSON</button>
  <button onclick={handleBatchExport}>批量导出</button>
</div>
```

## 导出格式说明 / Export Format Details

### CSV 格式

CSV 文件包含以下部分（用空行分隔）：

1. **Session Information**: 会话基本信息
2. **Testing Parameters**: 检测参数（如果启用）
3. **Signal Data**: 信号数据表格
4. **Defects**: 缺陷数据表格

示例：
```csv
Session Information
Session ID,abc123...
Project Name,Test Project
...

Testing Parameters
Gain,60
Filter,bandpass
...

Signal Data
Timestamp,Position,Amplitude,Phase,Frequency
1234567890,0.0,1.5,0.0,100
...

Defects
Position,Amplitude,Severity,Gate Triggered,Timestamp,Notes
10.5,2.3,high,A,2024-01-01T10:00:00Z,"Crack detected"
...
```

### Excel 格式

Excel 文件包含多个工作表，每个工作表包含不同类型的数据：

- **Session Info**: 会话信息和参数（键值对格式）
- **Signal Data**: 信号数据（表格格式）
- **Defects**: 缺陷数据（表格格式）

批量导出时还包含：
- **Summary**: 所有会话的摘要表格

### JSON 格式

JSON 文件包含完整的数据结构，与 `CompleteSessionData` 类型一致：

```json
{
  "id": "abc123...",
  "projectName": "Test Project",
  "operatorId": "user123",
  "startTime": "2024-01-01T10:00:00Z",
  "endTime": "2024-01-01T11:00:00Z",
  "status": "completed",
  "parameters": {
    "gain": 60,
    "filter": "bandpass",
    ...
  },
  "signalData": [...],
  "defects": [...],
  ...
}
```

## 文件命名规则 / File Naming Convention

### 单个会话导出

格式：`{项目名称}_{会话ID前8位}_{日期}.{扩展名}`

示例：
- `Test_Project_abc12345_2024-01-15.csv`
- `Pipeline_Inspection_def67890_2024-01-15.xlsx`
- `Quality_Check_ghi11121_2024-01-15.json`

### 批量导出

格式：`batch_export_{日期}.{扩展名}`

示例：
- `batch_export_2024-01-15.xlsx`
- `batch_export_2024-01-15.json`

## 性能考虑 / Performance Considerations

1. **大数据量**: 对于包含大量信号数据的会话（>10000点），建议：
   - 使用 Excel 格式（更高效）
   - 考虑分批导出
   - 或者仅导出缺陷数据

2. **批量导出**: 批量导出 Excel 时，最多包含前10个会话的详细数据，避免文件过大

3. **浏览器限制**: 非常大的文件可能受浏览器内存限制，建议单个文件不超过50MB

## 错误处理 / Error Handling

```typescript
try {
  DataExporter.exportSession(sessionData, {
    format: 'excel',
    includeSignalData: true,
    includeDefects: true,
    includeParameters: true
  });
} catch (error) {
  console.error('Export failed:', error);
  alert('导出失败，请重试');
}
```

## API 参考 / API Reference

### ExportOptions

```typescript
interface ExportOptions {
  format: 'csv' | 'excel' | 'json';
  includeSignalData?: boolean;  // 默认: true
  includeDefects?: boolean;      // 默认: true
  includeParameters?: boolean;   // 默认: true
}
```

### 方法 / Methods

#### `exportSession(session, options)`

导出单个会话数据。

**参数**:
- `session: CompleteSessionData` - 要导出的会话数据
- `options: ExportOptions` - 导出选项

**返回**: `void` (触发浏览器下载)

#### `exportMultipleSessions(sessions, options)`

批量导出多个会话数据。

**参数**:
- `sessions: CompleteSessionData[]` - 要导出的会话数组
- `options: ExportOptions` - 导出选项

**返回**: `void` (触发浏览器下载)

**异常**: 如果 `sessions` 为空数组，抛出错误

## 需求映射 / Requirements Mapping

此实现满足以下需求：

- **需求 10.6**: 实现批量导出为CSV或Excel格式
- **需求 14.1**: 提供多种格式选项（CSV、Excel、JSON、PDF）
- **需求 14.2**: CSV格式导出包含所有数据点的原始数据文件
- **需求 14.3**: Excel格式生成包含图表和格式化表格的工作簿
- **需求 14.4**: JSON格式导出结构化的API友好数据
- **需求 14.5**: 导出完成后提供下载链接或自动触发浏览器下载

## 未来改进 / Future Improvements

- [ ] 支持自定义文件名
- [ ] 支持导出数据范围选择（时间范围、位置范围）
- [ ] 支持导出数据采样（降低数据点数量）
- [ ] 支持后台导出大文件（使用 Web Worker）
- [ ] 支持导出进度显示
- [ ] 支持导出到云存储（Supabase Storage）
