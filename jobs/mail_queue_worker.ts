// @ts-nocheck
/* eslint-disable @typescript-eslint/no-var-requires */
// 发送 mail_queue 队列中的邮件
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
require('dotenv').config();

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
  const apiUser = process.env.SENDCLOUD_API_USER;
  const apiKey = process.env.SENDCLOUD_API_KEY;
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
    
    // 当没有返回 emailId 时，打印详细的响应信息
    console.log(`[DEBUG] No emailId returned - 详细响应信息:`);
    console.log(`[DEBUG] HTTP 状态码: ${res.status}`);
    console.log(`[DEBUG] 响应头:`, JSON.stringify(res.headers, null, 2));
    console.log(`[DEBUG] 响应数据:`, JSON.stringify(res.data, null, 2));
    console.log(`[DEBUG] 请求配置:`, JSON.stringify({
      url: res.config.url,
      method: res.config.method,
      headers: res.config.headers,
      data: res.config.data
    }, null, 2));
    
    return { success: false, error: 'No emailId returned', response: res.data };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { success: false, error: err.message };
  }
}

async function processMailQueue(batchSize: number = 20) {
  console.log(`[INFO] 开始处理邮件队列，批量大小: ${batchSize}`);
  
  const mails = await prisma.mail_queue.findMany({
    where: { status: 'pending' },
    orderBy: { created_at: 'asc' },
    take: batchSize,
  });
  
  console.log(`[INFO] 找到 ${mails.length} 封待发送邮件`);
  
  if (mails.length === 0) {
    console.log('[INFO] 没有待发送的邮件');
    return;
  }
  
  for (const mail of mails) {
    console.log(`\n[INFO] 处理邮件 ID: ${mail.id}`);
    console.log(`[INFO] 收件人: ${mail.to}`);
    console.log(`[INFO] 主题: ${mail.subject}`);
    
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
        type: 'sent',
        queue_id: mail.id,
        mail_id: result && result.emailId ? result.emailId : null,
        payload: JSON.stringify({ to, subject, html, plain, from, fromName }),
        result: JSON.stringify(result),
      },
    });
    
    if (result.success) {
      console.log(`[SUCCESS] 邮件发送成功! Email ID: ${result.emailId}`);
      await prisma.mail_queue.update({
        where: { id: mail.id },
        data: { status: 'sent', mail_id: result.emailId, send_time: new Date(), error_msg: null },
      });
    } else {
      console.log(`[FAILED] 邮件发送失败! 错误原因: ${result.error}`);
      await prisma.mail_queue.update({
        where: { id: mail.id },
        data: { status: 'failed', error_msg: result.error, send_time: new Date() },
      });
    }
  }
  
  console.log(`\n[INFO] 邮件队列处理完成，共处理 ${mails.length} 封邮件`);
}

// 每5分钟执行一次
cron.schedule('*/5 * * * *', async () => {
  console.log(`[mail_queue_worker] 定时任务启动: ${new Date().toISOString()}`);
  try {
    await processMailQueue(20); // 定时任务默认处理20封邮件
  } catch (e) {
    console.error('[mail_queue_worker] 任务异常', e);
  }
});

// 立即执行一次（本地调试）
if (require.main === module) {
  // 从命令行参数获取批量大小，默认为20
  const batchSize = process.argv[2] ? parseInt(process.argv[2], 10) : 20;
  
  if (isNaN(batchSize) || batchSize <= 0) {
    console.error('[ERROR] 批量大小必须是正整数');
    process.exit(1);
  }
  
  console.log(`[INFO] 手动执行模式启动，批量大小: ${batchSize}`);
  
  processMailQueue(batchSize).then(() => {
    console.log('[INFO] 手动执行完成');
    process.exit(0);
  }).catch((error) => {
    console.error('[ERROR] 手动执行失败:', error);
    process.exit(1);
  });
} 