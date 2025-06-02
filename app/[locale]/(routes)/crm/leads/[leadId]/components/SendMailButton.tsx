"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface SendMailButtonProps {
  leadId: string;
}

const SendMailButton: React.FC<SendMailButtonProps> = ({ leadId }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/send-mail`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: "邮件发送成功",
          description: "邮件已加入发送队列。",
        });
      } else {
        toast({
          variant: "destructive",
          title: "发送失败",
          description: data.error || "未知错误，请稍后重试。",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "网络错误",
        description: "请求失败，请检查网络或稍后重试。",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleSendMail} disabled={loading}>
      {loading ? "发送中..." : "发送邮件"}
    </Button>
  );
};

export default SendMailButton; 