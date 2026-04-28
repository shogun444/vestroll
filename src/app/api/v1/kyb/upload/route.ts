import { NextRequest } from "next/server";
import { ApiResponse } from "@/server/utils/api-response";
import { AuthUtils } from "@/server/utils/auth";
import { KybUploadService } from "@/server/services/kyb-upload.service";
import { AppError } from "@/server/utils/errors";

/**
 * @swagger
 * /kyb/upload:
 *   post:
 *     summary: Get secure upload URL for KYB documents
 *     description: Generates a presigned S3 URL to upload business documents directly to the cloud.
 *     tags: [General]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filename
 *               - contentType
 *             properties:
 *               filename:
 *                 type: string
 *               contentType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Presigned URL generated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await AuthUtils.authenticateRequest(req);
    const body = await req.json();
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return ApiResponse.error("Filename and contentType are required", 400);
    }

    const uploadData = await KybUploadService.getSignedUploadUrl(
      userId,
      filename,
      contentType
    );

    return ApiResponse.success(uploadData, "Upload URL generated successfully");
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    console.error("[KYB Upload Error]", error);
    return ApiResponse.error("Internal server error", 500);
  }
}
