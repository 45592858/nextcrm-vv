import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { subDays, startOfDay, endOfDay, startOfWeek, startOfMonth, format, isAfter } from 'date-fns';

// GET: 查询联系历史列表/统计
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get('leadId');
  const userId = searchParams.get('userId');
  const leadCompanyId = searchParams.get('leadCompanyId');
  const groupBy = searchParams.get('groupBy'); // stats/day
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

  let where: any = {};
  if (leadId) where.lead_id = leadId;
  if (userId) where.user_id = userId;
  if (leadCompanyId) {
    // 查询该公司下所有线索id（假设 company 字段为公司名）
    const leads = await prismadb.crm_Leads.findMany({
      where: { company: leadCompanyId },
      select: { id: true },
    });
    where.lead_id = { in: leads.map(l => l.id) };
  }

  // 统计模式
  if (groupBy === 'stats') {
    // 今日
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    // 本周
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    // 本月
    const monthStart = startOfMonth(now);
    const [today, week, month, total] = await Promise.all([
      prismadb.crm_Lead_Contact_Histories.count({
        where: { ...where, contact_time: { gte: todayStart, lte: todayEnd } },
      }),
      prismadb.crm_Lead_Contact_Histories.count({
        where: { ...where, contact_time: { gte: weekStart, lte: todayEnd } },
      }),
      prismadb.crm_Lead_Contact_Histories.count({
        where: { ...where, contact_time: { gte: monthStart, lte: todayEnd } },
      }),
      prismadb.crm_Lead_Contact_Histories.count({ where }),
    ]);
    return NextResponse.json({ data: { today, week, month, total } });
  }

  if (groupBy === 'day') {
    // 近30天每日联系数
    const now = new Date();
    const from = subDays(startOfDay(now), 29);
    const all = await prismadb.crm_Lead_Contact_Histories.findMany({
      where: { ...where, contact_time: { gte: from, lte: endOfDay(now) } },
      select: { contact_time: true },
    });
    // 统计每日数量
    const days: { [date: string]: number } = {};
    for (let i = 0; i < 30; i++) {
      const d = format(subDays(startOfDay(now), 29 - i), 'yyyy-MM-dd');
      days[d] = 0;
    }
    all.forEach((item: { contact_time: Date }) => {
      const d = format(item.contact_time, 'yyyy-MM-dd');
      if (days[d] !== undefined) days[d]++;
    });
    const data = Object.entries(days).map(([date, count]) => ({ date, count }));
    return NextResponse.json({ data });
  }

  // 新增：多联系人统计（饼状图+多折线趋势图）
  if (groupBy === 'statistics') {
    const now = new Date();
    const from = subDays(startOfDay(now), 29);
    // 查询近30天所有联系历史，带 user_id
    const histories = await prismadb.crm_Lead_Contact_Histories.findMany({
      where: { ...where, contact_time: { gte: from, lte: endOfDay(now) } },
      select: { contact_time: true, user_id: true },
    });
    // 统计每个跟进人总数（饼状图）
    const pieMap: Record<string, number> = {};
    histories.forEach(h => {
      if (!pieMap[h.user_id]) pieMap[h.user_id] = 0;
      pieMap[h.user_id]++;
    });
    const userIds = Object.keys(pieMap);
    // 查跟进人姓名
    let users: { id: string; name: string | null }[] = [];
    if (userIds.length > 0) {
      users = await prismadb.users.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
      });
    }
    const userNameMap = Object.fromEntries(
      users.map(u => [u.id, u.name || u.id])
    );
    const pie = userIds.map(id => ({
      contactId: id,
      contactName: userNameMap[id] || id,
      count: pieMap[id],
    }));
    // 统计每日每个跟进人的联系数（多折线）
    const days: string[] = [];
    for (let i = 0; i < 30; i++) {
      days.push(format(subDays(startOfDay(now), 29 - i), 'yyyy-MM-dd'));
    }
    // 初始化 trendMap: { date: { 总计: n, 张三: n, ... } }
    const trendMap: Record<string, Record<string, number>> = {};
    days.forEach(date => {
      trendMap[date] = { 总计: 0 };
      users.forEach(u => {
        trendMap[date][userNameMap[u.id] || u.id] = 0;
      });
    });
    histories.forEach(h => {
      const date = format(h.contact_time, 'yyyy-MM-dd');
      const name = userNameMap[h.user_id] || h.user_id;
      if (trendMap[date]) {
        trendMap[date][name]++;
        trendMap[date]['总计']++;
      }
    });
    const trend = days.map(date => ({ date, ...trendMap[date] }));
    return NextResponse.json({ pie, trend });
  }

  // 列表模式
  const total = await prismadb.crm_Lead_Contact_Histories.count({ where });
  const data = await prismadb.crm_Lead_Contact_Histories.findMany({
    where,
    orderBy: { contact_time: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      lead: { select: { id: true, company: true } },
      user: true,
      lead_contact: { select: { name: true } },
    },
  });
  return NextResponse.json({ data, total });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { lead_id, contact_time, contact_method, contact_value, contact_result, memo } = body;

  if (!lead_id || !contact_time || !contact_method || !contact_result) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const record = await prismadb.crm_Lead_Contact_Histories.create({
      data: {
        lead_id,
        user_id: session.user.id,
        contact_time: new Date(contact_time),
        contact_method,
        contact_value,
        contact_result,
        memo,
        created_at: new Date(),
      },
    });
    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.log('[LEAD_CONTACT_HISTORY_POST]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
} 