"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import RightViewModal from "@/components/modals/right-view-modal";
import { columns } from "../table-components/columns";
import { NewMailTemplateForm } from "./NewMailTemplateForm";
import { MailTemplateDataTable } from "../table-components/data-table";
import { useRouter } from "next/navigation";

const MailTemplatesView = ({ data, subtitle }: any) => {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-end space-x-4">
            <CardTitle className="cursor-pointer">邮件模板</CardTitle>
            {subtitle && (
              <span className="text-muted-foreground text-sm font-normal ml-2 whitespace-nowrap pb-[2px]">{subtitle}</span>
            )}
          </div>
          <div className="flex space-x-2">
            <RightViewModal label={"+"} title="新建邮件模板" description="">
              <NewMailTemplateForm />
            </RightViewModal>
          </div>
        </div>
        <Separator />
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          "暂无邮件模板"
        ) : (
          <MailTemplateDataTable data={data} columns={columns as any} onRowDoubleClick={(id: string) => router.push(`/crm/mail-templates/${id}`)} />
        )}
      </CardContent>
    </Card>
  );
};
export default MailTemplatesView; 