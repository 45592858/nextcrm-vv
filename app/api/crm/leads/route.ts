import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sendEmail from "@/lib/sendmail";

//Create a new lead route
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthenticated", { status: 401 });
  }
  try {
    const body = await req.json();
    const userId = session.user.id;

    if (!body) {
      return new NextResponse("No form data", { status: 400 });
    }

    const { contacts, ...leadData } = body;

    const {
      company,
      lead_source,
      refered_by,
      campaign,
      assigned_to,
      accountIDs,
      region,
      memo,
      industry,
      website,
      address,
      company_type,
      employee_scale,
      introduction,
      lead_source_content,
    } = leadData;

    //console.log(req.body, "req.body");

    const newLead = await prismadb.crm_Leads.create({
      data: {
        v: 1,
        createdBy: userId,
        updatedBy: userId,
        company: company,
        lead_source: lead_source,
        refered_by: refered_by,
        campaign: campaign,
        assigned_to: assigned_to || userId,
        accountsIDs: accountIDs && accountIDs !== "" ? accountIDs : undefined,
        status: "NEW",
        type: "DEMO",
        region: region,
        memo: memo,
        industry: industry,
        website: website,
        address: address,
        company_type: company_type,
        employee_scale: employee_scale,
        introduction: introduction,
        lead_source_content: lead_source_content,
        contacts: contacts && Array.isArray(contacts) && contacts.length > 0 ? { create: contacts } : undefined,
      },
    });

    if (assigned_to && assigned_to !== "" && assigned_to !== userId) {
      const notifyRecipient = await prismadb.users.findFirst({
        where: {
          id: assigned_to,
        },
      });

      if (!notifyRecipient) {
        return new NextResponse("No user found", { status: 400 });
      }

      await sendEmail({
        from: process.env.EMAIL_FROM as string,
        to: notifyRecipient.email || "info@softbase.cz",
        subject:
          notifyRecipient.userLanguage === "en"
            ? `New lead ${company} has been added to the system and assigned to you.`
            : `Nová příležitost ${company} byla přidána do systému a přidělena vám.`,
        text:
          notifyRecipient.userLanguage === "en"
            ? `New lead ${company} has been added to the system and assigned to you. You can click here for detail: ${process.env.NEXT_PUBLIC_APP_URL}/crm/opportunities/${newLead.id}`
            : `Nová příležitost ${company} byla přidána do systému a přidělena vám. Detaily naleznete zde: ${process.env.NEXT_PUBLIC_APP_URL}/crm/opportunities/${newLead.id}`,
      });
    }

    return NextResponse.json({ newLead }, { status: 200 });
  } catch (error) {
    console.log("[NEW_LEAD_POST]", error);
    return new NextResponse("Initial error", { status: 500 });
  }
}

//UPdate a lead route
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthenticated", { status: 401 });
  }
  try {
    const body = await req.json();
    const userId = session.user.id;

    if (!body) {
      return new NextResponse("No form data", { status: 400 });
    }

    const { contacts: updateContacts, id, ...updateData } = body;

    const {
      company,
      lead_source,
      refered_by,
      campaign,
      assigned_to,
      accountIDs,
      status,
      type,
      region,
      memo,
      industry,
      website,
      address,
      company_type,
      employee_scale,
      introduction,
      lead_source_content,
    } = updateData;

    const updatedLead = await prismadb.crm_Leads.update({
      where: { id },
      data: {
        v: 1,
        updatedBy: userId,
        company: company,
        lead_source: lead_source,
        refered_by: refered_by,
        campaign: campaign,
        assigned_to: assigned_to || userId,
        accountsIDs: accountIDs && accountIDs !== "" ? accountIDs : undefined,
        status: status,
        type: type,
        region: region,
        memo: memo,
        industry: industry,
        website: website,
        address: address,
        company_type: company_type,
        employee_scale: employee_scale,
        introduction: introduction,
        lead_source_content: lead_source_content,
        contacts: undefined, // 暂不支持直接批量更新联系人
      },
    });

    if (assigned_to && assigned_to !== "" && assigned_to !== userId) {
      const notifyRecipient = await prismadb.users.findFirst({
        where: {
          id: assigned_to,
        },
      });

      if (!notifyRecipient) {
        return new NextResponse("No user found", { status: 400 });
      }

      await sendEmail({
        from: process.env.EMAIL_FROM as string,
        to: notifyRecipient.email || "info@softbase.cz",
        subject:
          notifyRecipient.userLanguage === "en"
            ? `New lead ${company} has been added to the system and assigned to you.`
            : `Nová příležitost ${company} byla přidána do systému a přidělena vám.`,
        text:
          notifyRecipient.userLanguage === "en"
            ? `New lead ${company} has been added to the system and assigned to you. You can click here for detail: ${process.env.NEXT_PUBLIC_APP_URL}/crm/opportunities/${updatedLead.id}`
            : `Nová příležitost ${company} byla přidána do systému a přidělena vám. Detaily naleznete zde: ${process.env.NEXT_PUBLIC_APP_URL}/crm/opportunities/${updatedLead.id}`,
      });
    }

    return NextResponse.json({ updatedLead }, { status: 200 });
  } catch (error) {
    console.log("[UPDATED_LEAD_POST]", error);
    return new NextResponse("Initial error", { status: 500 });
  }
}
