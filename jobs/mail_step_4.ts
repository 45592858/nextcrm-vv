// @ts-nocheck
/* eslint-disable @typescript-eslint/no-var-requires */
// 发送第五封冷邮件（step_4）
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const setting = require('./setting.json');
const { fillTemplate, getMailVars } = require('../lib/mailTemplate');
const { getServerSession } = require('next-auth');
const { authOptions } = require('../lib/auth');

const prisma = new PrismaClient();

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
    const vars = getMailVars(contact, autoMailer, lead.language);
    let mailTitle, mailHtml, mailText, fromName;
    if (lead.language === 'en') {
      mailTitle = fillTemplate(template.en_title || '', lead, vars, contact);
      mailHtml = fillTemplate(template.en_html_content || '', lead, vars, contact);
      mailText = fillTemplate(template.en_text_content || '', lead, vars, contact);
      fromName = autoMailer.mail_from_name_en;
    } else {
      mailTitle = fillTemplate(template.zh_title || '', lead, vars, contact);
      mailHtml = fillTemplate(template.zh_html_content || '', lead, vars, contact);
      mailText = fillTemplate(template.zh_text_content || '', lead, vars, contact);
      fromName = autoMailer.mail_from_name_cn;
    }
    const from = autoMailer.mail_address;
    const to = contact.email;
    if (!to) {
      console.log(`[mail_step_4] 无效的邮箱地址: ${to}, lead_id: ${history.lead_id}, contact_id: ${contact.id}`);
      continue;
    }
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
    await prisma.crm_Lead_Contact_Histories.create({
      data: {
        lead_id: history.lead_id,
        lead_contact_id: history.lead_contact_id,
        contact_time: new Date(),
        contact_method: '邮件',
        contact_value: contact.email,
        sequence_step: 4,
        send_status: 'pending',
        send_email_at: new Date(),
        queue_id: queue.id,
      },
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