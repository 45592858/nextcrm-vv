import React, { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTranslations } from 'next-intl';

const COLORS = ['#2563eb', '#10b981', '#f59e42', '#ef4444', '#a78bfa', '#f472b6', '#34d399', '#eab308', '#6366f1', '#f43f5e', '#14b8a6', '#facc15', '#a3e635', '#f87171', '#fbbf24'];

interface TrendChartProps {
  userId?: string;
  highlightContact?: string | null;
  visibleContacts?: string[] | null;
  setVisibleContacts?: (ids: string[]) => void;
  setHighlightContact?: (id: string | null) => void;
}

export default function ContactHistoryMultiTrendChart({ userId, highlightContact, visibleContacts, setVisibleContacts, setHighlightContact }: TrendChartProps) {
  const t = useTranslations();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/crm/contact-histories?groupBy=statistics`)
      .then(res => res.json())
      .then(res => {
        setData(res.trend || []);
        setLoading(false);
      })
      .catch(() => {
        setError('error');
        setLoading(false);
      });
  }, []);

  // 自动识别所有联系人（除date字段）
  const allContactNames = useMemo(() => (data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'date') : []), [data]);
  // 当前显示的联系人
  const showContacts = visibleContacts ?? allContactNames;

  // 切换联系人显示/隐藏
  const handleLegendClick = (name: string) => {
    if (!setVisibleContacts) return;
    if (showContacts.includes(name)) {
      setVisibleContacts(showContacts.filter(n => n !== name));
    } else {
      setVisibleContacts([...showContacts, name]);
    }
  };

  // 高亮联系人
  const handleLegendHighlight = (name: string) => {
    if (setHighlightContact) setHighlightContact(name === highlightContact ? null : name);
  };

  // Legend渲染（居中显示）
  const renderLegend = () => (
    <div className="mt-2 flex flex-col items-center">
      <div className="flex gap-2 overflow-x-auto pb-1 justify-center" style={{ maxWidth: '100%' }}>
        {allContactNames.map((name, idx) => (
          <div
            key={name}
            className={`flex items-center cursor-pointer px-2 py-1 rounded whitespace-nowrap border ${showContacts.includes(name) ? 'bg-blue-100 border-blue-400' : 'bg-gray-100 border-gray-200'} ${highlightContact === name ? 'ring-2 ring-blue-500' : ''}`}
            style={{ borderWidth: 1 }}
            onClick={() => handleLegendClick(name)}
            onDoubleClick={() => handleLegendHighlight(name)}
            title="单击切换显示，双击高亮"
          >
            <span className="w-3 h-3 rounded-full mr-1" style={{ background: COLORS[idx % COLORS.length], display: 'inline-block' }} />
            <span>{name}</span>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-400 mt-1 text-center w-full">单击切换显示，双击高亮</div>
    </div>
  );

  return (
    <div className="bg-white rounded shadow p-4">
      <div className="font-bold mb-2 text-center text-gray-900 w-full">最近一个月联系趋势</div>
      {loading ? (
        <div className="text-gray-400 py-8 text-center">加载中...</div>
      ) : error ? (
        <div className="text-red-400 py-8 text-center">加载失败，请重试</div>
      ) : !data || data.length === 0 ? (
        <div className="text-gray-400 py-8 text-center">暂无数据</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              {allContactNames.map((name, idx) =>
                showContacts.includes(name) ? (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={highlightContact === name ? 4 : (name === '总计' ? 3 : 2)}
                    dot={false}
                    opacity={highlightContact && highlightContact !== name ? 0.3 : 1}
                  />
                ) : null
              )}
            </LineChart>
          </ResponsiveContainer>
          {renderLegend()}
        </>
      )}
    </div>
  );
} 