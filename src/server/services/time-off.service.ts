import { and, desc, eq } from "drizzle-orm";
import { db, employees, timeOffRequests, users } from "../db";
import { BadRequestError, ForbiddenError, NotFoundError } from "../utils/errors";
import { hasAdminOrManagerRole } from "../utils/role";
import { EmailService } from "./email.service";
import { Logger } from "./logger.service";

interface CreateTimeOffInput {
  /** Authenticated user's ID (used to look up their employee record) */
  userId: string;
  /** Override: admin submitting on behalf of a specific employee */
  employeeId?: string;
  type: "paid" | "unpaid";
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason: string;
}

export interface CreateTimeOffResult {
  id: string;
  employeeId: string;
  organizationId: string;
  type: string;
  startDate: Date;
  endDate: Date;
  totalDuration: number;
  status: string;
  submittedAt: Date | null;
}

interface UpdateTimeOffStatusInput {
  requestId: string;
  actorOrganizationId: string | null;
  actorRole: string | null;
  actorName: string;
  status: "approved" | "rejected";
  reason?: string;
}

export interface UpdateTimeOffStatusResult {
  id: string;
  status: "approved" | "rejected";
  reason: string | null;
  updatedAt: Date;
}

export class TimeOffService {
  static async updateStatus(
    input: UpdateTimeOffStatusInput,
  ): Promise<UpdateTimeOffStatusResult> {
    if (!input.actorOrganizationId) {
      throw new ForbiddenError("User is not associated with any organization");
    }

    if (!hasAdminOrManagerRole(input.actorRole)) {
      throw new ForbiddenError(
        "Only administrators or managers can update time-off status",
      );
    }

    const [request] = await db
      .select({
        id: timeOffRequests.id,
        employeeEmail: employees.email,
        employeeFirstName: employees.firstName,
      })
      .from(timeOffRequests)
      .innerJoin(employees, eq(timeOffRequests.employeeId, employees.id))
      .where(
        and(
          eq(timeOffRequests.id, input.requestId),
          eq(timeOffRequests.organizationId, input.actorOrganizationId),
        ),
      )
      .limit(1);

    if (!request) {
      throw new NotFoundError("Time-off request not found");
    }

    const [updatedRequest] = await db
      .update(timeOffRequests)
      .set({
        status: input.status,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(timeOffRequests.id, input.requestId),
          eq(timeOffRequests.organizationId, input.actorOrganizationId),
        ),
      )
      .returning({
        id: timeOffRequests.id,
        status: timeOffRequests.status,
        updatedAt: timeOffRequests.updatedAt,
      });

    if (!updatedRequest) {
      throw new NotFoundError("Time-off request not found");
    }

    const normalizedReason = input.reason?.trim();
    const rejectionReason =
      input.status === "rejected" ? normalizedReason || null : null;

    await this.notifyEmployee({
      to: request.employeeEmail,
      firstName: request.employeeFirstName,
      status: input.status,
      actorName: input.actorName,
      reason: rejectionReason,
    });

    return {
      id: updatedRequest.id,
      status: updatedRequest.status as "approved" | "rejected",
      reason: rejectionReason,
      updatedAt: updatedRequest.updatedAt,
    };
  }

  private static async notifyEmployee(input: {
    to: string;
    firstName: string;
    status: "approved" | "rejected";
    actorName: string;
    reason: string | null;
  }) {
    const statusLabel = input.status === "approved" ? "Approved" : "Rejected";
    const safeFirstName = this.escapeHtml(input.firstName || "there");
    const safeActorName = this.escapeHtml(input.actorName || "a manager");
    const reasonBlock =
      input.status === "rejected" && input.reason
        ? `<p><strong>Reason:</strong> ${this.escapeHtml(input.reason)}</p>`
        : "";

    const html = `
      <h2>Time-off Request ${statusLabel}</h2>
      <p>Hi ${safeFirstName},</p>
      <p>Your time-off request has been <strong>${statusLabel.toLowerCase()}</strong> by ${safeActorName}.</p>
      ${reasonBlock}
      <p>You can log in to your VestRoll dashboard for more details.</p>
    `;

    try {
      await EmailService.send({
        to: input.to,
        subject: `Time-off request ${statusLabel}`,
        html,
      });
    } catch (error) {
      Logger.error("Failed to send time-off notification email", { to: input.to, status: input.status, error: String(error) });
    }
  }

