import { notFound } from "next/navigation";
import { getMailTemplateById } from "../../../../../actions/crm/get-mail-template-by-id";
import Container from "../../../components/ui/Container";
import { NewMailTemplateForm } from "../components/NewMailTemplateForm";

export default async function EditMailTemplatePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const template = await getMailTemplateById(id);
  if (!template) return notFound();
  const safeTemplate = {
    ...template,
    zh_title: template.zh_title ?? undefined,
    zh_html_content: template.zh_html_content ?? undefined,
    zh_text_content: template.zh_text_content ?? undefined,
  };
  return (
    <Container title="编辑邮件模板" description="修改邮件模板内容">
      <NewMailTemplateForm initialData={safeTemplate} />
    </Container>
  );
} 