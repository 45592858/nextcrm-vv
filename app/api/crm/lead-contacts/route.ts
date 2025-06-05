import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const contacts = await prismadb.crm_Lead_Contacts.findMany({
    include: { lead: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(contacts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { name, title, phone, email, lead_id } = body;
  if (!name || !lead_id) {
    return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
  }
  const created = await prismadb.crm_Lead_Contacts.create({
    data: { name, title, phone, email, lead_id },
  });
  return NextResponse.json(created);
} 