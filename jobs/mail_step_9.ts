// @ts-nocheck
/* eslint-disable @typescript-eslint/no-var-requires */
// 发送 运价更新 邮件（step_9）
const { PrismaClient } = require('@prisma/client');
const { format } = require('date-fns');
const { enUS } = require('date-fns/locale');

const prisma = new PrismaClient();

// 由于 jobs 目录使用 CommonJS，我们需要直接定义 getSender 函数
function getSender(autoMailer, language) {
  if (!autoMailer) {
    return {
      senderName: '',
      senderMobile: '',
      from: '',
      fromName: '',
    };
  }

  const fromName = language === 'en' 
    ? (autoMailer.mail_from_name_en || '') 
    : (autoMailer.mail_from_name_cn || '');

  return {
    senderName: fromName,
    senderMobile: autoMailer.contact_no || '',
    from: autoMailer.mail_address || '',
    fromName: fromName,
  };
}

// 新增：格式化rateText为<ul>...</ul>包裹的<li>...</li>
function formatRateTextToHtml(rateText) {
  if (!rateText) return '';
  const items = rateText
    .split('\n')
    .filter(line => line.trim())
    .map(line => `<li>${line.trim()}</li>`) // 每行包裹<li>
    .join('\n');
  return `<ul>\n${items}\n</ul>`;
}

