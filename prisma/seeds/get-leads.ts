// prisma/seeds/get-leads.ts
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require("@prisma/client");
const axios = require("axios");

const API_URL = "http://127.0.0.1:5005/v1/chat/completions";
const TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5MzQ0ZTY1LWJiYzktNDRkMS1hOWQwLWY5NTdiMDc5YmQwZSIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSJdLCJhenAiOiJUZEpJY2JlMTZXb1RIdE45NW55eXdoNUU0eU9vNkl0RyIsImNsaWVudF9pZCI6ImFwcF9YOHpZNnZXMnBROXRSM2RFN25LMWpMNWdIIiwiZXhwIjoxNzQ4NDM3Nzk5LCJodHRwczovL2FwaS5vcGVuYWkuY29tL2F1dGgiOnsicG9pZCI6Im9yZy1ZWXRkZ2VpckZsZUVOVWZ4R0g4V3p5MHMiLCJ1c2VyX2lkIjoidXNlci1oRDdEMHQ1VzNibGFzTXppTWdJMU1QRlMifSwiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS9wcm9maWxlIjp7ImVtYWlsIjoibmVidWxhY2lwaGVyNzUyOUBwcm90b24ubWUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sImlhdCI6MTc0NzU3Mzc5OCwiaXNzIjoiaHR0cHM6Ly9hdXRoLm9wZW5haS5jb20iLCJqdGkiOiJiZmU3ODUzNy04ZGQxLTRjN2EtOTEzZC04YWUwZDVhNDNkN2EiLCJuYmYiOjE3NDc1NzM3OTgsInB3ZF9hdXRoX3RpbWUiOjE3NDM4MTk3NzI0NzcsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgcGhvbmUgZW1haWxfY29kZV92ZXJpZmljYXRpb24iLCJzY3AiOlsib3BlbmlkIiwiZW1haWwiLCJwcm9maWxlIiwib2ZmbGluZV9hY2Nlc3MiLCJtb2RlbC5yZXF1ZXN0IiwibW9kZWwucmVhZCIsIm9yZ2FuaXphdGlvbi5yZWFkIiwib3JnYW5pemF0aW9uLndyaXRlIl0sInNlc3Npb25faWQiOiJhdXRoc2Vzc19aOVhSNU1Wb05NQ2l6YW5rc1FKVzRmNlUiLCJzdWIiOiJhdXRoMHw2NjBjMTZmMmVkZjBlM2QyNzE5OWU5YzUifQ.QVY0cqBcj8WjoulkM7vE-rQXYPloT2FDzyauid0LJWo25OfL_hAe3u-CNGNGwHP9LXBo3_Ps-G0t2yUvvr6IlsLUjJAz9x4BqYTDG7oSzU2KA1oXGj5rnUG4FIPgSqF69Z8hQaVSfl4VWwkD70OoO1V0NpEJ5h8WlE08BNoaGD1l41PN1Es-vrcAfAcNkkrR3iM6pkGD0DmA-KqJ7SvNrlWhA4TTlmmHlOOJQ1MurFHo4iVIzLWeyl5uBSoc4LX4pOObmqgk7TZIojJvb66UI8Aoz32Q0hjE8fcSNirAbxdO1Rsshv-c4imYr10422u1XD33OpxVsQUQ2cSqm1ERBafjwBmmRu-bzqMgim0o6yPgBG9rHWKjG9FL-xQ81v5EqvJFxwExzNlOHl62QhugXkasANiMwsmBuPJSMz7tqvESQ1Mnlgi_8zGcIDens0JiwGkjQ3RuAQR6_HMJSu07BEoEJR24MFMJSFGjtRjYEteIfDO68UNvUoWJhnFtA60XowWZst0VJbPdeslrbPXQf8T5Kyd3pWfIJqjehnUCqJ1oLZTXROeJfKuzGraCCu5e2ryXD-ECd7QHWzhd3wlnhX5JWQJ8_AfJnMIIIDIkJiVJVhqO0UjY7vU_euRjnVgMZfuL_xwJIZ5ptnQbvJJxd3iUu-OY6OY3wXFOliFLPPE";

const prisma = new PrismaClient();

async function main() {
  // 1. 获取 leads 前3条（可根据实际需求调整）
  const leads = await prisma.crm_Leads.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  for (const lead of leads) {
    const company = lead.company;
    if (!company) {
      console.log(`线索 ${lead.id} 无公司名，跳过`);
      continue;
    }
    // 2. 检查是否已存在 draft
    const draft = await prisma.crm_Lead_Contact_Draft.findFirst({
      where: { company },
    });
    if (draft) {
      console.log(`公司 ${company} 已存在 draft，跳过`);
      continue;
    }
    // 3. 请求网络获取联系方式
    try {
      const response = await axios.post(
        API_URL,
        {
          // "temporary-chat": true,
          // model: "GPT-4o",
          // messages: [
          //   {
          //     role: "user",
          //     content: `请帮我联网查找 ${company} 的官网、电子邮箱、官方电话、联系人（姓名、称谓、职位、电话、电子邮箱），有多个联系人时，请全部列出`,
          //   },
          // ],
          // stream: false,
          "temporary-chat": true,
          model: "GPT-o3",
          messages: [
            {
              role: "user",
              content: `请帮我联网查找{${company}}的联系方式，包括联系人、职位、电话、电子邮箱等，最理想是负责外贸业务、跟单相关的工作人员的联系方式，如果有多个联系人时，请全部列出`,
            },
          ],
          stream: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      const content = response.data?.choices?.[0]?.message?.content || JSON.stringify(response.data);
      // 4. 保存到 draft
      await prisma.crm_Lead_Contact_Draft.create({
        data: {
          company,
          baidu_ai: content,
          baidu_ai_status: "DRAFT",
        },
      });
      console.log(`公司 ${company} 联系方式已保存 draft`);
    } catch (error) {
      console.error(`公司 ${company} 获取线索失败:`, error);
      process.exit(1);
    }
    // 5. 间隔2秒
    await new Promise((res) => setTimeout(res, 2000));
  }
}

main().finally(() => process.exit(0));