  private static escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  static async createTimeOffRequest(
    input: CreateTimeOffInput,
  ): Promise<CreateTimeOffResult> {
    // 1. Resolve the actor's organisation
    const [user] = await db
      .select({ organizationId: users.organizationId })
      .from(users)
      .where(eq(users.id, input.userId))
      .limit(1);

    if (!user?.organizationId) {
      throw new ForbiddenError("User is not associated with any organization");
    }

    // 2. Resolve the employee record
    let resolvedEmployeeId: string;

    if (input.employeeId) {
      // Admin specified an explicit employee — verify they belong to the same org
      const [emp] = await db
        .select({ id: employees.id })
        .from(employees)
        .where(
          and(
            eq(employees.id, input.employeeId),
            eq(employees.organizationId, user.organizationId),
          ),
        )
        .limit(1);

      if (!emp) {
        throw new NotFoundError(
          "Employee not found within your organization",
        );
      }
      resolvedEmployeeId = emp.id;
    } else {
      // Self-submission: look up employee by userId
      const [emp] = await db
        .select({ id: employees.id })
        .from(employees)
        .where(
          and(
            eq(employees.userId, input.userId),
            eq(employees.organizationId, user.organizationId),
          ),
        )
        .limit(1);

      if (!emp) {
        throw new NotFoundError(
          "No employee record found for this user. Please contact your administrator.",
        );
      }
      resolvedEmployeeId = emp.id;
    }

    // 3. Validate dates
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestError("Invalid date format. Use YYYY-MM-DD.");
    }

    if (end < start) {
      throw new BadRequestError("endDate must be on or after startDate");
    }

    // Inclusive day count
    const totalDuration =
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // 4. Insert
    const [created] = await db
      .insert(timeOffRequests)
      .values({
        organizationId: user.organizationId,
        employeeId: resolvedEmployeeId,
        type: input.type,
        startDate: start,
        endDate: end,
        reason: input.reason,
        totalDuration,
        status: "pending",
        submittedAt: new Date(),
      })
      .returning({
        id: timeOffRequests.id,
        employeeId: timeOffRequests.employeeId,
        organizationId: timeOffRequests.organizationId,
        type: timeOffRequests.type,
        startDate: timeOffRequests.startDate,
        endDate: timeOffRequests.endDate,
        totalDuration: timeOffRequests.totalDuration,
        status: timeOffRequests.status,
        submittedAt: timeOffRequests.submittedAt,
      });

    return created;
  }

  static async getTimeOffRequests(userId: string) {
    const [user] = await db
      .select({ organizationId: users.organizationId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user?.organizationId) {
      throw new ForbiddenError("User is not associated with any organization");
    }

    const results = await db
      .select({
        id: timeOffRequests.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        type: timeOffRequests.type,
        startDate: timeOffRequests.startDate,
        endDate: timeOffRequests.endDate,
        totalDuration: timeOffRequests.totalDuration,
        status: timeOffRequests.status,
        submittedAt: timeOffRequests.submittedAt,
      })
      .from(timeOffRequests)
      .innerJoin(employees, eq(timeOffRequests.employeeId, employees.id))
      .where(eq(timeOffRequests.organizationId, user.organizationId))
      .orderBy(desc(timeOffRequests.submittedAt));

    return results.map((req) => ({
      id: req.id,
      employeeName: `${req.firstName} ${req.lastName}`.trim(),
      type: req.type,
      startDate: req.startDate,
      endDate: req.endDate,
      totalDuration: req.totalDuration,
      status: req.status,
      submittedAt: req.submittedAt,
    }));
  }
}
