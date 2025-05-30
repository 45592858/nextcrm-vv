import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MailTemplateDetail({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.template_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-semibold">序列步骤</div>
            <div>{data.sequence_step}</div>
          </div>
          <div>
            <div className="font-semibold">状态</div>
            <Badge>{data.status}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 mt-6">
          {/* 英文内容 */}
          <div>
            <div className="font-bold mb-2">英文内容</div>
            <div className="mb-2">
              <div className="font-semibold">标题</div>
              <div>{data.en_title}</div>
            </div>
            <div className="mb-2">
              <div className="font-semibold">HTML内容</div>
              <div className="rounded text-xs transition-colors duration-150 hover:bg-muted p-2 cursor-pointer" dangerouslySetInnerHTML={{ __html: data.en_html_content || '' }} />
            </div>
            <div className="mb-2">
              <div className="font-semibold">文本内容</div>
              <div className="whitespace-pre-wrap rounded text-xs transition-colors duration-150 hover:bg-muted p-2 cursor-pointer">
                {data.en_text_content}
              </div>
            </div>
          </div>
          {/* 中文内容 */}
          <div>
            <div className="font-bold mb-2">中文内容</div>
            <div className="mb-2">
              <div className="font-semibold">标题</div>
              <div>{data.zh_title || <span className="text-gray-400">-</span>}</div>
            </div>
            <div className="mb-2">
              <div className="font-semibold">HTML内容</div>
              <div className="rounded text-xs transition-colors duration-150 hover:bg-muted p-2 cursor-pointer" dangerouslySetInnerHTML={{ __html: data.zh_html_content || '' }} />
            </div>
            <div className="mb-2">
              <div className="font-semibold">文本内容</div>
              <div className="whitespace-pre-wrap rounded text-xs transition-colors duration-150 hover:bg-muted p-2 cursor-pointer">
                {data.zh_text_content || <span className="text-gray-400">-</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="text-right text-xs text-gray-400 mt-6">
          创建时间：{data.created_at ? new Date(data.created_at).toLocaleString() : "-"} &nbsp;|&nbsp; 更新时间：{data.updated_at ? new Date(data.updated_at).toLocaleString() : "-"}
        </div>
      </CardContent>
    </Card>
  );
} 