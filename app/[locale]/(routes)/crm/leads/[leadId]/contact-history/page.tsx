"use client";

import Container from '@/app/[locale]/(routes)/components/ui/Container'
import React, { useState } from 'react'
import LeadIntroduction from './components/LeadIntroduction'
import LeadContacts from './components/LeadContacts'
import LeadContactHistoryList from './components/LeadContactHistoryList'
import NewLeadContactHistoryForm from './components/NewLeadContactHistoryForm'

function SectionCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="rounded-lg p-3 min-h-0 mb-2 md:mb-0 transition-all duration-200 border border-transparent hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm">
      <h2 className="font-semibold text-lg mb-2">{title}</h2>
      <div>{children}</div>
    </div>
  )
}

export default function ContactHistoryPage({ params }: { params: Promise<{ leadId: string, locale: string }> }) {
  const { leadId } = React.use(params)
  const [refreshKey, setRefreshKey] = useState(0)
  const handleHistoryAdded = () => setRefreshKey(k => k + 1)
  return (
    <Container title="跟进记录" description="线索跟进全流程追踪，助力销售高效转化。">
      <div className="rounded-xl border border-border bg-background/80 shadow-md p-3 md:p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:px-2">
          <div className="space-y-4 md:pl-1">
            <SectionCard title="Introduction">
              <LeadIntroduction leadId={leadId} />
            </SectionCard>
            <SectionCard title="历史跟进记录">
              <LeadContactHistoryList leadId={leadId} refreshKey={refreshKey} />
            </SectionCard>
          </div>
          <div className="space-y-4 md:pr-1">
            <SectionCard title="Contacts">
              <LeadContacts leadId={leadId} />
            </SectionCard>
            <SectionCard title="新增跟进记录">
              <NewLeadContactHistoryForm leadId={leadId} onSuccess={handleHistoryAdded} />
            </SectionCard>
          </div>
        </div>
      </div>
    </Container>
  )
} 