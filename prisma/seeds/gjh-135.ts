// @ts-nocheck
/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require("@prisma/client");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

/*
135届汽车以及配件采购商.xls 数据导入
用法：node prisma/seeds/gjh-135.js <xls文件路径>
*/
const prisma = new PrismaClient();

// 清理字符串中的所有不可见字符（空格、制表符、换行符等）
function cleanString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[\s\uFEFF\xA0]+/g, '') // 移除所有空白字符（空格、制表符、换行符等）和零宽空格
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // 移除零宽字符
    .replace(/\u00A0/g, '') // 移除 &nbsp;
    .trim(); // 以防万一，再次去除首尾空格
}

async function importFile(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet);
  console.log('Excel 预览前5行:', rows.slice(0, 5));
  if (rows.length > 0) {
    console.log('检测到的字段名:', Object.keys(rows[0]));
  }
  const source = path.basename(filePath); // 只取文件名
  const language = 'en'; // 采购商默认英文

  // 查询已存在的邮箱，全部转小写
  const existedEmailsArr = await prisma.crm_Lead_Mail_Only.findMany({ select: { email: true } });
  const existedEmails = new Set(existedEmailsArr.map(e => cleanString(e.email || '').toLowerCase()));

  // 字段映射，全部小写
  const data = rows.map(row => {
    let company = row["COMPANY"] || row["COMPANY NAME"] || row["公司名称"] || row["公司"] || "";
    let state = row["STATE"] || row["country"] || row["国家"] || row["省份"] || row["地区"] || "";
    let products = row["PRODUCTS"] || row["产品"] || row["PROCUREMENT OF PRODUCTS"] || row["需求商品名称"] || "";
    let email = row["EMAIL"] || row["EMAIL ADDRESS"] || row["邮箱"] || row["电子邮件"] || "";

    // 清理所有字段的不可见字符
    company = cleanString(company);
    state = cleanString(state);
    products = cleanString(products);
    email = cleanString(email);

    // 只导入有邮箱和公司名的数据，且邮箱不能重复
    if (!email || !company) return null;
    if (existedEmails.has(email.toLowerCase())) return null;

    // 支持多分隔符：/ , ; 并拆分为多条记录
    const emailList = email.split(/[\/;,]/).map(e => e.trim()).filter(Boolean);
    for (const singleEmail of emailList) {
      return {
        company,
        state,
        products,
        email: singleEmail,
        source,
        language,
      };
    }
  }).filter(Boolean);

  if (data.length === 0) {
    console.log(`[${source}] 未找到有效数据，或表头不匹配，或已导入过。`);
    return 0;
  }

  // 批量插入
  const batchSize = 100;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await prisma.crm_Lead_Mail_Only.createMany({ data: batch });
    console.log(`[${source}] 已导入 ${Math.min(i + batch.length, data.length)}/${data.length}`);
  }
  return data.length;
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("请传入 xls/xlsx 文件路径或目录，如: npx ts-node prisma/seeds/gjh-135.ts ./prisma/seeds/gjh-135/");
    process.exit(1);
  }

  let files = [];
  if (fs.existsSync(inputPath) && fs.lstatSync(inputPath).isDirectory()) {
    // 目录，遍历所有 xls/xlsx 文件
    files = fs.readdirSync(inputPath)
      .filter(f => f.endsWith('.xls') || f.endsWith('.xlsx'))
      .map(f => require('path').join(inputPath, f));
  } else if (fs.existsSync(inputPath) && fs.lstatSync(inputPath).isFile()) {
    files = [inputPath];
  } else {
    console.error("路径不存在或无效");
    process.exit(1);
  }

  let total = 0;
  for (const file of files) {
    const count = await importFile(file);
    total += count;
  }
  console.log(`全部导入完成，总计：${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
