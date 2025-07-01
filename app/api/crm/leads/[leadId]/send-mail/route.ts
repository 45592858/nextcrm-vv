import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';
import { fillTemplate, getMailVars, getSender } from '@/lib/mailTemplate';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params;
  let contactId: string | undefined = undefined;
  let body: any = {};
  try {
    body = await req.json();
    contactId = body.contactId;
  } catch (e) {
    // 兼容无 body 情况
  }
  if (!contactId) {
    return NextResponse.json({ error: '缺少联系人ID' }, { status: 400 });
  }
  // 查找 lead 及联系人
  const lead = await prismadb.crm_Leads.findUnique({
    where: { id: leadId },
    include: { contacts: true },
  });
  if (!lead || !lead.contacts.length) {
    return NextResponse.json({ error: '无联系人' }, { status: 400 });
  }
  const contact = lead.contacts.find((c: any) => c.id === contactId);
  if (!contact) {
    return NextResponse.json({ error: '未找到联系人' }, { status: 400 });
  }
  if (!contact.email) {
    return NextResponse.json({ error: '联系人无邮箱' }, { status: 400 });
  }
  // 查找 step=0 模板
  const template = await prismadb.crm_Lead_Mail_Template.findFirst({
    where: { sequence_step: 0, status: 'active' },
    orderBy: { created_at: 'desc' },
  });
  if (!template) {
    return NextResponse.json({ error: '无可用模板' }, { status: 400 });
  }
  // 优先用当前登录用户的 userId 查找 auto_mailer_configs
  let userId: string | undefined = undefined;
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    userId = session.user.id;
  }
  if (!userId && lead.createdBy) userId = lead.createdBy;
  if (!userId && lead.assigned_to) userId = lead.assigned_to;
  if (!userId) {
    return NextResponse.json({ error: '未找到发件人用户' }, { status: 400 });
  }
  const autoMailer = await prismadb.auto_mailer_configs.findFirst({
    where: { user: userId },
  });
  if (!autoMailer) {
    return NextResponse.json({ error: '未找到发件人配置' }, { status: 400 });
  }
  // 组装变量并填充模板
  const vars = getMailVars(contact, autoMailer, lead.language ?? undefined);
  
  // 使用 getSender 函数获取发件人信息
  const { from, fromName } = getSender(autoMailer, lead.language || undefined);
  
  let mailTitle, mailHtml, mailText;
  if (lead.language === 'en') {
    mailTitle = fillTemplate(template.en_title || '', lead, vars, contact);
    mailHtml = fillTemplate(template.en_html_content || '', lead, vars, contact);
    mailText = fillTemplate(template.en_text_content || '', lead, vars, contact);
  } else {
    mailTitle = fillTemplate(template.zh_title || '', lead, vars, contact);
    mailHtml = fillTemplate(template.zh_html_content || '', lead, vars, contact);
    mailText = fillTemplate(template.zh_text_content || '', lead, vars, contact);
  }
  // 插入 mail_queue
  const queue = await prismadb.mail_queue.create({
    data: {
      lead_id: lead.id,
      lead_contact_id: contact.id,
      step: 0,
      from,
      fromName,
      to: contact.email,
      subject: mailTitle,
      html: mailHtml,
      plain: mailText,
      status: 'pending',
    },
  });
  // 插入新的 crm_Lead_Contact_Histories 记录
  await prismadb.crm_Lead_Contact_Histories.create({
    data: {
      lead_id: lead.id,
      lead_contact_id: contact.id,
      contact_time: new Date(),
      contact_method: '邮件',
      contact_value: contact.email,
      sequence_step: 0,
      send_status: 'pending',
      send_email_at: new Date(),
      queue_id: queue.id,
    },
  });
  return NextResponse.json({ success: true });
} 