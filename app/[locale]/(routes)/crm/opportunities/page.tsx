import { Suspense } from "react";

import SuspenseLoading from "@/components/loadings/suspense";

import Container from "../../components/ui/Container";
import OpportunitiesView from "../components/OpportunitiesView";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getOpportunitiesFull } from "@/actions/crm/get-opportunities-with-includes";

const AccountsPage = async () => {
  const crmData = await getAllCrmData();
  const opportunities = await getOpportunitiesFull();

  return (
    <Container>
      <Suspense fallback={<SuspenseLoading />}>
        <OpportunitiesView crmData={crmData} data={opportunities} subtitle="Everything you need to know about your opportinities" />
      </Suspense>
    </Container>
  );
};

export default AccountsPage;
