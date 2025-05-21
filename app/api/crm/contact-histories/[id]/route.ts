import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = params.id;
  const body = await req.json();
  const { contact_time, contact_method, contact_result, memo } = body;
  if (!contact_time || !contact_method || !contact_result) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    const updated = await prismadb.crm_Lead_Contact_Histories.update({
      where: { id },
      data: {
        contact_time: new Date(contact_time),
        contact_method,
        contact_result,
        memo,
      },
    });
    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
} 