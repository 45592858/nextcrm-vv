"use client";

import React, { useEffect, useState } from 'react'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'

type History = {
  id: string
  contact_time: string
  contact_method: string
  contact_value: string
  contact_result: string
  memo?: string
  user?: { name?: string }
  lead_contact?: { name?: string }
}

export default function LeadContactHistoryList({ leadId, refreshKey }: { leadId: string, refreshKey?: number }) {
  const [histories, setHistories] = useState<History[]>([])
  useEffect(() => {
    fetch(`/api/crm/leads/${leadId}/contact-history`)
      .then(res => res.json())
      .then(data => setHistories(Array.isArray(data) ? data : []))
  }, [leadId, refreshKey])
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>跟进时间</TableHead>
            <TableHead>联系人</TableHead>
            <TableHead>方式</TableHead>
            <TableHead>途径</TableHead>
            <TableHead>结果</TableHead>
            <TableHead>备忘</TableHead>
            <TableHead>跟进人</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {histories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">暂无跟进记录</TableCell>
            </TableRow>
          ) : (
            histories.map(h => (
              <TableRow key={h.id}>
                <TableCell>{h.contact_time ? new Date(h.contact_time).toLocaleString() : ''}</TableCell>
                <TableCell>{h.lead_contact?.name || '-'}</TableCell>
                <TableCell>{h.contact_method}</TableCell>
                <TableCell>{h.contact_value}</TableCell>
                <TableCell>{h.contact_result}</TableCell>
                <TableCell>{h.memo}</TableCell>
                <TableCell>{h.user?.name}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 