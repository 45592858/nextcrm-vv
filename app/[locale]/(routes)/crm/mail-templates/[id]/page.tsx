import { notFound } from "next/navigation";
import { getMailTemplateById } from "../../../../../actions/crm/get-mail-template-by-id";
import Container from "../../../components/ui/Container";
import MailTemplateDetail from "./components/MailTemplateDetail";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default async function MailTemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = await getMailTemplateById(id);
  if (!template) return notFound();
  return (
    <Container title="邮件模板详情" description="查看邮件模板内容">
      <MailTemplateDetail data={template} />
    </Container>
  );
} 