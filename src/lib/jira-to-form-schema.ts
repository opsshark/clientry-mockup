/**
 * Bridge between Jira RequestTypeField[] and DynamicFormRenderer's FormSchema.
 *
 * This is the hardest integration piece — Jira's field schema doesn't map 1:1
 * to the renderer's expected format. Key gotchas:
 * - Select field values are numeric IDs ("10004"), not labels ("Standard")
 * - Attachment fields are filtered out (handled separately)
 * - `datetime` and `date` both map to `date_picker`
 * - Custom fields use `customfield_XXXXX` as IDs
 * - Some `string` fields without `system` are free-text (implementation plan, etc.)
 */

import type { RequestTypeField } from "@/lib/jira";
import type { FormField, FormSchema, FormSection } from "@/components/DynamicFormRenderer";

type FormFieldType = FormField["type"];

/**
 * Map a Jira field's schema to a DynamicFormRenderer field type.
 */
function mapFieldType(field: RequestTypeField): FormFieldType | null {
  const { type, system, items } = field.jiraSchema;

  // ─── Unsupported field types (skip rendering) ───
  // service-entity-field: JSM ITSM "Affected services". Requires separate
  // services API to fetch options — not supported in V1.
  if (items === "service-entity-field") return null;

  // Known system fields
  if (system === "description") return "paragraph";
  if (system === "summary") return "short_text";

  // By Jira schema type
  if (type === "option") return "dropdown";
  if (type === "date" || type === "datetime") return "date_picker";
  if (type === "number") return "number";

  // Arrays (non-attachment)
  if (type === "array" && items !== "attachment") {
    // Could be multi-select — if it has valid values, treat as checkbox_group
    if (field.validValues.length > 0) return "checkbox_group";
    return "short_text";
  }

  // String fields without system — check if they look like long-form
  if (type === "string" && !system) {
    const lower = field.name.toLowerCase();
    if (
      lower.includes("plan") ||
      lower.includes("description") ||
      lower.includes("detail") ||
      lower.includes("notes") ||
      lower.includes("reason")
    ) {
      return "paragraph";
    }
    return "short_text";
  }

  return "short_text";
}

/**
 * Map a single Jira RequestTypeField to a FormField.
 */
function mapField(field: RequestTypeField): FormField | null {
  const type = mapFieldType(field);
  if (!type) return null; // Unsupported field type — skip

  const formField: FormField = {
    id: field.fieldId,
    type,
    label: field.name,
    description: field.description || undefined,
    required: field.required,
  };

  // Map validValues to options (for dropdown, single_choice, checkbox_group)
  if (field.validValues.length > 0) {
    formField.options = field.validValues.map((v) => ({
      value: v.value, // numeric ID — pass as-is to Jira on submit
      label: v.label,
    }));
  }

  // Add placeholder for text fields
  if (type === "short_text" || type === "paragraph") {
    formField.placeholder = field.description || `Enter ${field.name.toLowerCase()}...`;
  }

  return formField;
}

/**
 * Convert Jira RequestTypeField[] to a FormSchema for DynamicFormRenderer.
 *
 * Groups fields into sections intelligently:
 * - If there are 4+ fields, split into "Details" (summary/desc) and "Additional Info"
 * - Otherwise, one section
 */
export function jiraFieldsToFormSchema(
  requestTypeName: string,
  fields: RequestTypeField[]
): FormSchema {
  // Filter out attachment fields and non-visible fields
  const visibleFields = fields.filter(
    (f) => f.visible && f.jiraSchema.items !== "attachment"
  );

  const formFields = visibleFields
    .map(mapField)
    .filter((f): f is FormField => f !== null);

  return {
    id: `form-${requestTypeName.toLowerCase().replace(/\s+/g, "-")}`,
    title: requestTypeName,
    sections: [
      {
        id: "section-main",
        title: requestTypeName,
        fields: formFields,
      },
    ],
  };
}
