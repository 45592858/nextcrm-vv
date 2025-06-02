import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';
import setting from '@/jobs/setting.json';

export async function POST(req: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params;
  // 查找 lead 及第一个联系人
  const lead = await prismadb.crm_Leads.findUnique({
    where: { id: leadId },
    include: { contacts: true },
  });
  if (!lead || !lead.contacts.length) {
    return NextResponse.json({ error: '无联系人' }, { status: 400 });
  }
  const contact = lead.contacts[0];
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
  // 填充模板
  function fillTemplate(templateStr: string, lead: any, contact: any) {
    return templateStr.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      if (contact[key] !== undefined) return contact[key];
      if (lead[key] !== undefined) return lead[key];
      return '';
    });
  }
  const mailTitle = fillTemplate(template.zh_title || '', lead, contact);
  const mailHtml = fillTemplate(template.zh_html_content || '', lead, contact);
  const mailText = fillTemplate(template.zh_text_content || '', lead, contact);
  // 插入 mail_queue
  await prismadb.mail_queue.create({
    data: {
      lead_id: lead.id,
      lead_contact_id: contact.id,
      step: 0,
      from: setting.SENDCLOUD_FROM,
      fromName: setting.SENDCLOUD_FROM_NAME,
      to: contact.email,
      subject: mailTitle,
      html: mailHtml,
      plain: mailText,
      status: 'pending',
    },
  });
  return NextResponse.json({ success: true });
} 