import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';

// POST: 接收邮件回复 Webhook
export async function POST(req: Request) {
  const body = await req.json();
  // 假设回调参数有 mailId, from, to, subject, content, replyTime
  const { mailId, from, to, subject, content, replyTime } = body;
  if (!mailId || !from || !content) {
    // 日志：收到请求
    await prismadb.mail_log.create({
      data: {
        type: 'reply',
        queue_id: null,
        mail_id: mailId,
        payload: JSON.stringify(body),
        result: 'missing param',
      },
    });
    return NextResponse.json({ error: '参数不全' }, { status: 400 });
  }
  // 日志：收到请求
  await prismadb.mail_log.create({
    data: {
      type: 'reply',
      queue_id: null,
      mail_id: mailId,
      payload: JSON.stringify(body),
      result: 'received',
    },
  });
  // 查找 mail_queue 记录
  const mail = await prismadb.mail_queue.findFirst({ where: { mail_id: mailId } });
  if (!mail) {
    await prismadb.mail_log.create({
      data: {
        type: 'reply_result',
        queue_id: null,
        mail_id: mailId,
        payload: JSON.stringify(body),
        result: 'not found',
      },
    });
    return NextResponse.json({ error: '未找到原始邮件' }, { status: 404 });
  }
  // 写入 crm_Lead_Contact_Histories（类型为 reply，带 queue_id）
  await prismadb.crm_Lead_Contact_Histories.create({
    data: {
      lead_id: mail.lead_id,
      lead_contact_id: mail.lead_contact_id,
      contact_time: replyTime ? new Date(replyTime) : new Date(),
      contact_method: 'email',
      contact_value: from,
      contact_result: 'reply',
      memo: content,
      sequence_step: mail.step,
      send_status: 'replied',
      queue_id: mail.id,
    },
  });
  // 可选：同步更新 mail_queue 状态
  await prismadb.mail_queue.update({
    where: { id: mail.id },
    data: { status: 'replied' },
  });
  // 日志：处理结果
  await prismadb.mail_log.create({
    data: {
      type: 'reply_result',
      queue_id: mail.id,
      mail_id: mailId,
      payload: JSON.stringify(body),
      result: JSON.stringify({ from, to, subject, content }),
    },
  });
  return NextResponse.json({ success: true });
} 