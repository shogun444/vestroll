import { NextRequest } from "next/server";
import { ApiResponse } from "@/server/utils/api-response";
import { AppError } from "@/server/utils/errors";
import { AuthUtils } from "@/server/utils/auth";
import { TimeOffService } from "@/server/services/time-off.service";
import { TimeOffRequestSchema } from "@/server/validations/time-off.schema";
import { ZodError } from "zod";

/**
 * @swagger
 * /team/time-off:
 *   get:
 *     summary: Get all time-off requests
 *     description: Retrieve all leave requests (Sick, Vacation, etc.) for the organization.
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Time-off requests retrieved successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: User not associated with an organization
 */
export async function GET(req: NextRequest) {
    try {
        const { userId } = await AuthUtils.authenticateRequest(req);

        const result = await TimeOffService.getTimeOffRequests(userId);

        return ApiResponse.success(result, "Time-off requests retrieved successfully");
    } catch (error) {
        if (error instanceof AppError) {
            return ApiResponse.error(error.message, error.statusCode, error.errors);
        }

        console.error("[Team Time-Off Error]", error);
        return ApiResponse.error("Internal server error", 500);
    }
}

/**
 * @swagger
 * /team/time-off:
 *   post:
 *     summary: Submit a new time-off request
 *     description: >
 *       Allows an authenticated employee (or an admin acting on behalf of an employee)
 *       to submit a leave request. The record is created with `status = "pending"` and
 *       immediately appears in the manager's approvals queue.
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [startDate, endDate]
 *             properties:
 *               startDate:
 *                 type: string
 *                 example: "2025-07-01"
 *               endDate:
 *                 type: string
 *                 example: "2025-07-05"
 *               leaveType:
 *                 type: string
 *                 enum: [vacation, sick, personal, other]
 *                 default: vacation
 *               reason:
 *                 type: string
 *                 example: "Annual family holiday"
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *                 description: "Admin only: submit on behalf of a specific employee"
 *     responses:
 *       201:
 *         description: Time-off request submitted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User not associated with an organization
 *       404:
 *         description: Employee record not found
 */
export async function POST(req: NextRequest) {
    try {
        const { userId } = await AuthUtils.authenticateRequest(req);

        // Parse & validate body
        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return ApiResponse.error("Invalid JSON body", 400);
        }

        const parsed = TimeOffRequestSchema.safeParse(body);
        if (!parsed.success) {
            const fieldErrors = parsed.error.issues.map((e: any) => ({
                field: e.path?.join(".") || "unknown",
                message: e.message,
            }));
            return ApiResponse.error("Validation failed", 400, { fields: fieldErrors });
        }

        const { startDate, endDate, leaveType, reason, employeeId } = parsed.data;

        // Map leaveType → DB's paid/unpaid enum
        // "vacation" = planned annual leave → paid; all others default to unpaid
        const type: "paid" | "unpaid" = leaveType === "vacation" ? "paid" : "unpaid";

        const result = await TimeOffService.createTimeOffRequest({
            userId,
            employeeId,
            type,
            startDate,
            endDate,
            reason: reason ?? leaveType, // use leaveType as fallback reason label
        });

        return ApiResponse.success(result, "Time-off request submitted successfully", 201);
    } catch (error) {
        if (error instanceof AppError) {
            return ApiResponse.error(error.message, error.statusCode, error.errors);
        }
        if (error instanceof ZodError) {
            return ApiResponse.error("Validation failed", 400);
        }

        console.error("[POST Team Time-Off Error]", error);
        return ApiResponse.error("Internal server error", 500);
    }
}
