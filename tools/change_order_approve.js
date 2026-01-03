import { writeJournal } from "../journal/write.js";

export const change_order_approve = {
  description: "Approve a change order draft (audit-only, no external side effects)",

  inputSchema: {
    type: "object",
    properties: {
      draftId: { type: "string", description: "ID of the draft being approved" },
      projectId: { type: "string", description: "Project ID (optional)" },
      jobId: { type: "string", description: "Job ID (optional)" },
      companyId: { type: "string", description: "Company ID (optional)" },
      userId: { type: "string", description: "User ID (optional)" },
      approvedBy: { type: "string", description: "User or system approving the draft" },
      draftSnapshot: { type: "object", description: "Optional full draft for audit trail" }
    },
    required: ["draftId", "approvedBy"]
  },

  async execute({ draftId, projectId, jobId, companyId, userId, approvedBy, draftSnapshot }) {
    const approvedAt = new Date().toISOString();

    // Write detailed journal entry
    writeJournal({
      phase: "approval",
      action: "change_order_approved",
      draftId,
      projectId: projectId || null,
      jobId: jobId || null,
      companyId: companyId || null,
      userId: userId || null,
      approvedBy,
      approvedAt,
      snapshot: draftSnapshot ? {
        summary: draftSnapshot.payload?.summary,
        lineItemCount: draftSnapshot.payload?.line_items?.length,
        originalNotes: draftSnapshot.payload?.original_notes
      } : null
    });

    return {
      actions: [{
        type: "change_order_approved",
        draftId,
        approvedBy,
        projectId: projectId || null,
        approvedAt,
        status: "APPROVED",
        note: "Approval logged. Draft ready for PDF generation."
      }]
    };
  }
};
