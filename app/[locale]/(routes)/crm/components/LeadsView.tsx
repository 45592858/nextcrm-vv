"use client";

import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import RightViewModal from "@/components/modals/right-view-modal";

import { columns } from "../leads/table-components/columns";
import { Lead } from "../leads/table-data/schema";
import { NewLeadForm } from "../leads/components/NewLeadForm";
import { LeadDataTable } from "../leads/table-components/data-table";
import { useRouter } from "next/navigation";

// 递归将对象所有 null 转为 undefined
function nullsToUndefined(obj: any): any {
  if (Array.isArray(obj)) return obj.map(nullsToUndefined);
  if (obj && typeof obj === 'object') {
    const res: any = {};
    for (const k in obj) {
      const v = obj[k];
      res[k] = v === null ? undefined : nullsToUndefined(v);
    }
    return res;
  }
  return obj;
}

// 修正 lead 列表的日期类型，递归修 contacts
function fixLeadDates(item: any) {
  return {
    ...item,
    createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
    contacts: Array.isArray(item.contacts)
      ? item.contacts.map((c: any) => ({ ...c }))
      : item.contacts,
  };
}

const LeadsView = ({ data, crmData, subtitle }: any) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const { users, accounts } = crmData;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-end space-x-4">
            <CardTitle
              onClick={() => router.push("/crm/leads")}
              className="cursor-pointer"
            >
              Leads
            </CardTitle>
            {subtitle && (
              <span className="text-muted-foreground text-sm font-normal ml-2 whitespace-nowrap pb-[2px]">{subtitle}</span>
            )}
          </div>
          <div className="flex space-x-2">
            <RightViewModal label={"+"} title="Create new lead" description="">
              <NewLeadForm users={users} accounts={accounts} />
            </RightViewModal>
          </div>
        </div>
        <Separator />
      </CardHeader>
      <CardContent>
        {!data ||
          (data.length === 0 ? (
            "No assigned leads found"
          ) : (
            <LeadDataTable
              data={(data as any[]).map(fixLeadDates) as any}
              columns={columns as any}
            />
          ))}
      </CardContent>
    </Card>
  );
};

export default LeadsView;
