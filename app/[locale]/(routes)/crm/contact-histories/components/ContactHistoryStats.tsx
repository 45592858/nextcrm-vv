import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface Stats {
  today: number;
  week: number;
  month: number;
  total: number;
}

interface Props {
  leadId?: string;
  userId?: string;
  leadCompanyId?: string;
}

export default function ContactHistoryStats({ leadId, userId, leadCompanyId }: Props) {
  const t = useTranslations();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (leadId) params.append('leadId', leadId);
    if (leadCompanyId) params.append('leadCompanyId', leadCompanyId);
    params.append('groupBy', 'stats');
    fetch(`/api/crm/contact-histories?${params.toString()}`)
      .then(res => res.json())
      .then(res => {
        setStats(res.data || { today: 0, week: 0, month: 0, total: 0 });
        setLoading(false);
      })
      .catch(() => {
        setStats(null);
        setLoading(false);
      });
  }, [leadId, leadCompanyId]);

  if (loading) return <div className="py-4 text-gray-400">加载中...</div>;
  if (!stats) return <div className="py-4 text-gray-400">暂无数据</div>;

  return (
    <div className="flex gap-4 mb-4">
      <StatCard title="今日" value={stats.today} />
      <StatCard title="本周" value={stats.week} />
      <StatCard title="本月" value={stats.month} />
      <StatCard title="累计" value={stats.total} />
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded shadow px-3 py-2 flex flex-col items-center min-w-[80px] h-[60px]">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{title}</div>
      <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
    </div>
  );
} 