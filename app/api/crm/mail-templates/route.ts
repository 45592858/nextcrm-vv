import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const templates = await prismadb.crm_Lead_Mail_Template.findMany({
    orderBy: { sequence_step: "asc" },
  });
  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthenticated", { status: 401 });
  }
  try {
    const body = await req.json();
    const userId = session.user.id;
    const template = await prismadb.crm_Lead_Mail_Template.create({
      data: { ...body },
    });
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    return new NextResponse("Error creating template", { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthenticated", { status: 401 });
  }
  try {
    const body = await req.json();
    if (!Array.isArray(body)) {
      return new NextResponse("Invalid data", { status: 400 });
    }
    const results = await Promise.all(
      body.map((item) =>
        prismadb.crm_Lead_Mail_Template.update({
          where: { id: item.id },
          data: item,
        })
      )
    );
    return NextResponse.json(results);
  } catch (error) {
    return new NextResponse("Error updating templates", { status: 500 });
  }
} 