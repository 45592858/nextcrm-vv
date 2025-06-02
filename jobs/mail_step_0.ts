// 发送初次邮件破冰(冷邮件)
import cron from 'node-cron';
const { PrismaClient } = require("@prisma/client");
const setting = require('./setting.json');

const prisma = new PrismaClient();

// 占位符替换函数
function fillTemplate(
  template: string,
  lead: Record<string, any>,
  vars: Record<string, any> = {}
): string {
  if (!template) return '';
  return template.replace(/\{\{(\w+)\}\}/g, (_: string, key: string) => {
    if (vars[key] !== undefined) return vars[key];
    if (lead[key] !== undefined) return lead[key];
    return '';
  });
}

async function processMailStep0() {
  // 1. 查询待处理的历史记录
  const histories = await prisma.crm_Lead_Contact_Histories.findMany({
    where: {
      sequence_step: 0,
      send_status: 'pending',
    },
    orderBy: { created_at: 'asc' },
    take: 50,
  });
  if (!histories.length) return;

  // 2. 查询最新邮件模板
  const template = await prisma.crm_Lead_Mail_Template.findFirst({
    where: { sequence_step: 0, status: 'active' },
    orderBy: { created_at: 'desc' },
  });
  if (!template) return;

  for (const history of histories) {
    // 3. 读取对应Lead
    const lead = await prisma.crm_Leads.findUnique({
      where: { id: history.lead_id },
    });
    if (!lead) continue;

    // 4. 读取联系人
    const contact = await prisma.crm_Lead_Contacts.findUnique({
      where: { id: history.lead_contact_id },
    });
    if (!contact) continue;

    // 5. 读取 Auto Mailer 配置
    // 先查 lead.createdBy，再查 user 配置
    let userId = lead.createdBy;
    if (!userId && lead.assigned_to) userId = lead.assigned_to;
    if (!userId) continue;
    const autoMailer = await prisma.auto_mailer_configs.findFirst({
      where: { user: userId },
    });
    if (!autoMailer) continue;

    // 6. 组装变量
    const zh_vars = {
      APPELLATION: contact.appellation || '',
      SENDER: autoMailer.mail_from_name_cn || '',
      MOBILE: autoMailer.contact_no || '',
    };

    // 7. 填充模板
    const mailTitle = fillTemplate(template.zh_title || '', lead, zh_vars);
    const mailHtml = fillTemplate(template.zh_html_content || '', lead, zh_vars);
    const mailText = fillTemplate(template.zh_text_content || '', lead, zh_vars);

    // 8. 生成完整邮件内容并插入 mail_queue
    const from = autoMailer.mail_address;
    const fromName = autoMailer.mail_from_name_cn;
    const to = contact.email;
    if (!to) {
       console.log(`[mail_step_0] 无效的邮箱地址: ${to}, lead_id: ${history.lead_id}, contact_id: ${contact.id}`);
       continue;
    }
    const queue = await prisma.mail_queue.create({
      data: {
        lead_id: history.lead_id,
        lead_contact_id: history.lead_contact_id,
        step: 0,
        from,
        fromName,
        to,
        subject: mailTitle,
        html: mailHtml,
        plain: mailText,
        status: 'pending',
      },
    });
    // 9. 更新 send_status 和 queue_id
    await prisma.crm_Lead_Contact_Histories.update({
      where: { id: history.id },
      data: { send_status: 'queued', queue_id: queue.id },
    });
  }
}

// 每15分钟执行一次
cron.schedule('*/15 * * * *', async () => {
  console.log(`[mail_step_0] 定时任务启动: ${new Date().toISOString()}`);
  try {
    await processMailStep0();
  } catch (e) {
    console.error('[mail_step_0] 任务异常', e);
  }
});

// 立即执行一次（方便本地调试）
if (require.main === module) {
  processMailStep0().then(() => {
    console.log('[mail_step_0] 手动执行完成');
    process.exit(0);
  });
}