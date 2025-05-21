import { NextResponse } from 'next/server'
import { prismadb } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取联系历史列表
export async function GET(req: Request, { params }: { params: { leadId: string } }) {
  const { leadId } = params
  const histories = await prismadb.crm_Lead_Contact_Histories.findMany({
    where: { lead_id: leadId },
    orderBy: { contact_time: 'desc' },
    include: { user: true },
  })
  return NextResponse.json(histories)
}

// 新增联系历史
export async function POST(req: Request, { params }: { params: { leadId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { leadId } = params
  const body = await req.json()
  const { contact_time, contact_method, contact_through, contact_result, memo } = body
  const user_id = session.user.id
  const history = await prismadb.crm_Lead_Contact_Histories.create({
    data: {
      lead_id: leadId,
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