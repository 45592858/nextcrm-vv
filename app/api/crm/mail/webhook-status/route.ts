import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';

// POST: 接收 SendCloud WebHook 回执（form-urlencoded）
export async function POST(req: Request) {
  let text = '';
  let params;
  // 1. 收到请求时先 type='log' 记录原始数据
  try {
    text = await req.text();
    await prismadb.mail_log.create({
      data: {
        type: 'log',
        queue_id: null,
        mail_id: null,
        payload: text,
        result: 'raw',
      },
    });
    params = new URLSearchParams(text);
  } catch (err) {
    try {
      await prismadb.mail_log.create({
        data: {
          type: 'status_error',
          queue_id: null,
          mail_id: null,
          payload: text,
          result: 'invalid form',
        },
      });
    } catch (e) {}
    return NextResponse.json({ error: '请求体不是有效的form-urlencoded' }, { status: 200 });
  }

  // 2. 解析参数，按 event 类型分别 type=event 记录日志
  const event = params.get('event');
  const mailId = params.get('emailId');
  const message = params.get('message');
  // 记录事件日志
  try {
    await prismadb.mail_log.create({
      data: {
        type: event || 'unknown',
        queue_id: null,
        mail_id: mailId,
        payload: text,
        result: 'received',
      },
    });
  } catch (e) {}

  // 3. event=route 时，提取 route 相关参数，写入 crm_Lead_Contact_Histories
  if (event === 'route') {
    // 参考文档参数
    const from = params.get('from');
    const to = params.get('to');
    const subject = params.get('subject');
    const textContent = params.get('text');
    const htmlContent = params.get('html');
    const rawMessageUrl = params.get('raw_message_url');
    const timestamp = params.get('timestamp');
    const token = params.get('token');
    // 记录 route 事件
    try {
      // 查找 mail_queue
      const mail = mailId ? await prismadb.mail_queue.findFirst({ where: { mail_id: mailId } }) : null;
      // 只更新原有 crm_Lead_Contact_Histories 记录
      if (mail) {
        await prismadb.crm_Lead_Contact_Histories.updateMany({
          where: { queue_id: mail.id },
          data: {
            contact_result: '收到回复',
            memo: textContent || htmlContent || '',
            send_status: 'replied',
          },
        });
        // 同步更新 mail_queue 状态
        await prismadb.mail_queue.update({
          where: { id: mail.id },
          data: { status: 'replied' },
        });
      }
      await prismadb.mail_log.create({
        data: {
          type: 'route_result',
          queue_id: mail?.id || null,
          mail_id: mailId,
          payload: text,
          result: JSON.stringify({ from, to, subject, textContent, htmlContent, rawMessageUrl }),
        },
      });
    } catch (err) {
      try {
        await prismadb.mail_log.create({
          data: {
            type: 'route_error',
            queue_id: null,
            mail_id: mailId || null,
            payload: text,
            result: (err instanceof Error ? err.message : String(err)).slice(0, 500),
          },
        });
      } catch (e) {}
      return NextResponse.json({ error: '服务器异常', detail: err instanceof Error ? err.message : String(err) }, { status: 200 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  }

  // 4. 其他事件按原有逻辑处理
  const status = event === 'deliver' ? 'sent'
    : event === 'invalid' ? 'invalid'
    : event === 'soft_bounce' ? 'soft_bounce'
    : event === 'unsubscribe' ? 'unsubscribed'
    : event === 'report_spam' ? 'spam'
    : event === 'open' ? 'opened'
    : event === 'click' ? 'clicked'
    : event || 'unknown';

  try {
    if (!mailId) {
      await prismadb.mail_log.create({
        data: {
          type: 'status_result',
          queue_id: null,
          mail_id: mailId,
          payload: text,
          result: 'missing mailId',
        },
      });
      return NextResponse.json({ error: 'Missing mailId' }, { status: 200 });
    }
    // 查找 queue
    const queue = await prismadb.mail_queue.findFirst({ where: { mail_id: mailId } });
    if (!queue) {
      await prismadb.mail_log.create({
        data: {
          type: 'status_result',
          queue_id: null,
          mail_id: mailId,
          payload: text,
          result: 'not found',
        },
      });
      return NextResponse.json({ error: '未找到队列记录' }, { status: 200 });
    }
    // 更新 mail_queue
    await prismadb.mail_queue.update({
      where: { id: queue.id },
      data: { status, error_msg: message || null },
    });
    // 同步更新 crm_Lead_Contact_Histories
    await prismadb.crm_Lead_Contact_Histories.updateMany({
      where: { queue_id: queue.id },
      data: { send_status: status },
    });
    // 日志：处理结果
    await prismadb.mail_log.create({
      data: {
        type: 'status_result',
        queue_id: queue.id,
        mail_id: mailId,
        payload: text,
        result: JSON.stringify({ status, message, event }),
      },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    try {
      await prismadb.mail_log.create({
        data: {
          type: 'status_error',
          queue_id: null,
          mail_id: mailId || null,
          payload: text,
          result: (err instanceof Error ? err.message : String(err)).slice(0, 500),
        },
      });
    } catch (e) {}
    return NextResponse.json({ error: '服务器异常', detail: err instanceof Error ? err.message : String(err) }, { status: 200 });
  }
} 