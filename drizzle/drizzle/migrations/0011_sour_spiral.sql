CREATE TABLE "kyb_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" varchar(255) NOT NULL,
	"actor_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signer_audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"signer_public_key" varchar(56) NOT NULL,
	"transaction_hash" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "company_profiles" ALTER COLUMN "billing_country" SET DATA TYPE varchar(2);--> statement-breakpoint
ALTER TABLE "company_profiles" ALTER COLUMN "billing_country" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "account_number" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "slug" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_active_at" timestamp;--> statement-breakpoint
ALTER TABLE "kyb_audit_logs" ADD CONSTRAINT "kyb_audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kyb_audit_logs_entity_id_idx" ON "kyb_audit_logs" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "kyb_audit_logs_actor_id_idx" ON "kyb_audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "signer_audits_transaction_hash_idx" ON "signer_audits" USING btree ("transaction_hash");--> statement-breakpoint
CREATE INDEX "login_attempts_created_at_idx" ON "login_attempts" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "account_name";--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_slug_unique" UNIQUE("slug");