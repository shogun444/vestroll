import { db } from "../db";
import {
  users,
  contracts,
  milestones,
  invoices,
  timesheets,
  employees,
  timeOffRequests,
} from "../db/schema";
import { eq, and, or, count } from "drizzle-orm";
import { ForbiddenError } from "../utils/errors";

export class AttentionService {
  static async getAttentionItems(userId: string) {
    const [user] = await db
      .select({ organizationId: users.organizationId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user?.organizationId) {
      throw new ForbiddenError("User is not associated with any organization");
    }

    const orgId = user.organizationId;

    const [
      contractsResult,
      milestonesResult,
      invoicesResult,
      timesheetsResult,
      timeOffResult,
    ] = await Promise.all([
      db
        .select({ contractsPendingSignature: count() })
        .from(contracts)
        .where(
          and(
            eq(contracts.organizationId, orgId),
            eq(contracts.status, "pending_signature"),
          ),
        ),
      db
        .select({ milestonesCompleted: count() })
        .from(milestones)
        .innerJoin(employees, eq(milestones.employeeId, employees.id))
        .where(
          and(
            eq(employees.organizationId, orgId),
            eq(milestones.status, "completed"),
          ),
        ),
      db
        .select({ invoicesRequiringPayment: count() })
        .from(invoices)
        .where(
          and(
            eq(invoices.organizationId, orgId),
            or(eq(invoices.status, "unpaid"), eq(invoices.status, "overdue")),
          ),
        ),
      db
        .select({ pendingTimesheets: count() })
        .from(timesheets)
        .where(
          and(
            eq(timesheets.organizationId, orgId),
            eq(timesheets.status, "pending"),
          ),
        ),
      db
        .select({ pendingTimeOffRequests: count() })
        .from(timeOffRequests)
        .where(
          and(
            eq(timeOffRequests.organizationId, orgId),
            eq(timeOffRequests.status, "pending"),
          ),
        ),
    ]);

    return {
      contractsPendingSignature: Number(contractsResult[0]?.contractsPendingSignature ?? 0),
      milestonesCompleted: Number(milestonesResult[0]?.milestonesCompleted ?? 0),
      invoicesRequiringPayment: Number(invoicesResult[0]?.invoicesRequiringPayment ?? 0),
      pendingTimesheets: Number(timesheetsResult[0]?.pendingTimesheets ?? 0),
      pendingTimeOffRequests: Number(timeOffResult[0]?.pendingTimeOffRequests ?? 0),
    };
  }
}
