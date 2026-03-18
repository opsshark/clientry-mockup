import {
  getPortalRequestTypes,
  getPortalRequestTypeFields,
  getPortalProformaForm,
} from "@/actions/forms";
import { jiraFieldsToFormSchema } from "@/lib/jira-to-form-schema";
import { proformaToFormSchema } from "@/lib/proforma-to-form-schema";
import SubmitFormClient from "./SubmitFormClient";

export const dynamic = "force-dynamic";

export default async function SubmitFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch request type info, standard fields, and Proforma form in parallel
  const [requestTypes, fields, proformaForm] = await Promise.all([
    getPortalRequestTypes(),
    getPortalRequestTypeFields(id),
    getPortalProformaForm(id),
  ]);

  const requestType = requestTypes.find((rt) => rt.id === id);
  const name = requestType?.name ?? "Submit Request";
  const description = requestType?.description ?? "";

  // Prefer Proforma form if available, fall back to standard JSM fields
  const schema = proformaForm
    ? proformaToFormSchema(name, proformaForm)
    : jiraFieldsToFormSchema(name, fields);

  return (
    <div className="max-w-3xl">
      <SubmitFormClient
        requestTypeId={id}
        name={name}
        description={description}
        schema={schema}
        proformaFormId={proformaForm?.id}
      />
    </div>
  );
}
