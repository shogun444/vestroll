ALTER TABLE "timesheets" ADD COLUMN "total_approved_amount" integer;
ALTER TABLE "timesheets" ADD COLUMN "locked_for_payroll" boolean DEFAULT false NOT NULL;
ALTER TABLE "timesheets" ADD COLUMN "approved_by" uuid;
ALTER TABLE "timesheets" ADD COLUMN "approved_at" timestamp;

DO $$ BEGIN
  ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
