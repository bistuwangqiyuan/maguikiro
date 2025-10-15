# Task 27: 离线模式 - IndexedDB 验证文档

## 验证目标

验证 IndexedDB 离线存储功能是否正确实现，包括数据存储、网络监控和 UI 指示器。

## 验证环境

- **浏览器**: Chrome/Edge/Firefox/Safari
- **开发工具**: DevTools (Application/Storage 面板)
- **网络模拟**: DevTools Network 面板

## 验证步骤

### 1. 依赖安装验证

#### 检查点
- ✅ Dexie.js 已安装在 package.json
- ✅ 版本: 4.2.1

#### 验证命令
```bash
# 检查 package.json
cat package.json | grep dexie

# 或在 PowerShell
Get-Content package.json | Select-String dexie
```

#### 期望结果
```json
"dexie": "4.2.1"
```

---

### 2. 文件结构验证

#### 检查点
验证所有必需文件已创建：

```
✅ src/lib/services/offline-db.ts
✅ src/lib/services/offline-storage.ts
✅ src/lib/services/network-status.ts
✅ src/lib/services/OFFLINE_MODE_README.md
✅ src/lib/services/__tests__/offline-storage.example.ts
✅ src/lib/components/common/OfflineIndicator.svelte
```

#### 验证命令
```bash
# Windows PowerShell
Test-Path src/lib/services/offline-db.ts
Test-Path src/lib/services/offline-storage.ts
Test-Path src/lib/services/network-status.ts
Test-Path src/lib/components/common/OfflineIndicator.svelte
```

---

### 3. 类型检查验证

#### 检查点
- ✅ 所有 TypeScript 文件无类型错误
- ✅ 导入导出正确

#### 验证命令
```bash
npm run check
```

#### 期望结果
```
No errors found
```

---

### 4. 数据库架构验证

#### 检查点
验证 AppDatabase 类正确定义了所有表：

**表结构：**
- ✅ sessions 表 (id, startTime, status, syncStatus, operator)
- ✅ signalData 表 (++id, sessionId, timestamp, position)
- ✅ defects 表 (id, sessionId, position, severity, timestamp)
- ✅ calibrations 表 (id, calibrationDate, isActive)
- ✅ pendingSync 表 (++id, type, timestamp, sessionId)

#### 验证方法
1. 打开浏览器 DevTools
2. 运行应用: `npm run dev`
3. 打开 Application → IndexedDB
4. 查看 "MagneticTestingDB" 数据库
5. 验证所有表存在

#### 期望结果
- 数据库名称: MagneticTestingDB
- 版本: 1
- 包含 5 个对象存储 (表)

---

### 5. 离线存储服务验证

#### 测试场景 1: 保存会话

**步骤：**
1. 打开浏览器控制台
2. 执行以下代码：

```javascript
import { offlineStorage } from '$lib/services';

const session = {
  id: crypto.randomUUID(),
  projectName: 'Test Project',
  operator: 'test-user',
  startTime: new Date(),
  status: 'running',
  parameters: {
    gain: 60,
    filter: 'bandpass',
    velocity: 100,
    threshold: 0.5,
    gateA: { enabled: true, start: 0, width: 100, height: 50, alarmThreshold: 0.8, color: '#FFD700' },
    gateB: { enabled: false, start: 0, width: 0, height: 0, alarmThreshold: 0, color: '#FF69B4' }
  }
};

await offlineStorage.saveSession(session);
console.log('Session saved:', session.id);
```

**期望结果：**
- ✅ 控制台显示 "Session saved: [uuid]"
- ✅ IndexedDB → sessions 表中有新记录
- ✅ IndexedDB → pendingSync 表中有新记录

---

#### 测试场景 2: 保存信号数据

**步骤：**
```javascript
const signalData = Array.from({ length: 100 }, (_, i) => ({
  timestamp: Date.now() + i * 10,
  amplitude: Math.sin(i * 0.1),
  phase: Math.cos(i * 0.1),
  position: i * 0.1,
  frequency: 100
}));

await offlineStorage.saveSignalData(session.id, signalData);
console.log('Signal data saved:', signalData.length, 'points');
```

**期望结果：**
- ✅ 控制台显示 "Signal data saved: 100 points"
- ✅ IndexedDB → signalData 表中有 100 条记录
- ✅ 所有记录的 sessionId 正确

---

#### 测试场景 3: 获取存储统计

**步骤：**
```javascript
const stats = await offlineStorage.getStorageStats();
console.log('Storage stats:', stats);
```

