"use client";
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import ContactHistoryStats from './components/ContactHistoryStats';
import DataTable from './components/DataTable';
import Container from '@/app/[locale]/(routes)/components/ui/Container';
import ContactHistoryPieChart from './components/ContactHistoryPieChart';
import ContactHistoryMultiTrendChart from './components/ContactHistoryMultiTrendChart';

export default function MyContactHistoriesPage({ userId }: { userId?: string }) {
  const t = useTranslations();
  const [highlightContact, setHighlightContact] = useState<string | null>(null);
  const [visibleContacts, setVisibleContacts] = useState<string[] | null>(null); // null 表示全部显示
  if (!userId) return <div>{t('Common.required')}</div>;
  return (
    <Container title="跟进记录统计分析" description="统计分析今日、本周、本月、累计的跟进记录，支持多维度图表展示。">
      <h2 className="text-lg font-bold mb-4">跟进记录</h2>
      <div className="flex gap-4 mb-4">
        <div className="flex flex-col w-[375px] min-w-[300px] gap-1">
          <ContactHistoryStats userId={userId} />
          <ContactHistoryPieChart
            userId={userId}
            highlightContact={highlightContact}
            setHighlightContact={setHighlightContact}
          />
        </div>
        <div className="flex-1">
          <ContactHistoryMultiTrendChart
            userId={userId}
            highlightContact={highlightContact}
            visibleContacts={visibleContacts}
            setVisibleContacts={setVisibleContacts}
            setHighlightContact={setHighlightContact}
          />
        </div>
      </div>
      <DataTable />
    </Container>
  );
} 