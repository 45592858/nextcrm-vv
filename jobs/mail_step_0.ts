// @ts-nocheck
/* eslint-disable @typescript-eslint/no-var-requires */
// 发送初次邮件破冰(冷邮件)
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const setting = require('./setting.json');
const { fillTemplate, getMailVars } = require('../lib/mailTemplate');
const { getServerSession } = require('next-auth');
const { authOptions } = require('../lib/auth');

const prisma = new PrismaClient();

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

  // 获取当前登录用户（如有）
  let sessionUserId = undefined;
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) sessionUserId = session.user.id;
  } catch (e) {}

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

    // 5. 读取 Auto Mailer 配置，优先顺序：session.user.id > lead.createdBy > lead.assigned_to
    let userId = sessionUserId;
    if (!userId && lead.createdBy) userId = lead.createdBy;
    if (!userId && lead.assigned_to) userId = lead.assigned_to;
    if (!userId) continue;
    const autoMailer = await prisma.auto_mailer_configs.findFirst({
      where: { user: userId },
    });
    if (!autoMailer) continue;

    // 6. 组装变量
    const vars = getMailVars(contact, autoMailer, lead.language);

    // 7. 根据lead.language选择模板和发件人名称
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

    // 8. 生成完整邮件内容并插入 mail_queue
    const from = autoMailer.mail_address;
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
    // 插入新的 crm_Lead_Contact_Histories 记录
    await prisma.crm_Lead_Contact_Histories.create({
      data: {
        lead_id: history.lead_id,
        lead_contact_id: history.lead_contact_id,
        contact_time: new Date(),
        contact_method: '邮件',
        contact_value: contact.email,
        sequence_step: 0,
        send_status: 'pending',
        send_email_at: new Date(),
        queue_id: queue.id,
      },
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
 