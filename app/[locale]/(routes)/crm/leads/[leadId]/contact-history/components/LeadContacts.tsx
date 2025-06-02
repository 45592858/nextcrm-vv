"use client";

import React, { useEffect, useState } from 'react'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import IconButton from '@/components/ui/IconButton';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';

// 自定义邮件图标
const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <polyline points="3 7 12 13 21 7" />
  </svg>
);

export default function LeadContacts({ leadId }: { leadId: string }) {
  const [contacts, setContacts] = useState<any[]>([])
  const { toast } = useToast();

  useEffect(() => {
    fetch(`/api/crm/leads/${leadId}`)
      .then(res => res.json())
      .then(data => {
        setContacts(Array.isArray(data.contacts) ? data.contacts : [])
      })
  }, [leadId])

  // 检查该联系人邮箱是否已发过冷邮件
  const checkAndSendMail = async (contact: any) => {
    if (!contact.email) return;
    // 1. 检查是否已发过冷邮件
    const checkRes = await fetch(`/api/crm/mail-queue/check?leadId=${leadId}&contactId=${contact.id}`);
    const checkData = await checkRes.json();
    if (checkData.sent) {
      toast({
        variant: 'destructive',
        title: '该联系人已经发送过冷邮件了！',
      });
      return;
    }
    // 2. 发送邮件
    const sendRes = await fetch(`/api/crm/leads/${leadId}/send-mail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId: contact.id })
    });
    const sendData = await sendRes.json();
    if (sendRes.ok && sendData.success) {
      toast({ title: '邮件发送成功', description: '邮件已加入发送队列。' });
    } else {
      toast({
        variant: 'destructive',
        title: '发送失败',
        description: sendData.error || '未知错误，请稍后重试。',
      });
    }
  };

  return (
    <div>
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>姓名</TableHead>
              <TableHead>职位</TableHead>
              <TableHead>称呼</TableHead>
              <TableHead>电话</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">无联系人信息</TableCell>
              </TableRow>
            ) : (
              contacts.map((c, i) => {
                const disabled = !c.email;
                return (
                  <TableRow key={i}>
                    <TableCell>{c.name || '-'}</TableCell>
                    <TableCell>{c.title || '-'}</TableCell>
                    <TableCell>{c.appellation || '-'}</TableCell>
                    <TableCell>{c.phone || '-'}</TableCell>
                    <TableCell>{c.email || '-'}</TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span style={{ display: 'inline-block' }}>
                            <IconButton
                              icon={<MailIcon style={{ color: disabled ? '#ccc' : '#2563eb', width: 20, height: 20 }} />}
                              onClick={disabled ? undefined : () => checkAndSendMail(c)}
                              className={disabled ? 'opacity-50 cursor-not-allowed' : ''}
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>发送冷邮件</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TooltipProvider>
    </div>
  )
} 