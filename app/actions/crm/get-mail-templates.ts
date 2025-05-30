import { prismadb } from "@/lib/prisma";
export async function getMailTemplates() {
  return await prismadb.crm_Lead_Mail_Template.findMany({ orderBy: { sequence_step: "asc" } });
} 