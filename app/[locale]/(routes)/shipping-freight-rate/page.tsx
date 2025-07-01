"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { zhCN } from 'date-fns/locale';
import type { ChangeEvent } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const FROM_PORTS = ["NANSHA", "SHEKOU", "YANTIAN", "SHANGHAI", "NINGBO"];
const TO_PORTS = ["JAKARTA"];
const CARRIERS = ["WHL", "MSK", "ZIM"];
const TO_COUNTRIES = ["印尼", "泰国", "马来西亚", "越南", "柬埔寨", "新加坡"];

interface FreightRate {
  id: string;
  to_country: string;
  price_text: string;
  valid_until: string;
  created_at: string;
}

export default function ShippingFreightRatePage() {
  const [form, setForm] = useState({
    to_country: "印尼",
    price_text: "Shanghai → Jakarta USD 3580 / 40HQ\nNingbo → Surabaya USD 3380 / 40HQ\nGuangzhou → Jakarta USD 3280 / 40HQ",
    valid_until: format(addDays(new Date(), 5), "yyyy-MM-dd"),
  });
  const [rates, setRates] = useState<FreightRate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRates = async () => {
    setLoading(true);
    const res = await fetch("/api/shipping-freight-rate");
    const data = await res.json();
    setRates(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.to_country || !form.price_text || !form.valid_until) {
      alert("请填写必填项");
      return;
    }
    const res = await fetch("/api/shipping-freight-rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        valid_until: new Date(form.valid_until).toISOString(),
      }),
    });
    if (res.ok) {
      setForm(f => ({ ...f, price_text: "" }));
      fetchRates();
    } else {
      alert("提交失败");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("确定要删除这条运价吗？")) return;
    await fetch(`/api/shipping-freight-rate/${id}`, { method: "DELETE" });
    fetchRates();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>运价更新</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
            <div className="md:col-span-2">
              <Label htmlFor="price_text">运价详情 *</Label>
              <Textarea
                id="price_text"
                value={form.price_text}
                onChange={e => handleChange("price_text", e.target.value)}
                rows={5}
                required
              />
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="to_country">目的国家 *</Label>
                <Select value={form.to_country} onValueChange={v => handleChange("to_country", v)}>
                  <SelectTrigger id="to_country"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TO_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="valid_until">有效期至 *</Label>
                <Input id="valid_until" type="date" value={form.valid_until} onChange={e => handleChange("valid_until", e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">更新</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>运价列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div>加载中...</div> : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>运价详情</TableHead>
                    <TableHead>目的国家</TableHead>
                    <TableHead>有效期至</TableHead>
                    <TableHead>报价日期</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rates.map((r: FreightRate) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-pre-wrap">{r.price_text}</TableCell>
                      <TableCell>{r.to_country}</TableCell>
                      <TableCell>{r.valid_until?.slice(0, 10)}</TableCell>
                      <TableCell>{format(new Date(r.created_at), 'yyyy-MM-dd HH:mm', { locale: zhCN })}</TableCell>
                      <TableCell><Button variant="destructive" size="sm" onClick={() => handleDelete(r.id)}>删除</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 