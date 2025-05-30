import { prismadb } from "@/lib/prisma";
export async function getMailTemplateById(id: string) {
  return await prismadb.crm_Lead_Mail_Template.findUnique({ where: { id } });
} 