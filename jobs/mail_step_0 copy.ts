// 发送初次邮件破冰(冷邮件)
const cron = require('node-cron');
const { PrismaClient } = require("@prisma/client");
const axios = require('axios');
require('dotenv').config();
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

// todo: 从lead中获取
const zh_vars = {
  APPELLATION: '王经理', // 假设你有联系人对象
  SENDER: '杨健明',
  MOBILE: '13800138000'
};

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
  plain: string;
  from: string;
  fromName: string;
}

async function sendMailBySendCloud({
  to,
  subject,
  html,
  plain,
  from,
  fromName
}: SendMailParams): Promise<string | null> {
  const apiUser = setting.SENDCLOUD_API_USER;
  const apiKey = setting.SENDCLOUD_API_KEY;
  const url = 'https://api.sendcloud.net/apiv2/mail/send';
  const params = new URLSearchParams();
  params.append('apiUser', apiUser || '');
  params.append('apiKey', apiKey || '');
  params.append('from', from || '');
  params.append('fromName', fromName || '');
  params.append('to', to);
  params.append('subject', subject);
  params.append('html', html);
  params.append('plain', plain);
  // 可选: params.append('respEmailId', 'true');
  try {
    const res = await axios.post(url, params);
    console.log('[sendcloud] 邮件发送结果', res.data);
    console.log('[sendcloud] 邮件发送结果', res.data.info);
    let emailId = null;
    if (res.data && res.data.result && res.data.info) {
      if (res.data.info.emailId) {
        emailId = res.data.info.emailId;
      } else if (Array.isArray(res.data.info.emailIdList)) {
        emailId = res.data.info.emailIdList[0];
      }
    }
    if (emailId) {
      console.log('[sendcloud] 邮件发送成功', emailId);
      return emailId;
    } else {
      console.error('[sendcloud] 邮件发送成功，但未获取到邮件ID', res.data);
    }
    return null;
  } catch (e: unknown) {
    const err = e as any;
    if (axios.isAxiosError(e)) {
      console.error('[sendcloud] 邮件发送失败', err.response?.data || err.message);
    } else if (e instanceof Error) {
      console.error('[sendcloud] 邮件发送失败', e.message);
    } else {
      console.error('[sendcloud] 邮件发送失败', e);
    }
    return null;
  }
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

    // 4. 填充模板
    const mailTitle = fillTemplate(template.zh_title || '', lead, zh_vars);
    const mailHtml = fillTemplate(template.zh_html_content || '', lead, zh_vars);
    const mailText = fillTemplate(template.zh_text_content || '', lead, zh_vars);

    // 5. 发送邮件
    const from = setting.SENDCLOUD_FROM;
    const fromName = setting.SENDCLOUD_FROM_NAME;
    const to = 'gmyjm@qq.com';//(lead as any).email || zh_vars.MOBILE + '@sms2email.fake'; // 这里请根据实际业务调整
    const emailId = await sendMailBySendCloud({
      to,
      subject: mailTitle,
      html: mailHtml,
      plain: mailText,
      from,
      fromName
    });
    console.log(`[mail_step_0] send to lead_id=${lead.id} emailId=${emailId}`);

    // 6. 更新 send_status 和 mail_id
    await prisma.crm_Lead_Contact_Histories.update({
      where: { id: history.id },
      data: { send_status: 'sent', mail_id: emailId },
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