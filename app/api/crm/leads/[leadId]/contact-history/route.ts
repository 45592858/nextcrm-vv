import { NextResponse } from 'next/server'
import { prismadb } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取联系历史列表
export async function GET(req: Request, { params }: { params: { leadId: string } }) {
  const { leadId } = await params;
  const histories = await prismadb.crm_Lead_Contact_Histories.findMany({
    where: { lead_id: leadId },
    orderBy: { contact_time: 'desc' },
    include: { user: true, lead_contact: true },
  })
  return NextResponse.json(histories)
}

// 新增联系历史
export async function POST(req: Request, { params }: { params: { leadId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { leadId } = await params;
  const body = await req.json()
  const { contact_time, contact_method, contact_through, contact_result, memo, lead_contact_id } = body
  if (!lead_contact_id) {
    return NextResponse.json({ error: '必须选择联系人' }, { status: 400 })
  }
  const user_id = session.user.id
  const history = await prismadb.crm_Lead_Contact_Histories.create({
    data: {
      lead_id: leadId,
      lead_contact_id,
      user_id,
      contact_time: new Date(contact_time),
      contact_method,
      contact_through,
      contact_result,
      memo,
    },
  })
  return NextResponse.json(history)
} 