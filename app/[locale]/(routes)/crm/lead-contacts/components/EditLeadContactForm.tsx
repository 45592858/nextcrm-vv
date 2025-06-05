"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export function EditLeadContactForm({ initialData, onSuccess }: any) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    title: initialData?.title || "",
    appellation: initialData?.appellation || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/crm/lead-contacts/${initialData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      toast({ title: "更新成功" });
      if (onSuccess) onSuccess();
      router.refresh();
    } else {
      toast({ title: "更新失败", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-[500px]">
      <Input name="name" placeholder="姓名" value={form.name} onChange={handleChange} required />
      <Input name="title" placeholder="职位" value={form.title} onChange={handleChange} />
      <Input name="appellation" placeholder="称呼" value={form.appellation} onChange={handleChange} />
      <Input name="phone" placeholder="电话" value={form.phone} onChange={handleChange} />
      <Input name="email" placeholder="邮箱" value={form.email} onChange={handleChange} />
      <Button type="submit" disabled={loading}>{loading ? "保存中..." : "保存"}</Button>
    </form>
  );
} 