**期望结果：**
```javascript
{
  sessionsCount: 1,
  signalDataCount: 100,
  defectsCount: 0,
  pendingSyncCount: 2,
  storageUsage: [number],
  storageQuota: [number]
}
```

---

### 6. 网络状态监控验证

#### 测试场景 1: 在线/离线检测

**步骤：**
1. 打开 DevTools → Network
2. 设置为 "Online"
3. 在控制台执行：

```javascript
import { networkManager } from '$lib/services';
console.log('Is online:', networkManager.isOnline());
```

4. 设置为 "Offline"
5. 再次执行上述代码

**期望结果：**
- Online 时: `Is online: true`
- Offline 时: `Is online: false`

---

#### 测试场景 2: Svelte Store 响应

**步骤：**
1. 在 Svelte 组件中添加：

```svelte
<script>
  import { networkStatus, isOffline } from '$lib/services';
</script>

<div>
  <p>Online: {$networkStatus.online}</p>
  <p>Is Offline: {$isOffline}</p>
</div>
```

2. 切换网络状态 (Online ↔ Offline)

**期望结果：**
- UI 实时更新显示网络状态
- 离线时 isOffline 为 true

---

### 7. UI 组件验证

#### 测试场景 1: 离线指示器显示

**步骤：**
1. 启动应用: `npm run dev`
2. 打开浏览器
3. 设置网络为 "Offline"

**期望结果：**
- ✅ 右上角显示黄色警告框
- ✅ 显示 "离线模式" 文字
- ✅ 显示 "数据将保存到本地，网络恢复后自动同步"
- ✅ 如有待同步项，显示数量徽章

---

#### 测试场景 2: 存储详情显示

**步骤：**
1. 在离线模式下
2. 点击 "详情" 按钮

**期望结果：**
- ✅ 显示详细统计卡片
- ✅ 显示检测会话数量
- ✅ 显示信号数据点数量
- ✅ 显示缺陷记录数量
- ✅ 显示待同步项数量
- ✅ 显示存储使用进度条
- ✅ 显示存储百分比

---

#### 测试场景 3: 同步指示器

**步骤：**
1. 在离线模式下保存一些数据
2. 切换回在线模式

**期望结果：**
- ✅ 显示蓝色同步指示器
- ✅ 显示旋转的同步图标
- ✅ 显示 "正在同步 X 项离线数据..."
- ✅ 同步完成后指示器消失

---

### 8. 集成验证

#### 检查点
- ✅ services/index.ts 导出所有离线服务
- ✅ OfflineIndicator 已添加到 +layout.svelte
- ✅ 组件在所有页面可见

#### 验证方法
1. 检查 src/lib/services/index.ts
2. 检查 src/routes/+layout.svelte
3. 访问不同页面，验证指示器始终显示

---

### 9. 功能完整性验证

#### 核心功能清单

**数据存储：**
- ✅ 保存检测会话
- ✅ 更新会话状态
- ✅ 保存信号数据（批量）
- ✅ 保存缺陷记录
- ✅ 保存校准数据

**数据检索：**
- ✅ 获取单个会话
- ✅ 获取所有会话
- ✅ 获取会话的信号数据
- ✅ 获取会话的缺陷列表
- ✅ 获取最新校准

**同步管理：**
- ✅ 添加到同步队列
- ✅ 获取待同步项目
- ✅ 移除已同步项目
- ✅ 更新重试计数
- ✅ 标记同步状态

**存储管理：**
- ✅ 获取存储统计
- ✅ 清理旧数据
- ✅ 获取存储配额

**网络监控：**
- ✅ 在线/离线检测
- ✅ 连接质量检测
- ✅ 状态变化监听
- ✅ 连接性测试

---

### 10. 性能验证

#### 测试场景: 批量数据写入

**步骤：**
```javascript
console.time('Batch write');

const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
  timestamp: Date.now() + i,
  amplitude: Math.random(),
  phase: Math.random(),
  position: i * 0.1,
  frequency: 100
}));

await offlineStorage.saveSignalData('test-session', largeDataset);

console.timeEnd('Batch write');
```

**期望结果：**
- ✅ 10000 条数据写入时间 < 1000ms
- ✅ 无内存溢出
- ✅ UI 不卡顿

---

### 11. 错误处理验证

#### 测试场景 1: 存储配额超限

**步骤：**
1. 生成大量数据直到接近配额
2. 观察应用行为

**期望结果：**
- ✅ 应用不崩溃
- ✅ 显示存储警告
- ✅ 建议清理旧数据

---

#### 测试场景 2: IndexedDB 不可用

