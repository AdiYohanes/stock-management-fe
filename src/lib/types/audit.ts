/** Audit action types for stock management operations */
export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT";

/** Entity types that can be audited */
export type AuditEntity =
  | "Product"
  | "GoodsReceipt"
  | "GoodsIssue"
  | "Adjustment";

/** Represents a single audit log entry */
export interface AuditLog {
  id: string;
  timestamp: string;
  user_name: string;
  user_role: string;
  action: AuditAction;
  entity_type: AuditEntity;
  entity_id: string;
  entity_label: string;
  description: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
}
