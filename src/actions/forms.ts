"use server";

import { getJiraConfig } from "@/lib/config";
import {
  getRequestTypes,
  getRequestTypeFields,
  getProformaForm,
  createRequest,
  type RequestType,
  type RequestTypeField,
  type ProformaForm,
} from "@/lib/jira";
import { getCurrentUser } from "./auth";

/**
 * Fetch portal-visible request types from JSM.
 * Filters out internal-only types (empty groupIds).
 */
export async function getPortalRequestTypes(): Promise<RequestType[]> {
  const config = getJiraConfig();
  return getRequestTypes(config);
}

/**
 * Fetch field definitions for a specific request type.
 * Filters out non-visible fields and attachment fields.
 */
export async function getPortalRequestTypeFields(
  requestTypeId: string
): Promise<RequestTypeField[]> {
  const config = getJiraConfig();
  const data = await getRequestTypeFields(config, requestTypeId);

  return data.requestTypeFields.filter(
    (f) => f.visible && f.jiraSchema.items !== "attachment"
  );
}

/**
 * Fetch the Proforma form for a request type (if one exists).
 */
export async function getPortalProformaForm(
  requestTypeId: string
): Promise<ProformaForm | null> {
  const config = getJiraConfig();
  return getProformaForm(config, requestTypeId);
}

/**
 * Submit a new service request to JSM.
 * Handles both standard JSM fields and Proforma answers.
 */
export async function submitRequest(
  requestTypeId: string,
  fieldValues: Record<string, unknown>,
  proformaFormId?: string
): Promise<{ issueKey: string; webUrl: string }> {
  const config = getJiraConfig();

  // Separate Proforma answers from standard Jira fields
  const jiraFields: Record<string, unknown> = {};
  const proformaAnswers: Record<string, { text?: string; choices?: string[]; date?: string; users?: string[] }> = {};

  for (const [key, value] of Object.entries(fieldValues)) {
    if (value === "" || value === null || value === undefined) continue;

    if (key.startsWith("proforma_")) {
      const questionId = key.replace("proforma_", "");
      const strValue = String(value);

      // Check if it's an array (checkbox_group)
      if (Array.isArray(value)) {
        proformaAnswers[questionId] = { choices: value.map(String) };
      } else {
        // Could be a choice ID or free text — include both
        proformaAnswers[questionId] = { text: strValue };
      }
    } else {
      jiraFields[key] = value;
    }
  }

  // Use authenticated user's email for raiseOnBehalfOf when available
  const user = await getCurrentUser();
  const result = await createRequest(
    config,
    requestTypeId,
    jiraFields,
    user?.email
  );

  // If we have Proforma answers and a form ID, submit them
  if (proformaFormId && Object.keys(proformaAnswers).length > 0) {
    await submitProformaAnswers(
      config,
      result.issueId,
      proformaFormId,
      proformaAnswers
    );
  }

  return { issueKey: result.issueKey, webUrl: result._links.web };
}

/**
 * Submit Proforma form answers to an existing issue.
 */
async function submitProformaAnswers(
  config: { baseUrl: string; email: string; apiToken: string },
  issueId: string,
  formId: string,
  answers: Record<string, { text?: string; choices?: string[]; date?: string; users?: string[] }>
): Promise<void> {
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString("base64");

  // Get cloud ID
  const tenantRes = await fetch(`${config.baseUrl}/_edge/tenant_info`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  const { cloudId } = (await tenantRes.json()) as { cloudId: string };

  // Format answers for Proforma API
  const formattedAnswers: Record<string, unknown> = {};
  for (const [qId, answer] of Object.entries(answers)) {
    if (answer.choices) {
      formattedAnswers[qId] = { choices: answer.choices.map((id) => ({ id })) };
    } else if (answer.text) {
      formattedAnswers[qId] = { text: answer.text };
    }
  }

  const url = `https://api.atlassian.com/jira/forms/cloud/${cloudId}/issue/${issueId}/form/${formId}`;

  await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ answers: formattedAnswers }),
  });
}
