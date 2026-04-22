CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."audit_event" AS ENUM('ROLE_CHANGE', 'EMAIL_CHANGE', 'BIOMETRIC_ENROLLMENT', 'PASSWORD_CHANGE', 'ACCOUNT_DELETION', 'SECURITY_CHANGE');--> statement-breakpoint
CREATE TYPE "public"."contract_status" AS ENUM('pending_signature', 'in_review', 'rejected', 'active', 'completed');--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('fixed_rate', 'pay_as_you_go', 'milestone');--> statement-breakpoint
CREATE TYPE "public"."employee_status" AS ENUM('Active', 'Inactive');--> statement-breakpoint
CREATE TYPE "public"."employee_type" AS ENUM('Freelancer', 'Contractor');--> statement-breakpoint
CREATE TYPE "public"."fiat_provider" AS ENUM('monnify', 'flutterwave');--> statement-breakpoint
CREATE TYPE "public"."fiat_transaction_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."fiat_transaction_type" AS ENUM('deposit', 'withdrawal', 'payout');--> statement-breakpoint
CREATE TYPE "public"."invitation_role" AS ENUM('admin', 'hr_manager', 'payroll_manager', 'employee');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'declined', 'expired');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('pending', 'approved', 'unpaid', 'overdue', 'paid', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."kyb_status" AS ENUM('not_started', 'pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."leave_status" AS ENUM('Pending', 'Approved', 'Rejected', 'Cancelled');--> statement-breakpoint
CREATE TYPE "public"."leave_type" AS ENUM('vacation', 'sick', 'personal', 'other');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('pending', 'in_progress', 'completed', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."oauth_provider" AS ENUM('google', 'apple');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('crypto', 'fiat');--> statement-breakpoint
CREATE TYPE "public"."signer_type" AS ENUM('Email', 'Passkey');--> statement-breakpoint
CREATE TYPE "public"."time_off_type" AS ENUM('paid', 'unpaid');--> statement-breakpoint
CREATE TYPE "public"."two_factor_method" AS ENUM('totp', 'backup_code');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('pending_verification', 'active', 'suspended');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"event" "audit_event" NOT NULL,
	"old_value" text,
	"new_value" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "backup_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"code_hash" varchar(255) NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "biometric_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"email" varchar(255),
	"last_login_ip" varchar(45),
	"last_login_ua" text,
	"success" boolean NOT NULL,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
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
	"billing_country" varchar(2) NOT NULL,
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
CREATE TABLE "email_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"otp_hash" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(255) NOT NULL,
	"department" varchar(255),
	"type" "employee_type" NOT NULL,
	"status" "employee_status" DEFAULT 'Active' NOT NULL,
	"avatar_url" varchar(512),
	"user_id" uuid,
	"bank_name" varchar(255),
	"account_number" varchar(255),
	"routing_number" varchar(255),
	"sort_code" varchar(255),
	"iban" varchar(34),
	"swift_code" varchar(11),
	"account_type" varchar(50),
	"account_holder_name" varchar(255),
	"is_account_verified" boolean DEFAULT false NOT NULL,
	"account_verified_at" timestamp,
	"bank_address" varchar(500),
	"bank_city" varchar(255),
	"bank_country" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fiat_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"amount" bigint NOT NULL,
	"type" "fiat_transaction_type" NOT NULL,
	"status" "fiat_transaction_status" DEFAULT 'pending' NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_reference" varchar(255) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fiat_transactions_provider_reference_unique" UNIQUE("provider_reference")
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
CREATE TABLE "kyb_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"registration_type" varchar(255) NOT NULL,
	"registration_no" varchar(255) NOT NULL,
	"incorporation_certificate_path" varchar(512) NOT NULL,
	"incorporation_certificate_url" varchar(1024) NOT NULL,
	"memorandum_article_path" varchar(512) NOT NULL,
	"memorandum_article_url" varchar(1024) NOT NULL,
	"form_c02_c07_path" varchar(512),
	"form_c02_c07_url" varchar(1024),
	"status" "kyb_status" DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"rejection_code" varchar(100),
	"submitted_at" timestamp,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "kyb_verifications_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"last_login_ip" varchar(45),
	"last_login_ua" text,
	"success" boolean NOT NULL,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"milestone_name" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"due_date" timestamp NOT NULL,
	"status" "milestone_status" DEFAULT 'pending' NOT NULL,
	"employee_id" uuid,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_fiat_balances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"currency" varchar(3) DEFAULT 'NGN' NOT NULL,
	"balance" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_fiat_balances_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
CREATE TABLE "organization_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"invited_by_user_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "invitation_role" NOT NULL,
	"token" varchar(255) NOT NULL,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"message" text,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"declined_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "organization_wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"wallet_address" varchar(255),
	"virtual_account_number" varchar(20),
	"virtual_bank_name" varchar(255),
	"funded" boolean DEFAULT false NOT NULL,
	"funded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_wallets_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"provider_preference" "fiat_provider" DEFAULT 'monnify' NOT NULL,
	"industry" varchar(255),
	"registration_number" varchar(255),
	"registered_street" varchar(255),
	"registered_city" varchar(255),
	"registered_state" varchar(255),
	"registered_postal_code" varchar(255),
	"registered_country" varchar(255),
	"billing_street" varchar(255),
	"billing_city" varchar(255),
	"billing_state" varchar(255),
	"billing_postal_code" varchar(255),
	"billing_country" varchar(255),
	"website" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "passkey_registration_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"challenge_hash" varchar(64) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "passkey_registration_challenges_challenge_hash_unique" UNIQUE("challenge_hash")
);
--> statement-breakpoint
CREATE TABLE "password_resets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_resets_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token_hash" varchar(255) NOT NULL,
	"device_info" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "signer_audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"signer_public_key" varchar(56) NOT NULL,
	"transaction_hash" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
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
CREATE TABLE "transaction_cache" (
	"hash" text PRIMARY KEY NOT NULL,
	"result_json" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trusted_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"device_token" varchar(255) NOT NULL,
	"device_name" varchar(255),
	"ip_address" varchar(45),
	"user_agent" text,
	"expires_at" timestamp NOT NULL,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "trusted_devices_device_token_unique" UNIQUE("device_token")
);
--> statement-breakpoint
CREATE TABLE "two_factor_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"success" boolean NOT NULL,
	"method" "two_factor_method" NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"avatar_url" varchar(500),
	"role" varchar(100),
	"organization_name" varchar(255),
	"status" "user_status" DEFAULT 'pending_verification' NOT NULL,
	"organization_id" uuid,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"two_factor_secret" text,
	"two_factor_enabled_at" timestamp,
	"failed_two_factor_attempts" integer DEFAULT 0 NOT NULL,
	"two_factor_lockout_until" timestamp,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp,
	"account_locked_reason" text,
	"oauth_provider" "oauth_provider",
	"oauth_id" varchar(255),
	"signer_type" "signer_type" DEFAULT 'Email' NOT NULL,
	"last_login_at" timestamp,
	"last_active_at" timestamp,
	"last_login_ip" varchar(45),
	"last_login_ua" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backup_codes" ADD CONSTRAINT "backup_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biometric_logs" ADD CONSTRAINT "biometric_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiat_transactions" ADD CONSTRAINT "fiat_transactions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyb_audit_logs" ADD CONSTRAINT "kyb_audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyb_verifications" ADD CONSTRAINT "kyb_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_fiat_balances" ADD CONSTRAINT "organization_fiat_balances_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_wallets" ADD CONSTRAINT "organization_wallets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passkey_registration_challenges" ADD CONSTRAINT "passkey_registration_challenges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_off_requests" ADD CONSTRAINT "time_off_requests_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_off_requests" ADD CONSTRAINT "time_off_requests_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trusted_devices" ADD CONSTRAINT "trusted_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor_attempts" ADD CONSTRAINT "two_factor_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contracts_organization_id_idx" ON "contracts" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "contracts_status_idx" ON "contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "employees_organization_id_idx" ON "employees" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "employees_account_number_idx" ON "employees" USING btree ("account_number");--> statement-breakpoint
CREATE INDEX "employees_routing_number_idx" ON "employees" USING btree ("routing_number");--> statement-breakpoint
CREATE INDEX "fiat_transactions_organization_id_idx" ON "fiat_transactions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "fiat_transactions_status_idx" ON "fiat_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fiat_transactions_type_idx" ON "fiat_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "invoices_organization_id_idx" ON "invoices" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "kyb_audit_logs_entity_id_idx" ON "kyb_audit_logs" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "kyb_audit_logs_actor_id_idx" ON "kyb_audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "login_attempts_created_at_idx" ON "login_attempts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "milestones_employee_id_idx" ON "milestones" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "organization_invitations_organization_id_idx" ON "organization_invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_invitations_email_idx" ON "organization_invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "organization_invitations_token_idx" ON "organization_invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "organization_invitations_status_idx" ON "organization_invitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "passkey_registration_challenges_user_id_idx" ON "passkey_registration_challenges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "password_resets_user_id_idx" ON "password_resets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "signer_audits_transaction_hash_idx" ON "signer_audits" USING btree ("transaction_hash");--> statement-breakpoint
CREATE INDEX "time_off_requests_organization_id_idx" ON "time_off_requests" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "time_off_requests_status_idx" ON "time_off_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "timesheets_organization_id_idx" ON "timesheets" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "timesheets_employee_id_idx" ON "timesheets" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "timesheets_status_idx" ON "timesheets" USING btree ("status");