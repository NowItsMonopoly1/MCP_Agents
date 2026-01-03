import { randomUUID } from "crypto";

export const change_order_draft = {
  description: "Generate a draft change order from field notes (contractors domain, DRAFT-ONLY)",

  inputSchema: {
    type: "object",
    properties: {
      notes: { type: "string", description: "Field notes describing the change" },
      projectId: { type: "string", description: "Optional project ID" }
    },
    required: ["notes"]
  },

  async execute({ notes, projectId }) {
    // Parse notes into structured line items (simple NLP-like logic)
    const lineItems = parseNotesIntoLineItems(notes);

    const draft = {
      id: `draft-${randomUUID()}`,
      type: "CHANGE_ORDER_DRAFT",
      projectId: projectId || null,
      createdAt: new Date().toISOString(),
      createdBy: "ui:user",
      status: "DRAFT",
      payload: {
        summary: generateSummary(notes),
        line_items: lineItems,
        original_notes: notes
      }
    };

    return {
      actions: [{
        type: "change_order_draft_created",
        draft
      }]
    };
  }
};

// Helper: Extract line items from notes
function parseNotesIntoLineItems(notes) {
  const items = [];

  // Simple keyword-based extraction
  const addPattern = /add(?:ed)?\s+(\d+)\s*(?:x\s*)?([^,.\n]+)/gi;
  const movePattern = /mov(?:e|ed)\s+(\d+)\s*([^,.\n]+)/gi;
  const installPattern = /install(?:ed)?\s+([^,.\n]+)/gi;

  let match;

  while ((match = addPattern.exec(notes)) !== null) {
    const quantity = parseInt(match[1]);
    const description = match[2].trim();
    items.push({
      description: `Add ${quantity}x ${description}`,
      labor_hours: estimateLaborHours(quantity, description),
      materials: [description],
      notes: "Extracted from field notes"
    });
  }

  while ((match = movePattern.exec(notes)) !== null) {
    const quantity = parseInt(match[1]);
    const description = match[2].trim();
    items.push({
      description: `Relocate ${quantity}x ${description}`,
      labor_hours: estimateLaborHours(quantity, description) * 0.5,
      materials: [],
      notes: "Extracted from field notes"
    });
  }

  while ((match = installPattern.exec(notes)) !== null) {
    const description = match[1].trim();
    items.push({
      description: `Install ${description}`,
      labor_hours: estimateLaborHours(1, description),
      materials: [description],
      notes: "Extracted from field notes"
    });
  }

  // Fallback: if no patterns matched, create single generic item
  if (items.length === 0) {
    items.push({
      description: notes.substring(0, 100),
      labor_hours: 2,
      materials: ["Materials TBD"],
      notes: "Generic extraction - refine manually"
    });
  }

  return items;
}

// Helper: Estimate labor hours (simple heuristic)
function estimateLaborHours(quantity, description) {
  const desc = description.toLowerCase();

  if (desc.includes("fixture") || desc.includes("light")) {
    return quantity * 0.5;
  }
  if (desc.includes("receptacle") || desc.includes("outlet")) {
    return quantity * 0.75;
  }
  if (desc.includes("circuit") || desc.includes("panel")) {
    return quantity * 2;
  }
  if (desc.includes("conduit")) {
    return quantity * 1.5;
  }

  // Default
  return quantity * 1;
}

// Helper: Generate summary
function generateSummary(notes) {
  const words = notes.trim().split(/\s+/);
  if (words.length <= 15) return notes;
  return words.slice(0, 15).join(' ') + '...';
}
