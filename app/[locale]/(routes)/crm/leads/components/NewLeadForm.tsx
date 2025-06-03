"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";

import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

//TODO: fix all the types
type NewTaskFormProps = {
  users: any[];
  accounts: any[];
};

export function NewLeadForm({ users, accounts }: NewTaskFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const formSchema = z.object({
    company: z.string().min(1, { message: "公司名称为必填项" }),
    lead_source: z.string().optional(),
    refered_by: z.string().optional(),
    campaign: z.string().optional(),
    assigned_to: z.string().optional(),
    accountIDs: z.string().optional(),
    region: z.string().optional(),
    contacts: z.array(z.object({
      name: z.string().min(1, { message: "姓名为必填项" }),
      email: z.string().email({ message: "邮箱格式不正确" }).optional(),
      phone: z.string().optional(),
      title: z.string().optional(),
      appellation: z.string().optional(),
      others: z.string().optional(),
      memo: z.string().optional(),
    })).min(1, { message: "至少添加一个联系人" }),
    memo: z.string().optional(),
    industry: z.string().optional(),
    website: z.string().optional(),
    address: z.string().optional(),
    company_type: z.string().optional(),
    employee_scale: z.string().optional(),
    introduction: z.string().optional(),
    lead_source_content: z.string().optional(),
  });

  type NewLeadFormValues = z.infer<typeof formSchema>;

  const defaultValues: NewLeadFormValues = {
    company: "",
    lead_source: "",
    refered_by: "",
    campaign: "",
    assigned_to: "",
    accountIDs: "",
    region: "",
    contacts: [{ name: "", email: "", phone: "" }],
    memo: "",
    industry: "",
    website: "",
    address: "",
    company_type: "",
    employee_scale: "",
    introduction: "",
    lead_source_content: "",
  };

  const form = useForm<NewLeadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: NewLeadFormValues) => {
    setIsLoading(true);
    try {
      await axios.post("/api/crm/leads", data);
      toast({
        title: "Success",
        description: "Lead created successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data,
      });
    } finally {
      setIsLoading(false);
      form.reset(defaultValues);
      router.refresh();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-full px-10">
        {/*        <div>
          <pre>
            <code>{JSON.stringify(form.watch(), null, 2)}</code>
            <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
          </pre>
        </div> */}
        <div className=" w-[800px] text-sm">
          <div className="pb-5 space-y-2">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="NextCRM Inc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="佛山-顺德区"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contacts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>联系人</FormLabel>
                  <div className="space-y-2">
                    {field.value.map((contact, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          placeholder="姓名"
                          value={contact.name}
                          onChange={e => {
                            const newContacts = [...field.value];
                            newContacts[idx].name = e.target.value;
                            field.onChange(newContacts);
                          }}
                        />
                        <Input
                          placeholder="邮箱"
                          value={contact.email || ""}
                          onChange={e => {
                            const newContacts = [...field.value];
                            newContacts[idx].email = e.target.value;
                            field.onChange(newContacts);
                          }}
                        />
                        <Input
                          placeholder="电话"
                          value={contact.phone || ""}
                          onChange={e => {
                            const newContacts = [...field.value];
                            newContacts[idx].phone = e.target.value;
                            field.onChange(newContacts);
                          }}
                        />
                        <Button type="button" variant="destructive" size="sm" onClick={() => {
                          const newContacts = field.value.filter((_, i) => i !== idx);
                          field.onChange(newContacts);
                        }}>删除</Button>
                      </div>
                    ))}
                    <Button type="button" size="sm" onClick={() => field.onChange([...field.value, { name: "", email: "", phone: "" }])}>添加联系人</Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Memo</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isLoading}
                      placeholder="备注信息"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="制造业"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="https://company.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="公司地址"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Type</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="民营/国企"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employee_scale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Scale</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="50-100人"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="introduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Introduction</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isLoading}
                      placeholder="公司简介/介绍"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lead_source_content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Source Content (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isLoading}
                      placeholder='{"source":"alibaba.com","desc":"公司简介..."}'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assigned_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned to</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user to assign the account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="overflow-y-auto h-56">
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountIDs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign an Account</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose assigned account " />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="grid gap-2 py-5">
          <Button disabled={isLoading} type="submit">
            {isLoading ? (
              <span className="flex items-center animate-pulse">
                Saving data ...
              </span>
            ) : (
              "Create lead"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
