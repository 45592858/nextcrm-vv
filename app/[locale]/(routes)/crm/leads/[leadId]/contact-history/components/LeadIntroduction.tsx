"use client";

import React, { useEffect, useState } from 'react'

export default function LeadIntroduction({ leadId }: { leadId: string }) {
  const [introduction, setIntroduction] = useState<string>('')
  useEffect(() => {
    fetch(`/api/crm/leads/${leadId}`)
      .then(res => res.json())
      .then(data => setIntroduction(data.introduction || ''))
  }, [leadId])
  return (
    <div>
      <h2 className="font-bold mb-2">Introduction</h2>
      <div>{introduction || '无公司简介'}</div>
    </div>
  )
} 