// @ts-nocheck
/* eslint-disable @typescript-eslint/no-var-requires */
// 发送第三封冷邮件（step_2）
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const setting = require('./setting.json');
const { fillTemplate, getMailVars } = require('../lib/mailTemplate');
const { getServerSession } = require('next-auth');
const { authOptions } = require('../lib/auth');

const prisma = new PrismaClient();

async function processMailStep2() {
  const histories = await prisma.crm_Lead_Contact_Histories.findMany({
    where: { sequence_step: 2, send_status: 'pending' },
    orderBy: { created_at: 'asc' },
    take: 50,
  });
  if (!histories.length) return;

  const template = await prisma.crm_Lead_Mail_Template.findFirst({
    where: { sequence_step: 2, status: 'active' },
    orderBy: { created_at: 'desc' },
  });
  if (!template) return;

  let sessionUserId = undefined;
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) sessionUserId = session.user.id;
  } catch (e) {}

  for (const history of histories) {
    const lead = await prisma.crm_Leads.findUnique({ where: { id: history.lead_id } });
    if (!lead) continue;
    const contact = await prisma.crm_Lead_Contacts.findUnique({ where: { id: history.lead_contact_id } });
    if (!contact) continue;
    let userId = sessionUserId;
    if (!userId && lead.createdBy) userId = lead.createdBy;
    if (!userId && lead.assigned_to) userId = lead.assigned_to;
    if (!userId) continue;
    const autoMailer = await prisma.auto_mailer_configs.findFirst({ where: { user: userId } });
    if (!autoMailer) continue;
    const vars = getMailVars(contact, autoMailer);
    const mailTitle = fillTemplate(template.zh_title || '', lead, vars, contact);
    const mailHtml = fillTemplate(template.zh_html_content || '', lead, vars, contact);
    const mailText = fillTemplate(template.zh_text_content || '', lead, vars, contact);
    const from = autoMailer.mail_address;
    const fromName = autoMailer.mail_from_name_cn;
    const to = contact.email;
    if (!to) {
      console.log(`[mail_step_2] 无效的邮箱地址: ${to}, lead_id: ${history.lead_id}, contact_id: ${contact.id}`);
      continue;
    }
    const queue = await prisma.mail_queue.create({
      data: {
        lead_id: history.lead_id,
        lead_contact_id: history.lead_contact_id,
        step: 2,
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
  console.log(`[mail_step_2] 定时任务启动: ${new Date().toISOString()}`);
  try {
    await processMailStep2();
  } catch (e) {
    console.error('[mail_step_2] 任务异常', e);
  }
});

if (require.main === module) {
  processMailStep2().then(() => {
    console.log('[mail_step_2] 手动执行完成');
    process.exit(0);
  });
} 