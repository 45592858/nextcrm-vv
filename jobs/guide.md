# NextCRM 冷邮件自动化与线索联系人结构升级运维指南（2024最新版）

## 一、架构概览
- 线索联系人已升级为一对多子表 `crm_Lead_Contacts`，所有详情页、表格、API、类型、表单均已适配。
- 跟进记录表 `crm_Lead_Contact_Histories` 支持多渠道（`contact_method`、`contact_value`），与邮件队列、日志等联动。
- 冷邮件自动化采用多阶段解耦：
  - step_0/1/2/3/4 脚本定时查找待发历史，生成邮件内容，插入 `mail_queue`，`status` 设为 `pending`。
  - 邮件实际发送由 `mail_queue_worker.ts` 定时扫描 `mail_queue`，自动发送 `pending` 邮件，成功写入 `mail_id`、状态，失败记录 `error_msg`。
- Webhook 设计：
  - `/api/crm/mail/webhook-status` 兼容 SendCloud 官方 form-urlencoded，事件类型、邮件ID等字段严格对齐官方文档。
  - 所有 webhook 收到请求后立即写入 `mail_log` 日志，业务处理后补充处理结果日志。
- 日志与可观测性：
  - `mail_log` 表记录所有与第三方邮件服务的交互（type、queue_id、mail_id、payload、result、created_at）。
  - 邮件发送、webhook-status 全部写入日志。
- 字段解耦：
  - `crm_Lead_Contact_Histories` 删除 `mail_id` 字段，新增 `queue_id` 字段，所有业务追溯、状态流转、统计都以 `queue_id` 作为主关联。

---

## 二、主要表结构

### crm_Lead_Contacts
- 关联 leads，存储一对多联系人。

### crm_Lead_Contact_Histories
- 字段：id, lead_id, lead_contact_id, queue_id, contact_method, contact_value, send_status, sequence_step, send_email_at, contact_time, contact_result, memo, ...
- send_status 与 mail_queue.status 保持一致。

### mail_queue
- 字段：id, lead_id, lead_contact_id, step, from, fromName, to, subject, html, plain, status, mail_id, error_msg, send_time, ...
- status: pending/sent/failed/invalid/soft_bounce/unsubscribed/spam/opened/clicked/replied/unknown

### mail_log
- 字段：id, type, queue_id, mail_id, payload, result, created_at
- type: log/send/sent/status/status_result/route/route_result 等

---

## 三、定时任务与自动化脚本

- `mail_step_0/1/2/3/4.ts`：定时查找待发历史，生成邮件内容，插入 `mail_queue`，`send_status=pending`，并插入新的 `crm_Lead_Contact_Histories` 记录。
- `mail_queue_worker.ts`：定时扫描 `mail_queue`，自动发送 `pending` 邮件，成功写入 `mail_id`、状态，失败记录 `error_msg`，并写入 `mail_log`。

---

## 四、API 设计与最佳实践

- 所有 API 路由遵循 Next.js App Router 规范，RESTful 风格，目录与前端页面结构一一对应。
- 线索联系人、跟进记录、邮件队列、日志等 API 均已适配新结构。
- 敏感操作均校验用户身份，数据库操作统一通过 prismadb 封装，类型安全。
- API 返回统一用 NextResponse.json，错误处理规范。
- 邮件发送 API（如 `/api/crm/leads/[leadId]/send-mail`）会根据联系人、模板、发件人配置动态组装变量，填充模板，插入 `mail_queue` 和 `crm_Lead_Contact_Histories`。

---

## 五、Webhook 兼容与安全

### /api/crm/mail/webhook-status
- 支持 application/x-www-form-urlencoded，字段名与 SendCloud 官方文档一致。
- 事件类型 event 自动映射为内部 status。
- 日志 payload 存原始字符串。
- 处理流程：
  1. 解析参数，记录日志
  2. 查找 mail_queue，未找到直接返回 404
  3. 更新 mail_queue.status、crm_Lead_Contact_Histories.send_status
  4. 记录处理结果日志
  5. 3 秒内返回 200

---

## 六、邮件模板与变量填充

- 模板变量统一用 `{{变量名}}`，优先级：vars > contact > lead。
- 常用变量通过 `getMailVars` 自动组装（如 APPELLATION, SENDER, MOBILE）。
- 多语言支持：根据 lead.language 选择中英文模板和发件人名称。
- 变量填充逻辑见 `lib/mailTemplate.ts`。

---

## 七、启动步骤

1. 安装依赖：
   ```cmd
   pnpm install
   ```
2. 数据库迁移：
   ```cmd
   pnpm prisma generate
   pnpm prisma db push
   ```
3. 启动开发环境：
   ```cmd
   pnpm dev
   ```
4. 启动定时任务（如需）：
   ```cmd
   REM 以后台方式运行
   node jobs/mail_step_0.js
   node jobs/mail_queue_worker.js
   ```

---

## 八、常见问题与排查

- webhook-status 返回 400：检查 emailId 参数是否正确
- webhook-status 返回 404：检查 mail_queue 是否有对应 mail_id
- 邮件状态未同步：检查 mail_queue_worker 是否正常运行，日志 mail_log 是否有异常
- 跟进记录未归档：检查 webhook-status 是否收到回调，日志 mail_log 是否有记录

---

## 九、Webhook 测试命令（Windows CMD 格式）

### webhook-status 测试
```cmd
curl -X POST "http://localhost:3000/api/crm/mail/webhook-status" ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "event=deliver&emailId=test-mail-id-123&message=投递成功"
```

---

## 十、扩展建议
- 队列与日志表建议定期归档，防止数据膨胀。
- 可扩展多渠道（短信、WhatsApp）自动化。
- 日志可对接 ELK/Sentry 等可观测平台。
- 邮件模板、变量、批量发送等可进一步解耦。

---

如有疑问请查阅代码注释或联系开发负责人。

---

**主要变更点说明：**
- 所有邮件相关操作均以 `mail_queue` 为中心，状态流转、日志、webhook、跟进记录均以 `queue_id` 关联。
- 邮件模板、变量填充、发件人配置、语言切换等均已自动化，API 及定时任务脚本已全部适配。
- 日志体系完善，所有外部交互、异常、状态变更均有追溯。 