"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// import ProjectModuleMenu from "./menu-items/Projects";
// import SecondBrainModuleMenu from "./menu-items/SecondBrain";
// import InvoicesModuleMenu from "./menu-items/Invoices";
// import ReportsModuleMenu from "./menu-items/Reports";
// import DocumentsModuleMenu from "./menu-items/Documents";
// import ChatGPTModuleMenu from "./menu-items/ChatGPT";
// import EmployeesModuleMenu from "./menu-items/Employees";
// import DataboxModuleMenu from "./menu-items/Databoxes";
import CrmModuleMenu from "./menu-items/Crm";
import AdministrationMenu from "./menu-items/Administration";
import DashboardMenu from "./menu-items/Dashboard";
import EmailsModuleMenu from "./menu-items/Emails";
import { cn } from "@/lib/utils";

type Props = {
  modules: any;
  dict: any;
  build: number;
};

const ModuleMenu = ({ modules, dict, build }: Props) => {
  const [open, setOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <div
        className={` ${
          open ? "w-40" : "w-40"
        }  h-screen p-5  pt-8 relative duration-300`}
      >
        <div className="flex items-center">
          <div
            className={`cursor-pointer duration-500 border rounded-full px-1 py-2 ${
              open && "rotate-[360deg]"
            }`}
            onClick={() => setOpen(!open)}
          >
            N
          </div>

          <h1
            className="font-medium text-xl duration-200 ml-2"
          >
            {process.env.NEXT_PUBLIC_APP_NAME}
          </h1>
        </div>
        <div className="pt-6">
          {/* <DashboardMenu open={open} title={dict.ModuleMenu.dashboard} /> */}
          {/* 直接平铺 CRM 相关菜单 */}
          <div className="flex flex-col gap-2">
            <button className="text-center text-left w-full hover:bg-slate-700 hover:text-gray-200 rounded-md p-2" onClick={() => router.push("/crm/leads")}>{dict.ModuleMenu.crm.leads}</button>
            <button className="text-center text-left w-full hover:bg-slate-700 hover:text-gray-200 rounded-md p-2" onClick={() => router.push("/crm/lead-contacts")}>{dict.ModuleMenu.crm.leadContacts}</button>
            <button className="text-center text-left w-full hover:bg-slate-700 hover:text-gray-200 rounded-md p-2" onClick={() => router.push("/crm/contact-histories")}>跟进记录</button>
            <button className="text-center text-left w-full hover:bg-slate-700 hover:text-gray-200 rounded-md p-2" onClick={() => router.push("/crm/opportunities")}>{dict.ModuleMenu.crm.opportunities}</button>
            <button className="text-center text-left w-full hover:bg-slate-700 hover:text-gray-200 rounded-md p-2" onClick={() => router.push("/crm/accounts")}>{dict.ModuleMenu.crm.accounts}</button>
            <button className="text-center text-left w-full hover:bg-slate-700 hover:text-gray-200 rounded-md p-2" onClick={() => router.push("/crm/contacts")}>{dict.ModuleMenu.crm.contacts}</button>
            <button className="text-center text-left w-full hover:bg-slate-700 hover:text-gray-200 rounded-md p-2" onClick={() => router.push("/crm/mail-templates")}>{dict.ModuleMenu.crm.mailTemplates}</button>
            <button className="text-center text-left w-full hover:bg-slate-700 hover:text-gray-200 rounded-md p-2" onClick={() => router.push("/shipping-freight-rate")}>运价更新</button>
          </div>
        </div>
      </div>
      <div
        className={cn("flex justify-center items-center w-full", {
          hidden: !open,
        })}
      >
        <span className="text-xs text-gray-500 pb-2">
          build: 0.0.3-beta-{build}
        </span>
      </div>
    </div>
  );
};

export default ModuleMenu;
