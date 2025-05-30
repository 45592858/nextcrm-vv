"use client";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  sequence_step: z.number().min(0),
  template_name: z.string().min(1),
  en_title: z.string().min(1),
  en_html_content: z.string().min(1),
  en_text_content: z.string().min(1),
  zh_title: z.string().optional(),
  zh_html_content: z.string().optional(),
  zh_text_content: z.string().optional(),
  status: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export function NewMailTemplateForm({ initialData, onFinish }: { initialData?: Partial<FormValues & { id?: string }>, onFinish?: () => void } = {}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      sequence_step: 1,
      template_name: "",
      en_title: "",
      en_html_content: "",
      en_text_content: "",
      zh_title: "",
      zh_html_content: "",
      zh_text_content: "",
      status: "active",
    },
  });
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      if (initialData?.id) {
        await axios.put(`/api/crm/mail-templates/${initialData.id}`, data);
        toast({ title: "更新成功" });
      } else {
        await axios.post("/api/crm/mail-templates", data);
        toast({ title: "创建成功" });
      }
      onFinish?.();
    } catch (error: any) {
      toast({ variant: "destructive", title: "操作失败", description: error?.response?.data });
    } finally {
      setIsLoading(false);
      form.reset();
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-[600px]">
        <FormField control={form.control} name="sequence_step" render={({ field }) => (
          <FormItem>
            <FormLabel>序列步骤</FormLabel>
            <FormControl>
              <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="template_name" render={({ field }) => (
          <FormItem>
            <FormLabel>模板名称</FormLabel>
            <FormControl>
              <Input {...field} disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="en_title" render={({ field }) => (
          <FormItem>
            <FormLabel>英文标题</FormLabel>
            <FormControl>
              <Input {...field} disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="en_html_content" render={({ field }) => (
          <FormItem>
            <FormLabel>HTML内容</FormLabel>
            <FormControl>
              <Textarea {...field} disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="en_text_content" render={({ field }) => (
          <FormItem>
            <FormLabel>文本内容</FormLabel>
            <FormControl>
              <Textarea {...field} disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="zh_title" render={({ field }) => (
          <FormItem>
            <FormLabel>中文标题</FormLabel>
            <FormControl>
              <Input {...field} disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="zh_html_content" render={({ field }) => (
          <FormItem>
            <FormLabel>HTML内容</FormLabel>
            <FormControl>
              <Textarea {...field} disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="zh_text_content" render={({ field }) => (
          <FormItem>
            <FormLabel>文本内容</FormLabel>
            <FormControl>
              <Textarea {...field} disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>状态</FormLabel>
            <FormControl>
              <Input {...field} disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={isLoading} className="w-full">{initialData?.id ? "更新" : "创建"}</Button>
        <div className="mt-8 grid grid-cols-2 gap-6">
          <div>
            <div className="font-bold mb-2">HTML内容预览</div>
            <div className="rounded text-xs transition-colors duration-150 hover:bg-muted p-2 cursor-pointer" dangerouslySetInnerHTML={{ __html: form.watch("en_html_content") || '' }} />
          </div>
          <div>
            <div className="font-bold mb-2">HTML内容预览</div>
            <div className="rounded text-xs transition-colors duration-150 hover:bg-muted p-2 cursor-pointer" dangerouslySetInnerHTML={{ __html: form.watch("zh_html_content") || '' }} />
          </div>
        </div>
      </form>
    </Form>
  );
} 