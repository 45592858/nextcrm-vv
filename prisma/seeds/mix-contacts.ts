// prisma/seeds/get-leads.ts

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // 1. 查询所有 baidu_ai_status=DRAFT 的记录
  const drafts = await prisma.crm_Lead_Contact_Draft.findMany({
    where: { baidu_ai_status: "DRAFT" },
  });
  let updateCount = 0;
  for (const draft of drafts) {
    if (!draft.baidu_ai) continue;
    // 2. 查找 crm_Leads
    const lead = await prisma.crm_Leads.findFirst({ where: { company: draft.company } });
    if (!lead) {
      console.log(`未找到公司：${draft.company}，跳过`);
      continue;
    }
    // 3. 更新 contacts 字段
    await prisma.crm_Leads.update({
      where: { id: lead.id },
      data: { contacts: draft.baidu_ai },
    });
    // 4. 更新 baidu_ai_status 为 DONE
    await prisma.crm_Lead_Contact_Draft.update({
      where: { id: draft.id },
      data: { baidu_ai_status: "DONE" },
    });
    updateCount++;
    console.log(`公司 ${draft.company} 联系人已同步到 crm_Leads 并标记 DONE`);
  }
  console.log(`共同步 ${updateCount} 条联系人数据`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
