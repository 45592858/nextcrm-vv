// 发送 mail_queue 队列中的邮件
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
require('dotenv').config();
const setting = require('./setting.json');

const prisma = new PrismaClient();

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
  plain: string;
  from: string;
  fromName: string;
}

async function sendMailBySendCloud({ to, subject, html, plain, from, fromName }: SendMailParams) {
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
  try {
    const res = await axios.post(url, params);
    let emailId = null;
    if (res.data && res.data.result && res.data.info) {
      if (res.data.info.emailId) {
        emailId = res.data.info.emailId;
      } else if (Array.isArray(res.data.info.emailIdList)) {
        emailId = res.data.info.emailIdList[0];
      }
    }
    if (emailId) {
      return { success: true, emailId };
    }
    return { success: false, error: 'No emailId returned' };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { success: false, error: err.message };
  }
}

async function processMailQueue() {
  const mails = await prisma.mail_queue.findMany({
    where: { status: 'pending' },
    orderBy: { created_at: 'asc' },
    take: 20,
  });
  for (const mail of mails) {
    const { to, subject, html, plain, from, fromName } = mail;
    // 日志：发送前
    await prisma.mail_log.create({
      data: {
        type: 'send',
        queue_id: mail.id,
        mail_id: mail.mail_id || null,
        payload: JSON.stringify({ to, subject, html, plain, from, fromName }),
        result: null,
      },
    });
    const result = await sendMailBySendCloud({ to, subject, html, plain, from, fromName });
    // 日志：发送后
    await prisma.mail_log.create({
      data: {
        type: 'send',
        queue_id: mail.id,
        mail_id: result && result.emailId ? result.emailId : null,
        payload: JSON.stringify({ to, subject, html, plain, from, fromName }),
        result: JSON.stringify(result),
      },
    });
    if (result.success) {
      await prisma.mail_queue.update({
        where: { id: mail.id },
        data: { status: 'sent', mail_id: result.emailId, send_time: new Date(), error_msg: null },
      });
    } else {
      await prisma.mail_queue.update({
        where: { id: mail.id },
        data: { status: 'failed', error_msg: result.error, send_time: new Date() },
      });
    }
  }
}

// 每5分钟执行一次
cron.schedule('*/5 * * * *', async () => {
  console.log(`[mail_queue_worker] 定时任务启动: ${new Date().toISOString()}`);
  try {
    await processMailQueue();
  } catch (e) {
    console.error('[mail_queue_worker] 任务异常', e);
  }
});

// 立即执行一次（本地调试）
if (require.main === module) {
  processMailQueue().then(() => {
    console.log('[mail_queue_worker] 手动执行完成');
    process.exit(0);
  });
} 