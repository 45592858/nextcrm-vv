import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get('leadId');
  const contactId = searchParams.get('contactId');
  if (!leadId || !contactId) {
    return NextResponse.json({ error: '参数缺失' }, { status: 400 });
  }
  const sent = await prismadb.mail_queue.findFirst({
    where: {
      lead_id: leadId,
      lead_contact_id: contactId,
      step: 0,
    },
  });
  return NextResponse.json({ sent: !!sent });
} 