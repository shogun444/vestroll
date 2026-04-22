CREATE TYPE "public"."milestone_status" AS ENUM('In Progress', 'Approved', 'Rejected');--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"status" "milestone_status" DEFAULT 'In Progress' NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
