import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';

// POST: 接收 SendCloud WebHook 回执（form-urlencoded）
export async function POST(req: Request) {
  // 解析 x-www-form-urlencoded
  const text = await req.text();
  const params = new URLSearchParams(text);

  // SendCloud 事件类型
  const event = params.get('event');
  const mailId = params.get('emailId');
  const message = params.get('message');
  const status = event === 'deliver' ? 'sent'
                : event === 'invalid' ? 'invalid'
                : event === 'soft_bounce' ? 'soft_bounce'
                : event === 'unsubscribe' ? 'unsubscribed'
                : event === 'report_spam' ? 'spam'
                : event === 'open' ? 'opened'
                : event === 'click' ? 'clicked'
                : event === 'route' ? 'replied'
                : event || 'unknown';

  // 日志：收到请求
  await prismadb.mail_log.create({
    data: {
      type: 'status',
      queue_id: null,
      mail_id: mailId,
      payload: text,
      result: 'received',
    },
  });

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
    return NextResponse.json({ error: 'Missing mailId' }, { status: 400 });
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
    return NextResponse.json({ error: '未找到队列记录' }, { status: 404 });
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

  // SendCloud 要求3秒内返回200
  return NextResponse.json({ success: true });
} 