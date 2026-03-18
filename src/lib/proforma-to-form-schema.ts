/**
 * Bridge between Proforma form schema and DynamicFormRenderer's FormSchema.
 *
 * Proforma question types:
 *   tl = text line (short text)
 *   ts = text short (short text)
 *   pg = paragraph (long text)
 *   cs = choice single (dropdown)
 *   cd = choice dropdown (dropdown)
 *   cm = choice multi (checkbox group)
 *   da = date
 *   no = number
 *   us = user single (text — we can't render a user picker, use text)
 *   um = user multi (text — same)
 *
 * Sections map to FormSections. Conditions on sections map to
 * DynamicFormRenderer's Conditional system — when a section has a condition
 * that depends on a question's chosen value, all fields in that section
 * get a `conditional` prop.
 */

import type { ProformaForm, ProformaQuestion, ProformaCondition } from "@/lib/jira";
import type { FormField, FormSchema, FormSection, Conditional } from "@/components/DynamicFormRenderer";

type FormFieldType = FormField["type"];

/**
 * Map a Proforma question type to a DynamicFormRenderer field type.
 */
function mapQuestionType(type: string): FormFieldType {
  switch (type) {
    case "tl": // text line
    case "ts": // text short
      return "short_text";
    case "pg": // paragraph
      return "paragraph";
    case "cs": // choice single
    case "cd": // choice dropdown
      return "dropdown";
    case "cm": // choice multi
      return "checkbox_group";
    case "da": // date
      return "date_picker";
    case "no": // number
      return "number";
    case "us": // user single — no user picker in renderer, use text
    case "um": // user multi
      return "short_text";
    default:
      return "short_text";
  }
}

/**
 * Map a Proforma question to a DynamicFormRenderer field.
 */
function mapQuestion(
  questionId: string,
  question: ProformaQuestion,
  conditional?: Conditional
): FormField {
  const type = mapQuestionType(question.type);

  const field: FormField = {
    id: `proforma_${questionId}`,
    type,
    label: question.label,
    description: question.description || undefined,
    required: question.validation.rq,
    conditional,
  };

  // Map choices to options
  if (question.choices && question.choices.length > 0) {
    field.options = question.choices.map((c) => ({
      value: c.id,
      label: c.label,
    }));
  }

  // Placeholder
  if (type === "short_text" || type === "paragraph") {
    field.placeholder = question.description || `Enter ${question.label.toLowerCase()}...`;
  }

  return field;
}

/**
 * Build conditional rules for sections.
 *
 * Proforma conditions work like:
 *   condition 7: if question 5 has choice ["1"] → show sections ["1"]
 *
 * We translate this to DynamicFormRenderer's Conditional:
 *   { fieldId: "proforma_5", operator: "in", values: ["1"] }
 *
 * Applied to every field in the target section.
 */
function buildSectionConditionals(
  form: ProformaForm
): Map<string, Conditional> {
  const sectionConditionalMap = new Map<string, Conditional>();
  const { conditions, sections } = form.design;

  for (const [, condition] of Object.entries(conditions)) {
    // Find which question drives this condition
    const cIds = condition.i.co.cIds;
    const questionIds = Object.keys(cIds);
    if (questionIds.length === 0) continue;

    // Use the first question as the driver
    const driverQuestionId = questionIds[0];
    const requiredChoiceIds = cIds[driverQuestionId];

    // Which sections does this condition show?
    const targetSectionIds = condition.o.sIds;

    const conditional: Conditional = {
      fieldId: `proforma_${driverQuestionId}`,
      operator: "in",
      values: requiredChoiceIds,
    };

    for (const sectionId of targetSectionIds) {
      sectionConditionalMap.set(sectionId, conditional);
    }
  }

  return sectionConditionalMap;
}

/**
 * Extract which questions belong to which section from the layout.
 * The layout is an ADF (Atlassian Document Format) array — one entry per section.
 * Questions are embedded as extensions with parameters.id.
 */
function extractSectionQuestions(
  layout: ProformaForm["design"]["layout"]
): Map<number, number[]> {
  const sectionQuestions = new Map<number, number[]>();

  layout.forEach((section, index) => {
    const questionIds: number[] = [];
    extractQuestionIdsFromContent(section.content, questionIds);
    // Section indices are 0-based in layout but 1-based in sections map
    sectionQuestions.set(index, questionIds);
  });

  return sectionQuestions;
}

function extractQuestionIdsFromContent(
  content: unknown[],
  ids: number[]
): void {
  for (const node of content) {
    if (typeof node !== "object" || node === null) continue;
    const n = node as Record<string, unknown>;

    if (
      n.type === "extension" &&
      typeof n.attrs === "object" &&
      n.attrs !== null
    ) {
      const attrs = n.attrs as Record<string, unknown>;
      if (
        attrs.extensionType === "com.thinktilt.proforma" &&
        attrs.extensionKey === "question" &&
        typeof attrs.parameters === "object" &&
        attrs.parameters !== null
      ) {
        const params = attrs.parameters as Record<string, unknown>;
        if (typeof params.id === "number") {
          ids.push(params.id);
        }
      }
    }

    // Recurse into child content
    if (Array.isArray(n.content)) {
      extractQuestionIdsFromContent(n.content as unknown[], ids);
    }
  }
}

/**
 * Convert a Proforma form to a FormSchema for DynamicFormRenderer.
 *
 * All fields — both always-visible and conditional — are merged into a
 * single section. Conditional fields get a `conditional` prop so
 * DynamicFormRenderer shows/hides them based on the driving question's
 * value, instead of rendering empty tabs for unmatched sections.
 */
export function proformaToFormSchema(
  requestTypeName: string,
  form: ProformaForm
): FormSchema {
  const { questions, sections, layout, settings } = form.design;
  const sectionConditionals = buildSectionConditionals(form);
  const sectionQuestionMap = extractSectionQuestions(layout);

  const allFields: FormField[] = [];

  // Base section (layout[0]) — always-visible fields (no conditional)
  const baseQuestionIds = sectionQuestionMap.get(0) ?? [];
  for (const qId of baseQuestionIds) {
    const question = questions[String(qId)];
    if (!question) continue;
    allFields.push(mapQuestion(String(qId), question));
  }

  // Conditional sections (layout[1+]) — fields get field-level conditionals
  const sectionEntries = Object.entries(sections).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  sectionEntries.forEach(([sectionId], idx) => {
    const layoutIndex = idx + 1;
    const questionIds = sectionQuestionMap.get(layoutIndex) ?? [];
    const conditional = sectionConditionals.get(sectionId);

    for (const qId of questionIds) {
      const question = questions[String(qId)];
      if (!question) continue;
      allFields.push(mapQuestion(String(qId), question, conditional));
    }
  });

  return {
    id: `proforma-${requestTypeName.toLowerCase().replace(/\s+/g, "-")}`,
    title: requestTypeName,
    sections: [
      {
        id: "section-main",
        title: settings.name || requestTypeName,
        fields: allFields,
      },
    ],
  };
}
