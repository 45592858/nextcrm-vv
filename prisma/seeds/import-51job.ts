const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  // 通过命令行参数传入文件路径
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error("用法: npx ts-node prisma/seeds/import-51job.ts <json文件路径>");
    process.exit(1);
  }
  const filePath = path.resolve(process.cwd(), fileArg);
  if (!fs.existsSync(filePath)) {
    console.error(`文件不存在: ${filePath}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

  // 查出所有已存在的公司名称
  const allLeads = await prisma.crm_Leads.findMany({
    select: { company: true },
  });
  const existCompanies = new Set(
    (allLeads as Array<{ company: string }>).
      map((l) => l.company)
  );

  let importCount = 0;
  for (const item of data) {
    // 只用公司名称查重
    if (existCompanies.has(item.company)) {
      console.log(`线索已存在: ${item.company}`);
      continue;
    }
    // 拼接 memo 字段内容
    const memoArr = [];
    if (item.title) memoArr.push(item.title);
    if (item.function_category && Array.isArray(item.function_category)) memoArr.push(item.function_category.join("/"));
    if (item.keywords && Array.isArray(item.keywords)) memoArr.push(item.keywords.join(","));
    const memo = memoArr.join(" | ");

    await prisma.crm_Leads.create({
      data: {
        company: item.company,
        region: item.area || undefined,
        industry: item.company_industry || undefined,
        company_type: item.company_type || undefined,
        employee_scale: item.company_scale || undefined,
        address: item.work_address || undefined,
        introduction: item.company_intro || undefined,
        memo,
        lead_source: "51job.com",
        lead_source_content: JSON.stringify(item),
      },
    });
    existCompanies.add(item.company);
    importCount++;
    console.log(`已导入: ${item.company}`);
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
  