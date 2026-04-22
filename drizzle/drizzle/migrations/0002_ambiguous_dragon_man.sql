CREATE TYPE "public"."milestone_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"milestone_name" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"due_date" timestamp NOT NULL,
	"status" "milestone_status" DEFAULT 'Pending' NOT NULL,
	"employee_id" uuid,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "milestones_employee_id_idx" ON "milestones" USING btree ("employee_id");