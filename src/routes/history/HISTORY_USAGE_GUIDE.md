# 历史记录管理使用指南 / History Management Usage Guide

## 概述 / Overview

历史记录管理页面允许用户查看、搜索、筛选和管理所有检测会话记录。

The History Management page allows users to view, search, filter, and manage all testing session records.

## 功能说明 / Features

### 1. 查看会话列表 / View Session List

访问 `/history` 页面即可查看所有检测会话的列表。

Navigate to `/history` page to view the list of all testing sessions.

**显示的信息 / Displayed Information:**
- 日期 / Date - 会话开始时间
- 项目名称 / Project Name - 检测项目的名称
- 操作员 / Operator - 执行检测的操作员
- 状态 / Status - 会话当前状态（已完成、进行中、已暂停、错误）
- 缺陷数 / Defects - 检测到的缺陷数量
- 操作 / Actions - 可执行的操作按钮

### 2. 搜索会话 / Search Sessions

使用搜索框快速查找特定项目的会话。

Use the search box to quickly find sessions for specific projects.

**使用方法 / How to Use:**
1. 在搜索框中输入项目名称的全部或部分
2. 系统会实时筛选匹配的会话
3. 搜索不区分大小写

**示例 / Example:**
- 输入 "test" 可以匹配 "Test Project"、"Testing Session" 等

### 3. 筛选会话 / Filter Sessions

使用多种筛选条件缩小搜索范围。

Use multiple filter criteria to narrow down the search results.

#### 状态筛选 / Status Filter

选择特定状态查看相应的会话：
- 全部状态 / All Status - 显示所有会话
- 已完成 / Completed - 只显示已完成的会话
- 进行中 / Running - 只显示正在进行的会话
- 已暂停 / Paused - 只显示已暂停的会话
- 错误 / Error - 只显示有错误的会话

#### 日期范围筛选 / Date Range Filter

按日期范围筛选会话：
1. 设置"开始日期"（From Date）
2. 设置"结束日期"（To Date）
3. 系统会显示在此日期范围内开始的会话

#### 清除筛选 / Clear Filters

点击"清除筛选 / Clear"按钮可以重置所有筛选条件，显示所有会话。

Click the "Clear Filters" button to reset all filter criteria and display all sessions.

### 4. 查看会话详情 / View Session Details

点击会话行中的"查看 / View"按钮可以查看完整的会话详情。

Click the "View" button in a session row to view complete session details.

**详情包含 / Details Include:**

#### 基本信息 / Basic Information
- 项目名称 / Project Name
- 会话ID / Session ID
- 开始时间 / Start Time
- 结束时间 / End Time
- 状态 / Status
- 操作员 / Operator

#### 检测参数 / Testing Parameters
- 增益 / Gain (dB)
- 滤波器 / Filter
- 速度 / Velocity (mm/s)
- 阈值 / Threshold

#### 闸门配置 / Gate Configuration
- 闸门 A / Gate A
  - 启用状态、起始位置、宽度、高度、报警阈值
- 闸门 B / Gate B
  - 启用状态、起始位置、宽度、高度、报警阈值

#### 数据统计 / Data Statistics
- 信号数据点总数 / Total Signal Points
- 检测到的缺陷总数 / Total Defects Found
- 严重缺陷数量 / Critical Defects
- 高级缺陷数量 / High Severity Defects

#### 缺陷列表 / Defects List
完整的缺陷表格，包含：
- 位置 / Position
- 幅值 / Amplitude
- 严重程度 / Severity
- 触发闸门 / Triggered Gate
- 时间 / Time

### 5. 删除会话 / Delete Session

点击会话行中的"删除 / Delete"按钮可以删除会话。

Click the "Delete" button in a session row to delete the session.

**注意 / Note:**
- 删除操作需要确认
- 这是软删除，会话会被标记为"错误"状态而不是物理删除
- 删除后会话仍然保留在数据库中，但不会在正常列表中显示

**使用方法 / How to Use:**
1. 点击"删除 / Delete"按钮
2. 在确认对话框中点击"确认"
3. 会话将被标记为已删除
4. 列表自动刷新

