import { z } from "zod";

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const leadSchema = z.object({
  //TODO: fix all the types and nullable
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  company: z.string(),
  lead_source: z.string().optional().nullable(),
  refered_by: z.string().optional().nullable(),
  campaign: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  contacts: z.array(z.object({
    id: z.string(),
    name: z.string().optional().nullable(),
    title: z.string().optional().nullable(),
    appellation: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    others: z.string().optional().nullable(),
    memo: z.string().optional().nullable(),
  })).optional().nullable(),
  memo: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  company_type: z.string().optional().nullable(),
  employee_scale: z.string().optional().nullable(),
  introduction: z.string().optional().nullable(),
  lead_source_content: z.string().optional().nullable(),
});

export type Lead = z.infer<typeof leadSchema>;
