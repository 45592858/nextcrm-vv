"use client";

import React, { useEffect, useState } from 'react'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'

export default function LeadContacts({ leadId }: { leadId: string }) {
  const [contacts, setContacts] = useState<any[]>([])
  useEffect(() => {
    fetch(`/api/crm/leads/${leadId}`)
      .then(res => res.json())
      .then(data => {
        let arr: any[] = []
        try {
          arr = JSON.parse(data.contacts || '[]')
        } catch {
          arr = []
        }
        setContacts(Array.isArray(arr) ? arr : [])
      })
  }, [leadId])
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>姓名</TableHead>
            <TableHead>职位</TableHead>
            <TableHead>电话</TableHead>
            <TableHead>邮箱</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">无联系人信息</TableCell>
            </TableRow>
          ) : (
            contacts.map((c, i) => (
              <TableRow key={i}>
                <TableCell>{c.name || '-'}</TableCell>
                <TableCell>{c.title || '-'}</TableCell>
                <TableCell>{c.phone || '-'}</TableCell>
                <TableCell>{c.email || '-'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 