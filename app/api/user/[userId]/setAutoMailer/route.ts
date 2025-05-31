import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthenticated", { status: 401 });
  }

  const userId = params.userId;

  if (!userId) {
    return new NextResponse("No userID, userId is required", { status: 401 });
  }

  const { mailAddress, mailFromNameEn, mailFromNameCn, contactNo } = await req.json();

  if (!mailAddress || !mailFromNameEn || !mailFromNameCn || !contactNo) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  try {
    const exist = await prismadb.auto_mailer_configs.findFirst({
      where: { user: userId },
    });
    if (exist) {
      const updated = await prismadb.auto_mailer_configs.update({
        where: { id: exist.id },
        data: {
          mail_address: mailAddress,
          mail_from_name_en: mailFromNameEn,
          mail_from_name_cn: mailFromNameCn,
          contact_no: contactNo,
        },
      });
      return NextResponse.json(updated, { status: 200 });
    } else {
      const created = await prismadb.auto_mailer_configs.create({
        data: {
          v: 0,
          user: userId,
          mail_address: mailAddress,
          mail_from_name_en: mailFromNameEn,
          mail_from_name_cn: mailFromNameCn,
          contact_no: contactNo,
        },
      });
      return NextResponse.json(created, { status: 200 });
    }
  } catch (error) {
    console.log("[USER_SET_AUTO_MAILER]", error);
    return new NextResponse("Server error", { status: 500 });
  }
} 