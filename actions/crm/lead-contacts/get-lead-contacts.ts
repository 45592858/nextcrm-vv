import { prismadb } from "@/lib/prisma";
import { LeadContact } from "@/app/[locale]/(routes)/crm/lead-contacts/table-data/schema";

export const getLeadContacts = async (): Promise<LeadContact[]> => {
  const contacts = await prismadb.crm_Lead_Contacts.findMany({
    include: {
      lead: true,
    },
    orderBy: [
      { lead: { createdAt: "desc" } },
      { lead_id: "asc" },
      { name: "asc" },
    ],
  });
  return contacts.map((c) => ({
    id: c.id,
    name: c.name || '',
    title: c.title || '',
    appellation: c.appellation || '',
    phone: c.phone || '',
    email: c.email || '',
    lead_id: c.lead_id,
    lead_company: c.lead?.company || '',
    lead_region: c.lead?.region || '',
    lead_memo: c.lead?.memo || '',
    lead_industry: c.lead?.industry || '',
    lead_company_type: c.lead?.company_type || '',
    lead_employee_scale: c.lead?.employee_scale || '',
    lead_introduction: c.lead?.introduction || '',
  }));
}; 