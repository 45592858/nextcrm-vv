// @ts-nocheck
/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  // 1. 读取文件
  const filePath = path.resolve(__dirname, "../../temp/墨西哥进口清关公司和报关行.txt");
  if (!fs.existsSync(filePath)) {
    console.error(`文件不存在: ${filePath}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  const lines = raw.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    console.error("文件内容不足");
    process.exit(1);
  }

  // 2. 查出所有已存在的公司名称
  const allLeads = await prisma.crm_Leads.findMany({ select: { company: true } });
  const existCompanies = new Set((allLeads as Array<{ company: string }>).map(l => l.company.trim()));

  let importCount = 0;
  for (let i = 1; i < lines.length; i++) { // 跳过表头
    const line = lines[i];
    // 以 | 分割，去除首尾空格
    const parts = line.split("|").map(s => s.trim()).filter(Boolean);
    if (parts.length < 3) continue;
    const company = parts[0];
    const contactName = parts[1] === "N/A" ? undefined : parts[1];
    const contactAppellation = parts[1] === "N/A" ? "SIR / MADAM" : parts[1];
    const contactEmail = parts[2];
    if (!company || !contactEmail) continue;
    if (existCompanies.has(company)) {
      console.log(`已存在: ${company}`);
      continue;
    }
    // 新建lead
    const lead = await prisma.crm_Leads.create({
      data: {
        company,
        lead_source: "mx-import-clearance",
        language: "en",
      },
    });
    // 新建联系人
    await prisma.crm_Lead_Contacts.create({
      data: {
        lead_id: lead.id,
        name: contactName,
        appellation: contactAppellation,
        email: contactEmail,
      },
    });
    existCompanies.add(company);
    importCount++;
    console.log(`已导入: ${company}`);
  }
  console.log(`共导入新线索: ${importCount} 条`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
