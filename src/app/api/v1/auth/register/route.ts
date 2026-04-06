import { RegisterSchema } from "@/server/validations/auth.schema";
import { AuthService } from "@/server/services/auth.service";
import { ApiResponse } from "@/server/utils/api-response";
import { withHandler } from "@/server/utils/with-error-handler";

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User registration
 *     description: Register a new user with business email and name
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - businessEmail
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               businessEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Registration successful, verification email sent
 *       400:
 *         description: Bad request - Validation failed
 */
export const POST = withHandler(
  { schema: RegisterSchema },
  async (_req, { body }) => {
    const result = await AuthService.register(body);

    return ApiResponse.success(result, "Verification email sent", 201);
  }
);