async function processMailStep9(maxCustomers = 100) {
  // 1. 获取最新有效运价
  const today = new Date();
  const rate = await prisma.shipping_Freight_Rate.findFirst({
    where: {
      to_country: '印尼',
      valid_until: { gt: today },
    },
    orderBy: { created_at: 'desc' },
  });
  if (!rate) {
    console.log('[mail_step_9] 无符合条件的运价，任务结束。');
    return;
  }
  const rateText = rate.price_text;
  const rateTextHtml = formatRateTextToHtml(rateText);

  // 2. 获取邮件模板
  const template = await prisma.crm_Lead_Mail_Template.findFirst({
    where: { sequence_step: 9, status: 'active' },
    orderBy: { created_at: 'desc' },
  });
  if (!template) {
    console.log('[mail_step_9] 未找到 step=9 的邮件模板，任务结束。');
    return;
  }

  // 3. 获取符合条件的客户邮箱
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  // 先获取所有符合条件的客户
  const customers = await prisma.crm_Lead_Mail_Only.findMany({
    where: {
      state: { in: ['印尼', '印度尼西亚', 'Indonesia'] },
      email: { not: '' },
    },
  });

  // 获取每个客户邮箱对应的最新邮件队列状态
  // 新的筛选逻辑：通过关联 mail_queue 表获取真实的邮件发送状态
  const allValidCustomers = [];
  for (const customer of customers) {
    // email 不为 null/空/全空格
    if (!customer.email || customer.email.trim() === '') continue;

    // 查询该邮箱在 mail_queue 中的最新记录（step=9）
    const latestMailQueue = await prisma.mail_queue.findFirst({
      where: {
        to: customer.email,
        step: 9, // 只查询 step_9 的邮件
      },
      orderBy: { created_at: 'desc' },
    });

    // 筛选逻辑：
    // 1. 如果没有邮件记录，说明从未发送过，可以发送
    // 2. 如果最新邮件状态为 sent/opened，说明上次发送成功，可以再次发送
    // 3. 如果今天已经发送过邮件，则跳过（避免重复发送）
    // 4. // TODO：除 sent / opened 外，还需要补充其它状态 如 replied/clicked，“replied/clicked”待验证
    if (!latestMailQueue || ['sent', 'opened', 'replied', 'clicked'].includes(latestMailQueue.status)) {
      // 如果今天已经发送过邮件，则跳过
      if (latestMailQueue && latestMailQueue.created_at >= startOfDay) {
        continue;
      }
      allValidCustomers.push(customer);
    }
    // 如果最新邮件状态为 pending/failed 等，则不发送（等待处理完成）
  }
  
  // 限制处理数量，避免一次处理过多客户
  const validCustomers = allValidCustomers.slice(0, maxCustomers);

  if (!validCustomers.length) {
    console.log('[mail_step_9] 无符合条件的客户，任务结束。');
    return;
  }

  // 4. 获取默认的 auto_mailer_configs 配置
  // 这里需要根据业务逻辑确定使用哪个用户的配置
  // 暂时使用第一个可用的配置，实际项目中可能需要更复杂的逻辑
  const autoMailerConfig = await prisma.auto_mailer_configs.findFirst();
  if (!autoMailerConfig) {
    console.log('[mail_step_9] 未找到 auto_mailer_configs 配置，任务结束。');
    return;
  }

  // 5. 准备邮件内容并创建队列
  const dateStr = format(new Date(), 'dd MMM yyyy', { locale: enUS });

  for (const customer of validCustomers) {
    // 使用 getSender 函数获取发件人信息
    const { senderName, senderMobile, from, fromName } = getSender(autoMailerConfig, customer.language);
    
    let mailTitle, mailHtml, mailText;
    const commonVars = {
      '{{DATE}}': dateStr,
      '{{RATE}}': rateTextHtml, // HTML模板用格式化后的内容
      '{{SENDER}}': senderName,
      '{{MOBILE}}': senderMobile,
    };
    if (customer.language === 'en') {
      mailTitle = template.en_title.replace(/{{\s*(\w+)\s*}}/g, (match, key) => commonVars[`{{${key}}}`] || match);
      // HTML内容用格式化后的rateTextHtml
      mailHtml = template.en_html_content.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
        if (key === 'RATE') return rateTextHtml;
        return commonVars[`{{${key}}}`] || match;
      });
      // 纯文本内容用原始rateText
      mailText = template.en_text_content.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
        if (key === 'RATE') return rateText;
        return commonVars[`{{${key}}}`] || match;
      });
    } else {
      mailTitle = template.zh_title.replace(/{{\s*(\w+)\s*}}/g, (match, key) => commonVars[`{{${key}}}`] || match);
      mailHtml = template.zh_html_content.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
        if (key === 'RATE') return rateTextHtml;
        return commonVars[`{{${key}}}`] || match;
      });
      mailText = template.zh_text_content.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
        if (key === 'RATE') return rateText;
        return commonVars[`{{${key}}}`] || match;
      });
    }

    // 6. 创建邮件队列
    await prisma.mail_queue.create({
      data: {
        to: customer.email,
        subject: mailTitle,
        html: mailHtml,
        plain: mailText,
        status: 'pending',
        // 可选：关联其它信息
        // lead_id: customer.id, 
        // lead_contact_id: customer.id,
        step: 9,
        from,
        fromName,
      },
    });

    // 7. 更新客户邮件状态
    await prisma.crm_Lead_Mail_Only.update({
      where: { id: customer.id },
      data: {
        last_email_status: 'pending',
        last_email_at: new Date(),
      },
    });
  }
  console.log(`[mail_step_9] 本次任务处理了 ${validCustomers.length} 个客户（总共找到 ${allValidCustomers.length} 个符合条件的客户，限制处理 ${maxCustomers} 个）`);
}

// 可按需保留或移除 cron 定时任务
// const cron = require('node-cron');
// cron.schedule('*/15 * * * *', async () => { ... });

if (require.main === module) {
  // 从命令行参数获取最大处理客户数，默认为100
  const maxCustomers = parseInt(process.argv[2]) || 100;
  console.log(`[mail_step_9] 开始执行，最大处理客户数：${maxCustomers}`);
  
  processMailStep9(maxCustomers).then(() => {
    console.log('[mail_step_9] 手动执行完成');
    process.exit(0);
  }).catch(e => {
    console.error('[mail_step_9] 手动执行异常', e);
    process.exit(1);
  });
} 