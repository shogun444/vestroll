ALTER TABLE "expenses"
ADD COLUMN IF NOT EXISTS "ready_for_payout" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "expenses"
ADD COLUMN IF NOT EXISTS "approver_id" uuid;
--> statement-breakpoint
ALTER TABLE "expenses"
ADD COLUMN IF NOT EXISTS "processed_at" timestamp;
--> statement-breakpoint
ALTER TABLE "expenses"
ADD COLUMN IF NOT EXISTS "rejection_reason" text;
--> statement-breakpoint
ALTER TABLE "expenses"
ADD CONSTRAINT "expenses_approver_id_users_id_fk"
FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "expense_status_audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "expense_id" uuid NOT NULL,
  "previous_status" "approval_status" NOT NULL,
  "new_status" "approval_status" NOT NULL,
  "approver_id" uuid NOT NULL,
  "comment" text,
  "processed_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expense_status_audit_logs"
ADD CONSTRAINT "expense_status_audit_logs_expense_id_expenses_id_fk"
FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "expense_status_audit_logs"
ADD CONSTRAINT "expense_status_audit_logs_approver_id_users_id_fk"
FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "expense_status_audit_logs_expense_id_idx"
ON "expense_status_audit_logs" USING btree ("expense_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "expense_status_audit_logs_approver_id_idx"
ON "expense_status_audit_logs" USING btree ("approver_id");
