import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { LeadContact } from "../table-data/schema";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import IconButton from "@/components/ui/IconButton";
import { useToast } from "@/components/ui/use-toast";
import { useState, useRef } from "react";

const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <polyline points="3 7 12 13 21 7" />
  </svg>
);

function useSendMail(setData?: (updater: (prev: any[]) => any[]) => void, contactId?: string) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const checkAndSendMail = async (contact: any) => {
    if (!contact.email) return;
    if (!contact.appellation) {
      const appellation = window.prompt('请输入该联系人的称呼（如：张总、王经理等）：');
      if (!appellation) {
        toast({ variant: 'destructive', title: '请先输入称呼' });
        return;
      }
      // 保存称呼
      const updateRes = await fetch(`/api/crm/lead-contacts/${contact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appellation })
      });
      if (!updateRes.ok) {
        toast({ variant: 'destructive', title: '称呼保存失败' });
        return;
      }
      // 只更新当前行数据
      if (setData && contactId) {
        setData((prev) => prev.map((item) => item.id === contactId ? { ...item, appellation } : item));
      }
    }
    // 检查是否已发过冷邮件
    const checkRes = await fetch(`/api/crm/mail-queue/check?leadId=${contact.lead_id}&contactId=${contact.id}`);
    const checkData = await checkRes.json();
    if (checkData.sent) {
      toast({ variant: 'destructive', title: '该联系人已经发送过冷邮件了！' });
      return;
    }
    // 发送邮件
    setLoading(true);
    const sendRes = await fetch(`/api/crm/leads/${contact.lead_id}/send-mail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId: contact.id })
    });
    const sendData = await sendRes.json();
    setLoading(false);
    if (sendRes.ok && sendData.success) {
      toast({ title: '邮件发送成功', description: '邮件已加入发送队列。' });
    } else {
      toast({ variant: 'destructive', title: '发送失败', description: sendData.error || '未知错误，请稍后重试。' });
    }
  };
  return { checkAndSendMail, loading };
}

function EmailCell({ row, table }: any) {
  const contact = row.original;
  const setData = table.options.meta?.setData;
  const { checkAndSendMail, loading } = useSendMail(setData, contact.id);
  if (!contact.email) return <div>{contact.email || ""}</div>;
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span>{contact.email}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span style={{ display: 'inline-block' }}>
              <IconButton
                icon={<MailIcon style={{ color: '#2563eb', width: 20, height: 20 }} />}
                onClick={() => checkAndSendMail(contact)}
                className={loading ? 'opacity-50 cursor-not-allowed' : ''}
              />
            </span>
          </TooltipTrigger>
          <TooltipContent>发送冷邮件</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export const columns: ColumnDef<LeadContact>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="姓名" />,
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="职位" />,
    cell: ({ row }) => <div>{row.getValue("title")}</div>,
  },
  {
    accessorKey: "appellation",
    header: ({ column }) => <DataTableColumnHeader column={column} title="称呼" />,
    cell: ({ row }) => <div>{row.getValue("appellation")}</div>,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => <DataTableColumnHeader column={column} title="电话" />,
    cell: ({ row }) => <div>{row.getValue("phone")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="邮箱" />,
    cell: EmailCell,
  },
  // Lead 相关字段
  {
    accessorKey: "lead_company",
    header: ({ column }) => <DataTableColumnHeader column={column} title="公司" />,
    cell: ({ row }) => <div>{row.getValue("lead_company")}</div>,
  },
  {
    accessorKey: "lead_region",
    header: ({ column }) => <DataTableColumnHeader column={column} title="地区" />,
    cell: ({ row }) => <div>{row.getValue("lead_region")}</div>,
  },
  {
    accessorKey: "lead_memo",
    header: ({ column }) => <DataTableColumnHeader column={column} title="备忘" />,
    cell: ({ row }) => {
      const value = row.getValue("lead_memo") as string;
      if (!value) return null;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-[100px] truncate cursor-pointer text-ellipsis whitespace-nowrap">{value.length > 12 ? value.slice(0, 12) + "..." : value}</div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[400px] whitespace-pre-line break-words">{value}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "lead_industry",
    header: ({ column }) => <DataTableColumnHeader column={column} title="行业" />,
    cell: ({ row }) => {
      const value = row.getValue("lead_industry") as string;
      if (!value) return null;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-[100px] truncate cursor-pointer text-ellipsis whitespace-nowrap">{value.length > 12 ? value.slice(0, 12) + "..." : value}</div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[400px] whitespace-pre-line break-words">{value}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "lead_company_type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="公司类型" />,
    cell: ({ row }) => <div>{row.getValue("lead_company_type")}</div>,
  },
  {
    accessorKey: "lead_employee_scale",
    header: ({ column }) => <DataTableColumnHeader column={column} title="员工规模" />,
    cell: ({ row }) => <div>{row.getValue("lead_employee_scale")}</div>,
  },
  {
    accessorKey: "lead_introduction",
    header: ({ column }) => <DataTableColumnHeader column={column} title="简介" />,
    cell: ({ row }) => {
      const value = row.getValue("lead_introduction") as string;
      if (!value) return null;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-[100px] truncate cursor-pointer text-ellipsis whitespace-nowrap">{value.length > 12 ? value.slice(0, 12) + "..." : value}</div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[400px] whitespace-pre-line break-words">{value}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />, // 复用操作栏
  },
]; 