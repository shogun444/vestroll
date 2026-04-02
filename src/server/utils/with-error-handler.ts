import { NextRequest, NextResponse } from "next/server";
import { AppError, ValidationError } from "./errors";
import { ApiResponse } from "./api-response";
import { AuthUtils } from "./auth";
import { Logger } from "../services/logger.service";
import crypto from "crypto";
import { z } from "zod";

export interface RequestMetadata {
  ipAddress?: string;
  userAgent?: string;
}

export interface HandlerContext<T = any> {
  params: Promise<any>;
  body: T;
  metadata: RequestMetadata;
}

/**
 * Wraps a Next.js route handler with standard RFC 7807 error handling,
 * optional Zod validation, and automatic metadata extraction.
 *
 * @param options - Configuration for the handler.
 * @param options.schema - Optional Zod schema to validate the request body.
 * @param handler - The actual logic for the route.
 */
export function withHandler<T = any>(
  options: { schema?: z.ZodSchema<T> } | ((req: NextRequest, ctx: any) => Promise<NextResponse>),
  handler?: (req: NextRequest, ctx: HandlerContext<T>) => Promise<NextResponse>
) {
  // Overload: withHandler(async (req, ctx) => ...)
  if (typeof options === "function") {
    return withHandler({}, options);
  }

  const { schema } = options;

  return async (req: NextRequest, ctx: any): Promise<NextResponse> => {
    try {
      const instance = req?.nextUrl?.pathname ?? "unknown";
      const metadata: RequestMetadata = {
        ipAddress: AuthUtils.getClientIp(req),
        userAgent: AuthUtils.getUserAgent(req),
      };

      let body: T = {} as T;
      if (schema) {
        try {
          const rawBody = await req.json();
          const validated = schema.safeParse(rawBody);
          if (!validated.success) {
            throw new ValidationError(
              "Invalid request body",
              validated.error.flatten().fieldErrors as any
            );
          }
          body = validated.data;
        } catch (e) {
          if (e instanceof ValidationError) throw e;
          if (e instanceof SyntaxError) {
             throw new ValidationError("Invalid JSON in request body");
          }
          throw new ValidationError("Failed to parse request body");
        }
      }

      const responseId = crypto.randomUUID();

      const response = await handler!(req, { ...ctx, body, metadata });
      response.headers.set("X-Response-Id", responseId);
      return response;
    } catch (error) {
      const instance = req?.nextUrl?.pathname ?? "unknown";

      if (error instanceof AppError) {
        return ApiResponse.problemDetails(
          error.toProblemDetails(instance)
        ) as NextResponse;
      }

      const responseId = crypto.randomUUID();
      Logger.error(`[Unhandled Error] ${instance}`, { error, responseId });
      
      const response = ApiResponse.error(
        "An unexpected error occurred. Please try again later.",
        500,
        null,
        req
      ) as NextResponse;

      response.headers.set("X-Response-Id", responseId);
      return response;
    }
  };
}

/**
 * @deprecated Use withHandler instead for enhanced functionality.
 */
export const withErrorHandler = withHandler;
