// 发送第五封冷邮件（step_4）
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const setting = require('./setting.json');

const prisma = new PrismaClient();

function fillTemplate(template, lead, vars = {}) {
  if (!template) return '';
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (vars[key] !== undefined) return vars[key];
    if (lead[key] !== undefined) return lead[key];
    return '';
  });
}

async function processMailStep4() {
  const histories = await prisma.crm_Lead_Contact_Histories.findMany({
    where: { sequence_step: 4, send_status: 'pending' },
    orderBy: { created_at: 'asc' },
    take: 50,
  });
  if (!histories.length) return;
  const template = await prisma.crm_Lead_Mail_Template.findFirst({
    where: { sequence_step: 4, status: 'active' },
    orderBy: { created_at: 'desc' },
  });
  if (!template) return;
  for (const history of histories) {
    const lead = await prisma.crm_Leads.findUnique({ where: { id: history.lead_id } });
    if (!lead) continue;
    const mailTitle = fillTemplate(template.zh_title || '', lead);
    const mailHtml = fillTemplate(template.zh_html_content || '', lead);
    const mailText = fillTemplate(template.zh_text_content || '', lead);
    const from = setting.SENDCLOUD_FROM;
    const fromName = setting.SENDCLOUD_FROM_NAME;
    const to = 'gmyjm@qq.com'; // TODO: 替换为实际联系人邮箱
    const queue = await prisma.mail_queue.create({
      data: {
        lead_id: history.lead_id,
        lead_contact_id: history.lead_contact_id,
        step: 4,
        from,
        fromName,
        to,
        subject: mailTitle,
        html: mailHtml,
        plain: mailText,
        status: 'pending',
      },
    });
    await prisma.crm_Lead_Contact_Histories.update({
      where: { id: history.id },
      data: { send_status: 'queued', queue_id: queue.id },
    });
  }
}

cron.schedule('*/15 * * * *', async () => {
  console.log(`[mail_step_4] 定时任务启动: ${new Date().toISOString()}`);
  try {
    await processMailStep4();
  } catch (e) {
    console.error('[mail_step_4] 任务异常', e);
  }
});

if (require.main === module) {
  processMailStep4().then(() => {
    console.log('[mail_step_4] 手动执行完成');
    process.exit(0);
  });
} 