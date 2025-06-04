// @ts-nocheck
/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const glob = require("glob");

const prisma = new PrismaClient();

async function main() {
  // 1. 获取目录参数
  const dirArg = process.argv[2];
  if (!dirArg) {
    console.error("用法: npx ts-node prisma/seeds/baidu-ai.ts <目录路径>");
    process.exit(1);
  }
  const dirPath = path.resolve(process.cwd(), dirArg);
  if (!fs.existsSync(dirPath)) {
    console.error(`目录不存在: ${dirPath}`);
    process.exit(1);
  }

  // 2. 获取所有 json 文件
  const globPattern = dirPath.replace(/\\/g, "/") + "/*.json";
  console.log("查找路径：", globPattern);
  const files = glob.sync(globPattern);
  if (!files.length) {
    console.log("目录下没有 json 文件");
    return;
  }

  for (const file of files) {
    // 3. 解析公司名（去掉扩展名和时间戳）
    const base = path.basename(file, ".json");
    // 假设公司名为文件名第一个下划线前的全部内容
    // 但实际如"中椰广东实业控股有限公司_20250520_215512"，取第一个下划线前全部内容
    // 更通用：去掉最后两个下划线及后面内容
    const parts = base.split("_");
    let company = base;
    if (parts.length > 2) {
      company = parts.slice(0, parts.length - 2).join("_");
    }

    // 4. 读取文件内容，去除 markdown 包裹
    let raw = fs.readFileSync(file, "utf-8").trim();
    if (raw.startsWith("```json")) raw = raw.replace(/^```json\s*/, "");
    if (raw.endsWith("```")) raw = raw.replace(/```\s*$/, "");
    raw = raw.trim();
    // 检查是否为有效 JSON
    let contacts;
    try {
      contacts = JSON.parse(raw);
    } catch (e) {
      console.error(`文件 ${file} 不是有效 JSON，跳过`);
      continue;
    }

    // 5. 查找/新建/更新 crm_Lead_Contact_Draft
    let draft = await prisma.crm_Lead_Contact_Draft.findFirst({ where: { company } });
    if (draft && draft.baidu_ai) {
      console.log(`公司 ${company} 已有 baidu_ai 字段，跳过`);
      continue;
    }
    if (!draft) {
      await prisma.crm_Lead_Contact_Draft.create({
        data: {
          company,
          baidu_ai: JSON.stringify(contacts),
          baidu_ai_status: "DRAFT",
        },
      });
      console.log(`公司 ${company} 新建 draft 并写入 baidu_ai`);
    } else {
      await prisma.crm_Lead_Contact_Draft.update({
        where: { id: draft.id },
        data: {
          baidu_ai: JSON.stringify(contacts),
          baidu_ai_status: "DRAFT",
        },
      });
      console.log(`公司 ${company} 更新 draft 写入 baidu_ai`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
