"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "sequence_step",
    header: ({ column }) => <DataTableColumnHeader column={column} title="序列步骤" />,
    cell: ({ row }) => <div>{row.getValue("sequence_step")}</div>,
  },
  {
    accessorKey: "template_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="模板名称" />,
    cell: ({ row }) => <div>{row.getValue("template_name")}</div>,
  },
  {
    accessorKey: "en_title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="英文标题" />,
    cell: ({ row }) => <div>{row.getValue("en_title")}</div>,
  },
  {
    accessorKey: "zh_title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="中文标题" />,
    cell: ({ row }) => <div>{row.getValue("zh_title")}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="状态" />,
    cell: ({ row }) => <Badge>{row.getValue("status")}</Badge>,
  },
  {
    accessorKey: "en_html_content",
    header: ({ column }) => <DataTableColumnHeader column={column} title="英文HTML内容" />,
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="truncate max-w-[180px] text-xs text-gray-500 cursor-pointer" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {row.original.en_html_content?.replace(/<[^>]+>/g, '').slice(0, 30) || '-'}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-[400px]">
            <div className="text-xs" dangerouslySetInnerHTML={{ __html: row.original.en_html_content || '' }} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: "zh_html_content",
    header: ({ column }) => <DataTableColumnHeader column={column} title="中文HTML内容" />,
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="truncate max-w-[180px] text-xs text-gray-500 cursor-pointer" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {row.original.zh_html_content?.replace(/<[^>]+>/g, '').slice(0, 30) || '-'}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-[400px]">
            <div className="text-xs" dangerouslySetInnerHTML={{ __html: row.original.zh_html_content || '' }} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    header: "操作",
  },
]; 