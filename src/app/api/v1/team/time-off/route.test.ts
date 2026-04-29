import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET, POST } from "./route";
import { NextRequest } from "next/server";
import { TimeOffService } from "@/server/services/time-off.service";
import { AuthUtils } from "@/server/utils/auth";
import { UnauthorizedError, ForbiddenError, NotFoundError } from "@/server/utils/errors";

vi.mock("@/server/services/time-off.service");
vi.mock("@/server/utils/auth");

// ─── Shared helpers ───────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:3000/api/v1/team/time-off";

const makeGetRequest = (): NextRequest =>
    new NextRequest(new URL(BASE_URL));

const makePostRequest = (body: unknown): NextRequest =>
    new NextRequest(new URL(BASE_URL), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

// ─── GET tests ────────────────────────────────────────────────────────────────

describe("GET /api/v1/team/time-off", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockTimeOffResponse = [
        {
            id: "1",
            employeeName: "James Akinbiola",
            type: "Vacation",
            startDate: new Date("2024-01-01"),
            endDate: new Date("2024-01-05"),
            totalDuration: 5,
            status: "Approved",
            submittedAt: new Date("2023-12-25"),
        },
    ];

    it("should return time-off requests for authenticated user", async () => {
        vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue({
            userId: "user-123",
        } as any);
        vi.mocked(TimeOffService.getTimeOffRequests).mockResolvedValue(
            mockTimeOffResponse as any
        );

        const response = await GET(makeGetRequest());

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.message).toBe("Time-off requests retrieved successfully");
        expect(data.data).toHaveLength(1);
        expect(data.data[0].employeeName).toBe("James Akinbiola");
    });

    it("should return 401 for unauthenticated request", async () => {
        vi.mocked(AuthUtils.authenticateRequest).mockRejectedValue(
            new UnauthorizedError()
        );

        const response = await GET(makeGetRequest());
        expect(response.status).toBe(401);
    });

    it("should return 403 when user has no organization", async () => {
        vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue({
            userId: "user-123",
        } as any);
        vi.mocked(TimeOffService.getTimeOffRequests).mockRejectedValue(
            new ForbiddenError("User is not associated with any organization")
        );

        const response = await GET(makeGetRequest());
        expect(response.status).toBe(403);
        const data = await response.json();
        expect(data.message).toBe("User is not associated with any organization");
    });

    it("should return 500 for unexpected errors", async () => {
        vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue({
            userId: "user-123",
        } as any);
        vi.mocked(TimeOffService.getTimeOffRequests).mockRejectedValue(
            new Error("Database connection failed")
        );

        const response = await GET(makeGetRequest());
        expect(response.status).toBe(500);
    });
});

// ─── POST tests ───────────────────────────────────────────────────────────────

const VALID_BODY = {
    startDate: "2025-07-01",
    endDate: "2025-07-05",
    leaveType: "vacation",
    reason: "Annual holiday",
};

const MOCK_CREATED = {
    id: "req-abc-123",
    employeeId: "emp-456",
    organizationId: "org-789",
    type: "paid",
    startDate: new Date("2025-07-01"),
    endDate: new Date("2025-07-05"),
    totalDuration: 5,
    status: "pending",
    submittedAt: new Date(),
};

describe("POST /api/v1/team/time-off", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should create a time-off request and return 201", async () => {
        vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue({
            userId: "user-123",
        } as any);
        vi.mocked(TimeOffService.createTimeOffRequest).mockResolvedValue(
            MOCK_CREATED as any
        );

        const response = await POST(makePostRequest(VALID_BODY));

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.message).toBe("Time-off request submitted successfully");
        expect(data.data.id).toBe("req-abc-123");
        expect(data.data.status).toBe("pending");

        expect(TimeOffService.createTimeOffRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: "user-123",
                type: "paid",
                startDate: "2025-07-01",
                endDate: "2025-07-05",
                reason: "Annual holiday",
            })
        );
    });

    it("should return 401 when not authenticated", async () => {
        vi.mocked(AuthUtils.authenticateRequest).mockRejectedValue(
            new UnauthorizedError()
        );

        const response = await POST(makePostRequest(VALID_BODY));
        expect(response.status).toBe(401);
    });

    it("should return 400 when body is invalid JSON", async () => {
        vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue({
            userId: "user-123",
        } as any);

        const req = new NextRequest(new URL(BASE_URL), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "not-json{{",
        });
        const response = await POST(req);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.message).toBe("Invalid JSON body");
    });

    it("should return 400 when required fields are missing", async () => {
        vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue({
            userId: "user-123",
        } as any);

        const response = await POST(makePostRequest({ leaveType: "sick" }));
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.message).toBe("Validation failed");
    });

    it("should return 400 when dates are in wrong format", async () => {
        vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue({
            userId: "user-123",
        } as any);

        const response = await POST(
            makePostRequest({ startDate: "01/07/2025", endDate: "05/07/2025" })
        );
        expect(response.status).toBe(400);
    });

    it("should return 403 when user has no organization", async () => {
        vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue({
            userId: "user-123",
        } as any);
        vi.mocked(TimeOffService.createTimeOffRequest).mockRejectedValue(
            new ForbiddenError("User is not associated with any organization")
        );

        const response = await POST(makePostRequest(VALID_BODY));
        expect(response.status).toBe(403);
    });

    it("should return 404 when employee record is not found", async () => {
        vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue({
            userId: "user-123",
        } as any);
        vi.mocked(TimeOffService.createTimeOffRequest).mockRejectedValue(
            new NotFoundError("No employee record found for this user")
        );

        const response = await POST(makePostRequest(VALID_BODY));
        expect(response.status).toBe(404);
    });

    it("should return 500 on unexpected server error", async () => {
        vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue({
            userId: "user-123",
        } as any);
        vi.mocked(TimeOffService.createTimeOffRequest).mockRejectedValue(
            new Error("DB connection lost")
        );

        const response = await POST(makePostRequest(VALID_BODY));
        expect(response.status).toBe(500);
    });

    it("should pass employeeId when provided (admin submission)", async () => {
        vi.mocked(AuthUtils.authenticateRequest).mockResolvedValue({
            userId: "admin-001",
        } as any);
        vi.mocked(TimeOffService.createTimeOffRequest).mockResolvedValue(
            MOCK_CREATED as any
        );

        const bodyWithEmployee = {
            ...VALID_BODY,
            employeeId: "emp-456",
        };

        await POST(makePostRequest(bodyWithEmployee));

        expect(TimeOffService.createTimeOffRequest).toHaveBeenCalledWith(
            expect.objectContaining({ employeeId: "emp-456" })
        );
    });
});
