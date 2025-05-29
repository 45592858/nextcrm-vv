"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

import { statuses } from "../table-data/data";
import { Lead } from "../table-data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import moment from "moment";

export const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Expected close" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">
        {moment(row.getValue("createdAt")).format("YY-MM-DD")}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last update" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">
        {moment(row.getValue("updatedAt")).format("YY-MM-DD")}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "assigned_to_user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigned to" />
    ),

    cell: ({ row }) => (
      <div className="w-[150px]">
        {
          //@ts-ignore
          //TODO: fix this
          row.getValue("assigned_to_user")?.name ?? "Unassigned"
        }
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "company",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
    cell: ({ row }) => {
      const locale = require('next-intl').useLocale();
      return (
        <a
          className="cursor-pointer hover:underline"
          href={`/${locale}/crm/leads/${row.original.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* @ts-ignore */}
          {row.getValue("company") ?? "Unassigned"}
        </a>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "region",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Region" />
    ),
    cell: ({ row }) => <div>{row.getValue("region")}</div>,
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "contacts",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contacts" />
    ),
    cell: ({ row }) => {
      const locale = require('next-intl').useLocale();
      const contacts = row.original.contacts || [];
      const summary = Array.isArray(contacts) && contacts.length > 0
        ? contacts.map((c: any) => c.name).filter(Boolean).join('、')
        : '';
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                className="max-w-[200px] truncate cursor-pointer text-ellipsis whitespace-nowrap hover:underline"
                href={`/${locale}/crm/leads/${row.original.id}/contact-history`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {summary || '-'}
              </a>
            </TooltipTrigger>
            <TooltipContent className="max-w-[600px] p-0">
              {Array.isArray(contacts) && contacts.length > 0 ? (
                <table className="min-w-[520px] text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 border-b font-semibold">姓名</th>
                      <th className="px-2 py-1 border-b font-semibold">职位</th>
                      <th className="px-2 py-1 border-b font-semibold">称呼</th>
                      <th className="px-2 py-1 border-b font-semibold">电话</th>
                      <th className="px-2 py-1 border-b font-semibold">邮箱</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((c: any, i: number) => (
                      <tr key={c.id || i}>
                        <td className="px-2 py-1 border-b whitespace-nowrap">{c.name || '-'}</td>
                        <td className="px-2 py-1 border-b whitespace-nowrap">{c.title || '-'}</td>
                        <td className="px-2 py-1 border-b whitespace-nowrap">{c.appellation || '-'}</td>
                        <td className="px-2 py-1 border-b whitespace-nowrap">{c.phone || '-'}</td>
                        <td className="px-2 py-1 border-b whitespace-nowrap">{c.email || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-2">无联系人信息</div>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "memo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Memo" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("memo") as string;
      if (!value) return null;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[200px] truncate cursor-pointer text-ellipsis whitespace-nowrap">{value}</div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[400px] whitespace-pre-line break-words">{value}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "industry",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Industry" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("industry") as string;
      if (!value) return null;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[200px] truncate cursor-pointer text-ellipsis whitespace-nowrap">{value}</div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[400px] whitespace-pre-line break-words">{value}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "website",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Website" />
    ),
    cell: ({ row }) => <div>{row.getValue("website")}</div>,
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Address" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("address") as string;
      if (!value) return null;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[200px] truncate cursor-pointer text-ellipsis whitespace-nowrap">{value}</div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[400px] whitespace-pre-line break-words">{value}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "company_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company Type" />
    ),
    cell: ({ row }) => <div>{row.getValue("company_type")}</div>,
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "employee_scale",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employee Scale" />
    ),
    cell: ({ row }) => <div>{row.getValue("employee_scale")}</div>,
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "introduction",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Introduction" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("introduction") as string;
      if (!value) return null;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[200px] truncate cursor-pointer text-ellipsis whitespace-nowrap">{value}</div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[400px] whitespace-pre-line break-words">{value}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "lead_source_content",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lead Source Content" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("lead_source_content") as string;
      if (!value) return null;
      let display = value;
      try {
        display = JSON.stringify(JSON.parse(value), null, 2);
      } catch {}
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[200px] truncate cursor-pointer text-ellipsis whitespace-nowrap">{value}</div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[600px] whitespace-pre-line break-words">
              {display}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: false,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const content = row.getValue(id);
      if (!value) return true;
      if (!content) return false;
      return String(content).toLowerCase().includes(String(value).toLowerCase());
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      );

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
