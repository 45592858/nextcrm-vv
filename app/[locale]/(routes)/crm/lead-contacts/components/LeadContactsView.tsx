"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import RightViewModal from "@/components/modals/right-view-modal";
import { columns } from "../table-components/columns";
import { LeadContact } from "../table-data/schema";
import { NewLeadContactForm } from "./NewLeadContactForm";
import { LeadContactDataTable } from "../table-components/data-table";
import { useRouter } from "next/navigation";

const LeadContactsView = ({ data: initialData, crmData }: any) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = React.useState(false);
  const [data, setData] = useState(initialData);
  React.useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;
  const { users, accounts } = crmData;
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <div>
            <CardTitle
              onClick={() => router.push("/crm/lead-contacts")}
              className="cursor-pointer"
            >
              Lead Contacts
            </CardTitle>
            <CardDescription></CardDescription>
          </div>
          <div className="flex space-x-2">
            <RightViewModal label={"+"} title="新建线索联系人" description="">
              <NewLeadContactForm users={users} accounts={accounts} />
            </RightViewModal>
          </div>
        </div>
        <Separator />
      </CardHeader>
      <CardContent>
        {!data || (data.length === 0 ? (
          "暂无联系人信息"
        ) : (
          <LeadContactDataTable data={data} setData={setData} columns={columns as any} />
        ))}
      </CardContent>
    </Card>
  );
};
export default LeadContactsView; 