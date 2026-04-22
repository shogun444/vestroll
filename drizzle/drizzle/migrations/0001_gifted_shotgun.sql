CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."contract_status" AS ENUM('pending_signature', 'in_review', 'rejected', 'active', 'completed');--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('fixed_rate', 'pay_as_you_go', 'milestone');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('pending', 'approved', 'unpaid', 'overdue', 'paid', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('pending', 'in_progress', 'completed', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('crypto', 'fiat');--> statement-breakpoint
CREATE TYPE "public"."time_off_type" AS ENUM('paid', 'unpaid');--> statement-breakpoint
CREATE TABLE "company_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"logo_url" varchar(512),
	"brand_name" varchar(255) NOT NULL,
	"registered_name" varchar(255) NOT NULL,
	"registration_number" varchar(255) NOT NULL,
	"country" varchar(255) NOT NULL,
	"size" varchar(100),
	"vat_number" varchar(255),
	"website" varchar(512),
	"address" varchar(500) NOT NULL,
	"alt_address" varchar(500),
	"city" varchar(255) NOT NULL,
	"region" varchar(255),
	"postal_code" varchar(50),
	"billing_address" varchar(500),
	"billing_alt_address" varchar(500),
	"billing_city" varchar(255),
	"billing_region" varchar(255),
	"billing_country" varchar(255),
	"billing_postal_code" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "company_profiles_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"payment_type" "payment_type" NOT NULL,
	"contract_type" "contract_type" NOT NULL,
	"status" "contract_status" DEFAULT 'pending_signature' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"description" text,
	"expense_date" timestamp NOT NULL,
	"status" "approval_status" DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"contract_id" uuid,
	"invoice_no" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"paid_in" "payment_type" NOT NULL,
	"status" "invoice_status" DEFAULT 'pending' NOT NULL,
	"issue_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"contract_id" uuid,
	"milestone_name" varchar(255) NOT NULL,
	"milestone_completed" integer DEFAULT 0 NOT NULL,
	"total_milestone" integer NOT NULL,
	"amount" integer NOT NULL,
	"status" "milestone_status" DEFAULT 'pending' NOT NULL,
	"due_date" timestamp,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"wallet_address" varchar(255),
	"funded" boolean DEFAULT false NOT NULL,
	"funded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_wallets_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
CREATE TABLE "time_off_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"type" time_off_type NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"reason" varchar(255) NOT NULL,
	"description" text,
	"total_duration" integer NOT NULL,
	"status" "approval_status" DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timesheets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"rate" integer NOT NULL,
	"total_worked" integer NOT NULL,
	"total_amount" integer NOT NULL,
	"status" "approval_status" DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "industry" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "registration_number" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "registered_street" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "registered_city" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "registered_state" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "registered_postal_code" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "registered_country" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "billing_street" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "billing_city" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "billing_state" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "billing_postal_code" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "billing_country" varchar(255);--> statement-breakpoint
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_wallets" ADD CONSTRAINT "organization_wallets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_off_requests" ADD CONSTRAINT "time_off_requests_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_off_requests" ADD CONSTRAINT "time_off_requests_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contracts_organization_id_idx" ON "contracts" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "contracts_status_idx" ON "contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "expenses_organization_id_idx" ON "expenses" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "expenses_status_idx" ON "expenses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoices_organization_id_idx" ON "invoices" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "milestones_organization_id_idx" ON "milestones" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "milestones_status_idx" ON "milestones" USING btree ("status");--> statement-breakpoint
CREATE INDEX "time_off_requests_organization_id_idx" ON "time_off_requests" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "time_off_requests_status_idx" ON "time_off_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "timesheets_organization_id_idx" ON "timesheets" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "timesheets_status_idx" ON "timesheets" USING btree ("status");