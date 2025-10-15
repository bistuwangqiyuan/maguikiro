# Service Worker 离线模式实现

## 概述

本系统实现了基于 Service Worker 的离线模式，使用 Workbox 库提供强大的缓存策略和后台同步功能。

## 功能特性

### 1. 资源缓存策略

- **静态资源预缓存**: 所有构建文件和静态文件在安装时预缓存
- **API 请求**: NetworkFirst 策略，优先使用网络，失败时使用缓存（10秒超时）
- **图片**: CacheFirst 策略，优先使用缓存（30天过期）
- **CSS/JS**: StaleWhileRevalidate 策略，使用缓存同时后台更新（30天过期）
- **字体**: CacheFirst 策略，长期缓存（1年过期）
- **HTML 页面**: NetworkFirst 策略，3秒超时

### 2. 离线检测

- 自动检测网络状态变化
- 显示离线模式指示器
- 网络恢复时自动触发数据同步

### 3. 后台同步

- 使用 Background Sync API 在网络恢复时同步数据
- 如果浏览器不支持，则使用回退机制

### 4. 版本更新

- 自动检测新版本
- 显示更新通知
- 用户确认后更新到最新版本

## 文件结构

```
src/
├── service-worker.ts                           # Service Worker 主文件
├── lib/
│   ├── utils/
│   │   ├── service-worker-registration.ts      # Service Worker 注册工具
│   │   └── SERVICE_WORKER_README.md            # 本文档
│   └── components/
│       └── common/
│           └── OfflineIndicator.svelte         # 离线状态指示器组件
```

## 使用方法

### 注册 Service Worker

Service Worker 在根布局 (`src/routes/+layout.svelte`) 中自动注册：

```typescript
import { registerServiceWorker } from '$lib/utils/service-worker-registration';

onMount(() => {
  if (browser) {
    registerServiceWorker().catch((error) => {
      console.error('Failed to register service worker:', error);
    });
  }
});
```

### 监听状态变化

```typescript
import { onStatusChange } from '$lib/utils/service-worker-registration';

const unsubscribe = onStatusChange((status) => {
  console.log('Service Worker Status:', status);
  // status.isOnline - 网络是否在线
  // status.isRegistered - Service Worker 是否已注册
  // status.needsUpdate - 是否有新版本可用
});

// 取消订阅
unsubscribe();
```

### 监听同步事件

```typescript
import { onSyncAvailable } from '$lib/utils/service-worker-registration';

const unsubscribe = onSyncAvailable(() => {
  console.log('Sync available, syncing offline data...');
  // 执行数据同步逻辑
});

// 取消订阅
unsubscribe();
```

### 手动更新 Service Worker

```typescript
import { updateServiceWorker } from '$lib/utils/service-worker-registration';

// 用户点击更新按钮时调用
updateServiceWorker();
```

## 缓存策略详解

### NetworkFirst (网络优先)

适用于：API 请求、HTML 页面

```
1. 尝试从网络获取
2. 如果网络请求成功，返回响应并更新缓存
3. 如果网络请求失败或超时，从缓存返回
4. 如果缓存也没有，返回错误
```

### CacheFirst (缓存优先)

适用于：图片、字体

```
1. 首先检查缓存
2. 如果缓存中有，直接返回
3. 如果缓存中没有，从网络获取
4. 网络响应成功后，存入缓存并返回
```

### StaleWhileRevalidate (过期重新验证)

适用于：CSS、JavaScript

```
1. 立即从缓存返回（如果有）
2. 同时在后台发起网络请求
3. 网络响应成功后，更新缓存
4. 下次请求时使用更新后的缓存
```

## 后台同步

当网络恢复时，Service Worker 会触发后台同步事件：

```typescript
// 在 service-worker.ts 中
sw.addEventListener('sync', (event) => {
  if (event.tag === 'sync-testing-data') {
    event.waitUntil(syncTestingData());
  }
});
```

应用程序可以监听 `SYNC_AVAILABLE` 消息来执行实际的同步逻辑：

```typescript
navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_AVAILABLE') {
    // 执行数据同步
  }
});
```

## 离线指示器

`OfflineIndicator` 组件会自动显示：

- **离线警告**: 当网络断开时显示橙色警告
- **更新通知**: 当有新版本可用时显示蓝色通知
- **不支持警告**: 当浏览器不支持 Service Worker 时显示红色警告

## 开发调试

### 查看 Service Worker 状态

在 Chrome DevTools 中：
1. 打开 Application 标签
2. 选择 Service Workers
3. 查看当前注册的 Service Worker

### 查看缓存

在 Chrome DevTools 中：
1. 打开 Application 标签
2. 选择 Cache Storage
3. 查看各个缓存的内容

### 模拟离线

在 Chrome DevTools 中：
1. 打开 Network 标签
2. 选择 "Offline" 预设
3. 或者使用 "Slow 3G" 等预设测试慢速网络

### 强制更新 Service Worker

在 Chrome DevTools 中：
1. 打开 Application 标签
2. 选择 Service Workers
3. 勾选 "Update on reload"
4. 点击 "Unregister" 然后刷新页面

## 生产环境注意事项

### 1. HTTPS 要求

Service Worker 只能在 HTTPS 或 localhost 上运行。确保生产环境使用 HTTPS。

### 2. 缓存大小限制

浏览器对缓存大小有限制（通常 50MB-100MB）。使用 ExpirationPlugin 自动清理旧缓存。

### 3. 更新策略

- Service Worker 更新是自动的，但需要用户刷新页面才能激活
- 使用 `skipWaiting()` 可以立即激活新版本
- 建议显示更新通知，让用户主动更新

### 4. 调试日志

生产环境中，Service Worker 的 console.log 会输出到浏览器控制台。可以通过 `chrome://serviceworker-internals/` 查看所有 Service Worker 的日志。

## 浏览器兼容性

- Chrome/Edge: 完全支持
- Firefox: 完全支持
- Safari: 支持（iOS 11.3+）
- IE: 不支持

对于不支持的浏览器，应用程序会正常运行，但没有离线功能。

## 与 IndexedDB 集成

Service Worker 负责缓存资源和 API 响应，而 IndexedDB（Task 27）负责存储结构化的离线数据。两者配合使用：

1. Service Worker 缓存 API 响应，提供快速的离线访问
2. IndexedDB 存储完整的检测会话数据
3. 网络恢复时，IndexedDB 中的数据通过 API 同步到 Supabase

## 故障排除

### Service Worker 未注册

- 检查浏览器是否支持 Service Worker
- 确保在 HTTPS 或 localhost 上运行
- 检查控制台是否有错误信息

### 缓存未更新

- 检查 Service Worker 是否已更新
- 尝试手动卸载 Service Worker 并重新注册
- 清除浏览器缓存

### 离线模式不工作

- 确保 Service Worker 已成功注册
- 检查网络状态检测是否正常
- 查看 Service Worker 日志

## 相关资源

- [Workbox 文档](https://developers.google.com/web/tools/workbox)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Sync_API)
- [Cache Storage API](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage)
