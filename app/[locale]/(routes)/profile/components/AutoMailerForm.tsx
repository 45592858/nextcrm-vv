"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  mailAddress: z.string().email({ message: "Invalid email address" }),
  mailFromNameEn: z.string().min(2, "Required"),
  mailFromNameCn: z.string().min(2, "必填"),
  contactNo: z.string().min(3, "Required"),
});

export function AutoMailerForm({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      setIsLoading(true);
      await axios.post(`/api/user/${userId}/setAutoMailer`, data);
      toast({
        title: "You submitted the following values:",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(data, null, 2)}</code>
          </pre>
        ),
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong while saving your mailer settings.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex space-x-5 w-full p-5 items-end"
      >
        <FormField
          control={form.control}
          name="mailAddress"
          render={({ field }) => (
            <FormItem className="w-1/4">
              <FormLabel>Mail Address</FormLabel>
              <FormControl>
                <Input disabled={isLoading} placeholder="marketing@company.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mailFromNameEn"
          render={({ field }) => (
            <FormItem className="w-1/4">
              <FormLabel>Mail From Name EN</FormLabel>
              <FormControl>
                <Input disabled={isLoading} placeholder="Company Marketing" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mailFromNameCn"
          render={({ field }) => (
            <FormItem className="w-1/4">
              <FormLabel>Mail From Name CN</FormLabel>
              <FormControl>
                <Input disabled={isLoading} placeholder="公司市场部" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactNo"
          render={({ field }) => (
            <FormItem className="w-1/4">
              <FormLabel>Contact No.</FormLabel>
              <FormControl>
                <Input disabled={isLoading} placeholder="400-123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-[150px]" type="submit">
          Update
        </Button>
      </form>
    </Form>
  );
} 