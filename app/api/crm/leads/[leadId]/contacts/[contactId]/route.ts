import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ leadId: string; contactId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { leadId, contactId } = await params;
  const body = await req.json();
  // 只允许更新部分字段
  const { appellation, name, email, phone, title, others, memo } = body;
  if (!contactId) {
    return NextResponse.json({ error: "缺少联系人ID" }, { status: 400 });
  }
  // 可选：校验该联系人确实属于该 leadId
  const contact = await prismadb.crm_Lead_Contacts.findUnique({ where: { id: contactId } });
  if (!contact || contact.lead_id !== leadId) {
    return NextResponse.json({ error: "联系人不存在或不属于该线索" }, { status: 404 });
  }
  const updated = await prismadb.crm_Lead_Contacts.update({
    where: { id: contactId },
    data: { appellation, name, email, phone, title, others, memo },
  });
  return NextResponse.json(updated);
} 