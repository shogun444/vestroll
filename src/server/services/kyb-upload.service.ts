import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { AppError } from "../utils/errors";
import { KYB_FILE_CONSTRAINTS } from "../validations/kyb.schema";

const S3_CONFIG = {
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
};

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "vestroll-assets";
const SIGNED_URL_EXPIRY = 300; // 5 minutes

export interface SignedUploadUrl {
  signedUrl: string;
  key: string;
  expiresAt: Date;
}

export class KybUploadService {
  private static s3Client: S3Client | null = null;

  private static getS3Client(): S3Client {
    if (!this.s3Client) {
      if (!S3_CONFIG.credentials.accessKeyId || !S3_CONFIG.credentials.secretAccessKey) {
        throw new AppError(
          "AWS S3 credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.",
          500,
        );
      }
      this.s3Client = new S3Client(S3_CONFIG);
    }
    return this.s3Client;
  }

  static async getSignedUploadUrl(
    userId: string,
    filename: string,
    contentType: string,
  ): Promise<SignedUploadUrl> {
    // Validate content type
    if (!KYB_FILE_CONSTRAINTS.allowedMimeTypes.includes(contentType as any)) {
      throw new AppError(
        `Invalid content type. Allowed: ${KYB_FILE_CONSTRAINTS.allowedMimeTypes.join(", ")}`,
        400,
      );
    }

    const extension = filename.split(".").pop()?.toLowerCase();
    if (!extension) {
      throw new AppError("File must have an extension", 400);
    }

    // Generate unique key: kyb/{userId}/{uuid}.{ext}
    const uniqueId = crypto.randomUUID();
    const key = `kyb/${userId}/${uniqueId}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(this.getS3Client(), command, {
      expiresIn: SIGNED_URL_EXPIRY,
    });

    const expiresAt = new Date(Date.now() + SIGNED_URL_EXPIRY * 1000);

    return {
      signedUrl,
      key,
      expiresAt,
    };
  }

  static getPublicUrl(key: string): string {
    const cdnUrl = process.env.CDN_URL;
    if (cdnUrl) {
      return `${cdnUrl}/${key}`;
    }
    return `https://${BUCKET_NAME}.s3.${S3_CONFIG.region}.amazonaws.com/${key}`;
  }

  static async deleteFromS3(key: string): Promise<void> {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });
      await this.getS3Client().send(command);
    } catch (error) {
      console.error(`Failed to delete S3 object: ${key}`, error);
    }
  }
}
