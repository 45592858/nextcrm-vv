import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Sector } from 'recharts';
import { useTranslations } from 'next-intl';

const COLORS = ['#2563eb', '#10b981', '#f59e42', '#ef4444', '#a78bfa', '#f472b6', '#34d399'];

interface PieChartProps {
  userId?: string;
  highlightContact?: string | null;
  setHighlightContact?: (id: string | null) => void;
}

export default function ContactHistoryPieChart({ userId, highlightContact, setHighlightContact }: PieChartProps) {
  const t = useTranslations();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/crm/contact-histories?groupBy=statistics`)
      .then(res => res.json())
      .then(res => {
        setData(res.pie || []);
        setLoading(false);
      })
      .catch(() => {
        setError('error');
        setLoading(false);
      });
  }, []);

  // 高亮块索引
  useEffect(() => {
    if (!highlightContact) {
      setActiveIndex(null);
      return;
    }
    const idx = data.findIndex(d => d.contactName === highlightContact || d.contactId === highlightContact);
    setActiveIndex(idx >= 0 ? idx : null);
  }, [highlightContact, data]);

  const handlePieClick = (_: any, idx: number) => {
    if (!setHighlightContact) return;
    const contact = data[idx];
    if (!contact) return;
    if (highlightContact === contact.contactName || highlightContact === contact.contactId) {
      setHighlightContact(null);
    } else {
      setHighlightContact(contact.contactName);
    }
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="#222"
          strokeWidth={3}
        />
      </g>
    );
  };

  return (
    <div className="bg-white rounded shadow p-4 flex flex-col items-center justify-center">
      <div className="font-bold mb-2 text-center text-gray-900 w-full">最近一个月联系占比</div>
      {loading ? (
        <div className="text-gray-400 py-8 text-center">加载中...</div>
      ) : error ? (
        <div className="text-red-400 py-8 text-center">error</div>
      ) : !data || data.length === 0 ? (
        <div className="text-gray-400 py-8 text-center">noData</div>
      ) : (
        <ResponsiveContainer width={180} height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="contactName"
              cx="50%"
              cy="50%"
              outerRadius={70}
              label
              activeIndex={activeIndex ?? undefined}
              activeShape={renderActiveShape}
              onClick={handlePieClick}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number, name: string) => `count: ${v}`} />
            <Legend layout="horizontal" align="center" verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
} 