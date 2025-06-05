import { Suspense } from "react";
import SuspenseLoading from "@/components/loadings/suspense";
import Container from "../../components/ui/Container";
import LeadContactsView from "./components/LeadContactsView";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getLeadContacts } from "@/actions/crm/lead-contacts/get-lead-contacts";

const LeadContactsPage = async () => {
  const crmData = await getAllCrmData();
  const leadContacts = await getLeadContacts();
  return (
    <Container
      title="Lead Contacts"
      description={"所有线索联系人一览，可批量管理和操作"}
    >
      <Suspense fallback={<SuspenseLoading />}>
        <LeadContactsView crmData={crmData} data={leadContacts} />
      </Suspense>
    </Container>
  );
};

export default LeadContactsPage; 