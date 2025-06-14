// @ts-nocheck
/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");
const readline = require("readline");

const prisma = new PrismaClient();

async function waitForConfirm() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("请确保源文件格式为 Unix & UTF-8 no BOM，输入 Y 继续，否则退出: ", (answer) => {
      rl.close();
      resolve(answer.trim().toUpperCase() === 'Y');
    });
  });
}

async function main() {
  // 导入前提示
  const confirmed = await waitForConfirm();
  if (!confirmed) {
    console.log("已取消导入。");
    process.exit(0);
  }
  // 1. 读取文件，文件路径从命令行参数获取，支持编码参数
  const inputArg = process.argv[2];
  const encoding = process.argv[3] || 'utf-8';
  if (!inputArg) {
    console.error("请通过命令行参数指定输入文件路径，如: node mx-co-2.ts <filePath> [encoding]");
    process.exit(1);
  }
  const filePath = path.resolve(inputArg);
  if (!fs.existsSync(filePath)) {
    console.error(`文件不存在: ${filePath}`);
    process.exit(1);
  }
  const buffer = fs.readFileSync(filePath);
  const raw = iconv.decode(buffer, encoding);
  const lines = raw.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    console.error("文件内容不足");
    process.exit(1);
  }

  // 2. 查出所有已存在的公司名称和id
  const allLeads = await prisma.crm_Leads.findMany({ select: { id: true, company: true } });
  const existCompanies = new Set((allLeads as Array<{ company: string }>).map(l => l.company.trim()));

  let importCount = 0;
  for (let i = 1; i < lines.length; i++) { // 跳过表头
    const line = lines[i];
    // 以 | 分割，去除首尾空格
    const parts = line.split("|").map(s => s.trim()).filter(Boolean);
    if (parts.length < 3) continue;
    const region = parts[0];
    const company = parts[1];
    const contactName = (parts[2] === "" || parts[2] === "N/A")  ? undefined : parts[2];
    const contactAppellation = contactName === undefined ? "SIR / MADAM" : contactName;
    const contactEmail = parts[3];
    const contactTitle = parts[4];
    if (!company || !contactEmail) continue;
    if (existCompanies.has(company)) {
      // 公司已存在，检查联系人是否已存在
      const existLead = allLeads.find(l => l.company.trim() === company);
      if (existLead) {
        const existContacts = await prisma.crm_Lead_Contacts.findMany({ where: { lead_id: existLead.id } });
        const existEmails = new Set(existContacts.map(c => c.email?.trim()));
        if (!existEmails.has(contactEmail)) {
          await prisma.crm_Lead_Contacts.create({
            data: {
              lead_id: existLead.id,
              name: contactName,
              appellation: contactAppellation,
              email: contactEmail,
              title: contactTitle,
            },
          });
          console.log(`公司已存在，新增联系人: ${company} - ${contactEmail}`);
        } else {
          console.log(`公司和联系人都已存在: ${company} - ${contactEmail}`);
        }
      }
      continue;
    }
    // 新建lead
    const lead = await prisma.crm_Leads.create({
      data: {
        company,
        lead_source: "mx-import-clearance",
        region,
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
        title: contactTitle,
      },
    });
    existCompanies.add(company);
    allLeads.push({ id: lead.id, company });
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
