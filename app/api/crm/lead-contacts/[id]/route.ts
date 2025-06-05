import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await prismadb.crm_Lead_Contacts.findUnique({
    where: { id },
    include: { lead: true },
  });
  if (!contact) return NextResponse.json({ error: "未找到联系人" }, { status: 404 });
  return NextResponse.json(contact);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const { name, title, phone, email, appellation } = body;
  const updated = await prismadb.crm_Lead_Contacts.update({
    where: { id },
    data: { name, title, phone, email, appellation },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prismadb.crm_Lead_Contacts.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 