### 6. 刷新列表 / Refresh List

点击"刷新 / Refresh"按钮可以重新加载会话列表。

Click the "Refresh" button to reload the session list.

**使用场景 / Use Cases:**
- 其他用户创建了新会话
- 需要查看最新的会话状态
- 网络错误后重试

## 状态指示器 / Status Indicators

会话状态使用颜色编码的标记显示：

Session status is displayed using color-coded badges:

- 🟢 **已完成 / Completed** - 绿色，检测已成功完成
- 🔵 **进行中 / Running** - 蓝色，检测正在进行
- 🟡 **已暂停 / Paused** - 黄色，检测已暂停
- 🔴 **错误 / Error** - 红色，检测出现错误或已删除

## 严重程度标记 / Severity Badges

缺陷严重程度使用颜色编码的标记显示：

Defect severity is displayed using color-coded badges:

- 🔴 **严重 / Critical** - 红色，需要立即处理
- 🟠 **高级 / High** - 橙色，需要优先处理
- 🟡 **中级 / Medium** - 黄色，需要关注
- 🟢 **低级 / Low** - 绿色，轻微缺陷

## 响应式设计 / Responsive Design

历史记录管理页面支持多种设备：

The History Management page supports multiple devices:

### 桌面 / Desktop (≥1024px)
- 完整的表格布局
- 所有列都可见
- 详情模态框宽度最大

### 平板 / Tablet (768px-1023px)
- 自适应表格布局
- 可能需要横向滚动查看所有列
- 详情模态框适应屏幕宽度

### 移动 / Mobile (<768px)
- 垂直滚动表格
- 筛选条件垂直排列
- 详情网格单列显示

## 性能提示 / Performance Tips

### 优化加载速度 / Optimize Loading Speed

1. **使用筛选条件** - 减少加载的会话数量
2. **按需查看详情** - 只在需要时加载完整数据
3. **定期清理旧记录** - 删除不再需要的会话

### 处理大量数据 / Handle Large Datasets

如果有大量会话记录：
- 使用日期范围筛选限制结果
- 使用状态筛选只查看特定类型的会话
- 使用搜索功能快速定位特定项目

## 常见问题 / FAQ

### Q: 为什么看不到某些会话？
**A:** 检查筛选条件是否过于严格，尝试点击"清除筛选"查看所有会话。

### Q: 删除的会话可以恢复吗？
**A:** 软删除的会话仍然保留在数据库中，管理员可以通过数据库操作恢复。

### Q: 如何导出会话数据？
**A:** 数据导出功能将在 Task 25 中实现。

### Q: 会话详情加载很慢怎么办？
**A:** 这可能是因为会话包含大量信号数据。系统会自动优化加载，请稍等片刻。

### Q: 可以编辑会话信息吗？
**A:** 当前版本不支持编辑已保存的会话。如需修改，请创建新会话。

## 键盘快捷键 / Keyboard Shortcuts

- **Tab** - 在交互元素之间导航
- **Enter** - 激活选中的按钮
- **Escape** - 关闭详情模态框
- **Ctrl/Cmd + F** - 聚焦到搜索框（浏览器默认）

## 技术支持 / Technical Support

如遇到问题，请检查：
1. 网络连接是否正常
2. Supabase 服务是否可用
3. 浏览器控制台是否有错误消息
4. 用户权限是否正确配置

## 相关文档 / Related Documentation

- [Task 24 Summary](../../../TASK_24_SUMMARY.md) - 功能实现总结
- [Task 24 Verification](../../../TASK_24_VERIFICATION.md) - 验证清单
- [Supabase Service](../../lib/services/supabase.ts) - 数据库服务
- [Type Definitions](../../lib/types/) - 类型定义

## 更新日志 / Changelog

### Version 1.0.0 (Task 24)
- ✅ 初始实现
- ✅ 会话列表显示
- ✅ 搜索和筛选功能
- ✅ 会话详情查看
- ✅ 软删除功能
- ✅ 错误处理
- ✅ 响应式设计
- ✅ 双语支持
