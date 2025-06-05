"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export function NewLeadContactForm({ users, accounts }: any) {
  const [form, setForm] = useState({ name: "", title: "", phone: "", email: "", lead_id: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/crm/lead-contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      toast({ title: "创建成功" });
      router.refresh();
    } else {
      toast({ title: "创建失败", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="name" placeholder="姓名" value={form.name} onChange={handleChange} required />
      <Input name="title" placeholder="职位" value={form.title} onChange={handleChange} />
      <Input name="phone" placeholder="电话" value={form.phone} onChange={handleChange} />
      <Input name="email" placeholder="邮箱" value={form.email} onChange={handleChange} />
      <select name="lead_id" value={form.lead_id} onChange={handleChange} required className="w-full border rounded p-2">
        <option value="">请选择关联线索</option>
        {accounts?.map((a: any) => (
          <option key={a.id} value={a.id}>{a.company}</option>
        ))}
      </select>
      <Button type="submit" disabled={loading}>{loading ? "新建中..." : "新建联系人"}</Button>
    </form>
  );
} 