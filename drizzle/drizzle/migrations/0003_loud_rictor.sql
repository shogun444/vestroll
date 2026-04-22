CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."contract_status" AS ENUM('pending_signature', 'in_review', 'rejected', 'active', 'completed');--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('fixed_rate', 'pay_as_you_go', 'milestone');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('pending', 'approved', 'unpaid', 'overdue', 'paid', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('crypto', 'fiat');--> statement-breakpoint
CREATE TYPE "public"."time_off_type" AS ENUM('paid', 'unpaid');--> statement-breakpoint
ALTER TYPE "public"."milestone_status" ADD VALUE 'in_progress' BEFORE 'approved';--> statement-breakpoint
ALTER TYPE "public"."milestone_status" ADD VALUE 'completed' BEFORE 'approved';--> statement-breakpoint
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
ALTER TABLE "milestones" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_wallets" ADD CONSTRAINT "organization_wallets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;