import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';

// POST: 接收 SendCloud WebHook 回执（form-urlencoded）
export async function POST(req: Request) {
  let text = '';
  let params;
  try {
    text = await req.text();
    params = new URLSearchParams(text);
  } catch (err) {
    // 记录解析失败
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

  try {
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

    // SendCloud 要求3秒内返回200
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    // 捕获所有异常，记录日志
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