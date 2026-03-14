# Project TODO

## 数据库接入与 CSV 导入

- [x] 扩展 drizzle schema：navHistory、dividendRecords、aiSignals、rebalanceLogs 表
- [x] 扩展 db.ts：添加批量导入函数（bulkInsertNavHistory、bulkInsertDividendRecords）
- [x] 扩展 tRPC routers.ts：添加 bulkImportNavHistory、bulkImportDividendRecords、getSummary 接口
- [x] VaultApp.tsx 接入数据库：NAV 走势图、AI 信号、调仓日志从数据库读取，静态数据作为 fallback
- [x] AdminDashboard.tsx 添加 CSV 批量导入面板（NAV 历史 + 派息记录）
- [x] CSV 解析支持：日期格式验证、代码验证、预览功能、错误提示

## 已有功能

- [x] 管理后台 /admin：NAV 历史、派息记录、AI 信号、调仓日志的增删管理
- [x] Vault 页面 /vault：金库展示、NAV 走势图、AI 信号、调仓日志
- [x] NavBar 导航组件
- [x] 双语支持（中文/英文）
- [x] 深色/浅色模式切换

## UI 调整

- [x] 删除 Vault 页面 NAV 走势图模块（中英文）
- [x] 删除 Vault 页面 AI 市场信号模块（中英文）
- [x] 删除 Vault 页面 AI 调仓日志模块（中英文）
- [x] 创建统一 Footer 组件并添加到所有页面
- [x] 为 /dashboard（Home.tsx）页面添加 Footer
- [x] 加大导航栏各栏目之间的间距
- [x] 修复导航栏 activeTab 高亮逻辑（如何运作、洞察等页面无法高亮）
