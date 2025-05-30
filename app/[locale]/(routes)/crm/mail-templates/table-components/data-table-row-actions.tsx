"use client";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import AlertModal from "@/components/modals/alert-modal";
import RightViewModalNoTrigger from "@/components/modals/right-view-notrigger";
import { NewMailTemplateForm } from "../components/NewMailTemplateForm";

export function DataTableRowActions({ row }: { row: Row<any> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const onDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`/api/crm/mail-templates/${row.original.id}`);
      toast({ title: "删除成功" });
    } catch {
      toast({ variant: "destructive", title: "删除失败" });
    } finally {
      setLoading(false);
      setOpen(false);
      router.refresh();
    }
  };

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <RightViewModalNoTrigger
        title={"编辑邮件模板 - " + (row.original.template_name || "")}
        description="编辑邮件模板内容"
        open={editOpen}
        setOpen={setEditOpen}
      >
        <NewMailTemplateForm initialData={row.original} onFinish={() => setEditOpen(false)} />
      </RightViewModalNoTrigger>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => router.push(`/crm/mail-templates/${row.original.id}`)}>
            查看
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            编辑
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            删除
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
} 