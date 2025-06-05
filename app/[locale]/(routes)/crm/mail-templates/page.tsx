import { Suspense } from "react";
import SuspenseLoading from "@/components/loadings/suspense";
import Container from "../../components/ui/Container";
import MailTemplatesView from "./components/MailTemplatesView";
import { getMailTemplates } from "../../../../actions/crm/get-mail-templates";

const MailTemplatesPage = async () => {
  const templates = await getMailTemplates();
  return (
    <Container>
      <Suspense fallback={<SuspenseLoading />}>
        <MailTemplatesView data={templates} subtitle="管理自动邮件跟进模板" />
      </Suspense>
    </Container>
  );
};

export default MailTemplatesPage; 