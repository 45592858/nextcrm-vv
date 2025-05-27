// prisma/seeds/get-leads.ts

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// 公司名归一化函数
function normalizeCompanyName(name: string): string {
  if (!name) return "";
  return name
    .replace(/[（）()]/g, "") // 去掉中英文括号
    .replace(/\s+/g, "")      // 去掉所有空格
    .replace(/[·.．、，,]/g, "") // 去掉常见分隔符
    .toLowerCase();           // 全部转小写
} // 处理，类似：明彩智慧中山科技有限公司、明彩智慧（中山）科技有限公司 的问题

async function main() {
  // 1. 查询所有 baidu_ai_status=DRAFT 的记录
  const drafts = await prisma.crm_Lead_Contact_Draft.findMany({
    where: { baidu_ai_status: "DRAFT" },
  });
  // 2. 查询所有 leads，只查一次
  const allLeads = await prisma.crm_Leads.findMany();
  let updateCount = 0;
  for (const draft of drafts) {
    if (!draft.baidu_ai) continue;
    const draftNorm = normalizeCompanyName(draft.company);
    // 3. 在内存中查找归一化后匹配的 lead
    const lead = allLeads.find((l: { company: string }) => normalizeCompanyName(l.company) === draftNorm);
    if (!lead) {
      console.log(`未找到公司：${draft.company}，跳过`);
      continue;
    }
    // 4. 更新 contacts 字段
    await prisma.crm_Leads.update({
      where: { id: lead.id },
      data: { contacts: draft.baidu_ai },
    });
    // 5. 更新 baidu_ai_status 为 DONE
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