**步骤：**
1. 在隐私模式下测试
2. 或禁用 IndexedDB

**期望结果：**
- ✅ 应用检测到 IndexedDB 不可用
- ✅ 显示友好错误消息
- ✅ 提供降级方案

---

### 12. 浏览器兼容性验证

#### 测试浏览器
- ✅ Chrome (最新版)
- ✅ Edge (最新版)
- ✅ Firefox (最新版)
- ✅ Safari (最新版)

#### 验证项目
- IndexedDB 可用性
- 网络状态 API
- Storage API
- UI 显示正常

---

## 自动化测试建议

### 单元测试示例

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { offlineStorage } from '../offline-storage';
import { db } from '../offline-db';

describe('OfflineStorage', () => {
  beforeEach(async () => {
    await db.clearAll();
  });

  it('should save and retrieve session', async () => {
    const session = {
      id: 'test-123',
      projectName: 'Test',
      operator: 'user-1',
      startTime: new Date(),
      status: 'running',
      parameters: {} as any
    };

    await offlineStorage.saveSession(session);
    const retrieved = await offlineStorage.getSession(session.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(session.id);
  });

  it('should add items to sync queue', async () => {
    const session = {
      id: 'test-123',
      projectName: 'Test',
      operator: 'user-1',
      startTime: new Date(),
      status: 'running',
      parameters: {} as any
    };

    await offlineStorage.saveSession(session);
    const pending = await offlineStorage.getPendingSyncItems();

    expect(pending.length).toBeGreaterThan(0);
    expect(pending[0].type).toBe('session');
  });

  it('should save signal data in batch', async () => {
    const sessionId = 'test-123';
    const data = Array.from({ length: 100 }, (_, i) => ({
      timestamp: Date.now() + i,
      amplitude: i,
      phase: i * 0.1,
      position: i,
      frequency: 100
    }));

    await offlineStorage.saveSignalData(sessionId, data);
    const saved = await offlineStorage.getSignalData(sessionId);

    expect(saved.length).toBe(100);
  });
});
```

---

## 验证报告模板

### 验证日期
[填写日期]

### 验证人员
[填写姓名]

### 验证结果

| 验证项 | 状态 | 备注 |
|--------|------|------|
| 依赖安装 | ✅/❌ | |
| 文件结构 | ✅/❌ | |
| 类型检查 | ✅/❌ | |
| 数据库架构 | ✅/❌ | |
| 离线存储 | ✅/❌ | |
| 网络监控 | ✅/❌ | |
| UI 组件 | ✅/❌ | |
| 集成测试 | ✅/❌ | |
| 性能测试 | ✅/❌ | |
| 错误处理 | ✅/❌ | |
| 浏览器兼容 | ✅/❌ | |

### 发现的问题
[列出发现的问题]

### 建议改进
[列出改进建议]

---

## 快速验证脚本

### PowerShell 脚本

```powershell
# 快速验证脚本
Write-Host "=== Task 27 验证脚本 ===" -ForegroundColor Green

# 1. 检查文件
Write-Host "`n1. 检查文件..." -ForegroundColor Yellow
$files = @(
    "src/lib/services/offline-db.ts",
    "src/lib/services/offline-storage.ts",
    "src/lib/services/network-status.ts",
    "src/lib/components/common/OfflineIndicator.svelte"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file" -ForegroundColor Red
    }
}

# 2. 检查依赖
Write-Host "`n2. 检查依赖..." -ForegroundColor Yellow
$packageJson = Get-Content package.json | ConvertFrom-Json
if ($packageJson.dependencies.dexie) {
    Write-Host "  ✓ Dexie.js: $($packageJson.dependencies.dexie)" -ForegroundColor Green
} else {
    Write-Host "  ✗ Dexie.js 未安装" -ForegroundColor Red
}

# 3. 类型检查
Write-Host "`n3. 运行类型检查..." -ForegroundColor Yellow
npm run check

Write-Host "`n=== 验证完成 ===" -ForegroundColor Green
```

---

## 总结

本验证文档提供了完整的验证步骤和测试场景，确保 Task 27 的所有功能正确实现。

**关键验证点：**
1. ✅ IndexedDB 数据库正确创建
2. ✅ 离线存储服务功能完整
3. ✅ 网络状态监控工作正常
4. ✅ UI 组件显示正确
5. ✅ 性能满足要求
6. ✅ 错误处理健壮
7. ✅ 浏览器兼容性良好

**下一步：**
- 执行所有验证步骤
- 记录验证结果
- 修复发现的问题
- 准备进入 Task 28 (离线数据同步)
