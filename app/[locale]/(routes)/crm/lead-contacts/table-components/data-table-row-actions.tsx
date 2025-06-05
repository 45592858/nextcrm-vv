"use client";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AlertModal from "@/components/modals/alert-modal";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { EditLeadContactForm } from "../components/EditLeadContactForm";
import RightViewModalNoTrigger from "@/components/modals/right-view-notrigger";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const contact = row.original as any;

  // 发送邮件功能，参考 Lead 跟进记录页
  const handleSendMail = async () => {
    if (!contact.email) {
      toast({ title: "无邮箱，无法发送邮件", variant: "destructive" });
      return;
    }
    setLoading(true);
    // 检查是否已发过冷邮件
    const checkRes = await fetch(`/api/crm/mail-queue/check?leadId=${contact.lead_id}&contactId=${contact.id}`);
    const checkData = await checkRes.json();
    if (checkData.sent) {
      toast({ title: "该联系人已经发送过冷邮件了！", variant: "destructive" });
      setLoading(false);
      return;
    }
    // 发送邮件
    const sendRes = await fetch(`/api/crm/leads/${contact.lead_id}/send-mail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: contact.id })
    });
    const sendData = await sendRes.json();
    setLoading(false);
    if (sendRes.ok && sendData.success) {
      toast({ title: "邮件发送成功", description: "邮件已加入发送队列。" });
    } else {
      toast({ title: "发送失败", description: sendData.error || "未知错误，请稍后重试。", variant: "destructive" });
    }
  };

  // 删除联系人
  const onDelete = async () => {
    setLoading(true);
    const res = await fetch(`/api/crm/lead-contacts/${contact.id}`, { method: "DELETE" });
    setLoading(false);
    setOpen(false);
    if (res.ok) {
      toast({ title: "删除成功" });
      router.refresh();
    } else {
      toast({ title: "删除失败", variant: "destructive" });
    }
  };

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <RightViewModalNoTrigger
        title={"编辑联系人 - " + (contact?.name || "")}
        description="编辑联系人信息"
        open={updateOpen}
        setOpen={setUpdateOpen}
      >
        <EditLeadContactForm initialData={contact} onSuccess={() => setUpdateOpen(false)} />
      </RightViewModalNoTrigger>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {/* <DropdownMenuItem onClick={handleSendMail} disabled={loading || !contact.email}>
            发送邮件
          </DropdownMenuItem> */}
          <DropdownMenuItem onClick={() => setUpdateOpen(true)} disabled={loading}>
            编辑
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)} disabled={loading}>
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
} 