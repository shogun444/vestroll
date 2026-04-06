import { z } from "zod";

const base64UrlRegex = /^[A-Za-z0-9_-]+$/;

const base64UrlString = (fieldName: string) =>
  z
    .string()
    .min(1, `${fieldName} is required`)
    .regex(base64UrlRegex, `${fieldName} must be a valid base64url string`);

export const RegisterSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .describe("User's first (given) name. Must be at least 2 characters."),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .describe("User's last (family) name. Must be at least 2 characters."),
    businessEmail: z
      .string()
      .email("Invalid email format")
      .describe(
        "User's business email address. Used as the primary login identifier and for transactional email (OTP, notifications).",
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .describe(
        "Account password chosen by the user. Must be at least 8 characters. Stored as a bcrypt hash — never in plaintext.",
      ),
    agreement: z
      .boolean()
      .refine((val) => val === true, "You must agree to the terms")
      .describe(
        "Indicates the user has read and accepted the Terms of Service and Privacy Policy. Must be true to complete registration; false or omitted values will fail validation.",
      ),
    accountType: z
      .string()
      .optional()
      .describe(
        "Describes the type of account being created (e.g. 'employer', 'contractor'). Optional at registration; can be set later during onboarding.",
      ),
    companyName: z
      .string()
      .optional()
      .describe(
        "Legal name of the company the user is registering on behalf of. Optional at signup; used to pre-populate company profile.",
      ),
    companySize: z
      .string()
      .optional()
      .describe(
        "Approximate headcount range of the company (e.g. '1-10', '11-50', '51-200'). Optional; used for onboarding segmentation.",
      ),
    companyIndustry: z
      .string()
      .optional()
      .describe(
        "Industry sector the company operates in (e.g. 'Technology', 'Finance'). Optional; used for analytics and onboarding flows.",
      ),
    headquarterCountry: z
      .string()
      .optional()
      .describe(
        "ISO 3166-1 alpha-2 country code where the company is headquartered (e.g. 'US', 'GB'). Optional; influences default currency and compliance rules.",
      ),
    businessDescription: z
      .string()
      .optional()
      .describe(
        "Short description of what the company does. Optional; displayed on the company profile page.",
      ),
  })
  .describe(
    "Registration payload for creating a new employer/admin account. The agreement field must be explicitly true. Company-related fields are optional at signup.",
  );

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const ResendOTPSchema = z
  .object({
    email: z
      .preprocess(
        (val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
        z.string().email("Invalid email format"),
      )
      .describe(
        "Email address to which the OTP will be re-sent. Automatically trimmed and lower-cased before validation.",
      ),
  })
  .describe(
    "Request body for re-sending an email verification OTP to the supplied address.",
  );

export type ResendOTPInput = z.infer<typeof ResendOTPSchema>;

export const GoogleOAuthSchema = z
  .object({
    idToken: z
      .string()
      .min(1, "ID token is required")
      .describe(
        "Google-issued JWT ID token obtained from the Google Sign-In flow on the client. The server exchanges this token with Google's tokeninfo endpoint to verify identity.",
      ),
  })
  .describe(
    "Payload for authenticating or registering via Google OAuth. The client must supply the raw ID token returned by Google Sign-In.",
  );

export type GoogleOAuthInput = z.infer<typeof GoogleOAuthSchema>;

export const AppleOAuthSchema = z
  .object({
    idToken: z
      .string()
      .min(1, "ID token is required")
      .describe(
        "Apple-issued JWT identity token from Sign in with Apple. Verified server-side against Apple's public keys.",
      ),
    user: z
      .object({
        name: z
          .object({
            firstName: z
              .string()
              .optional()
              .describe(
                "User's first name as returned by Apple. Only present on the very first Sign in with Apple authorisation — subsequent logins will not include it.",
              ),
            lastName: z
              .string()
              .optional()
              .describe(
                "User's last name as returned by Apple. Only present on the very first Sign in with Apple authorisation — subsequent logins will not include it.",
              ),
          })
          .optional()
          .describe("Name object returned by Apple on the initial auth only."),
        email: z
          .string()
          .optional()
          .describe(
            "User's email as returned by Apple. May be a real address or an Apple-generated relay address (e.g. abc@privaterelay.appleid.com). Only present on first authorisation.",
          ),
      })
      .optional()
      .describe(
        "Additional user info returned by Apple on the first Sign in with Apple. Will be absent on subsequent logins.",
      ),
  })
  .describe(
    "Payload for authenticating or registering via Apple Sign In. The idToken is always required; the user object is only provided by Apple on the initial authorisation.",
  );

export type AppleOAuthInput = z.infer<typeof AppleOAuthSchema>;

export const VerifyEmailSchema = z
  .object({
    email: z
      .string()
      .transform((email) => email.toLowerCase().trim())
      .pipe(z.string().email("Invalid email format"))
      .describe(
        "Email address to verify. Automatically lower-cased and trimmed. Must match the address that received the OTP.",
      ),
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only digits")
      .describe(
        "6-digit numeric one-time password sent to the user's email address. Expires after a short TTL (typically 10 minutes).",
      ),
  })
  .describe(
    "Verifies a user's email address by checking the supplied OTP against the one stored for that address.",
  );

export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;

export const ForgotPasswordSchema = z
  .object({
    email: z
      .string()
      .transform((email) => email.toLowerCase().trim())
      .pipe(z.string().email("Invalid email format"))
      .describe(
        "Email address associated with the account. A password-reset link will be sent here if the address is registered. Automatically lower-cased and trimmed.",
      ),
  })
  .describe(
    "Initiates the forgot-password flow by sending a password-reset email to the supplied address.",
  );

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    token: z
      .string()
      .min(1, "Reset token is required")
      .describe(
        "Password-reset token delivered via email link. Single-use and time-limited (typically 1 hour). Invalidated after successful use.",
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      )
      .describe(
        "New password to set. Must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one digit.",
      ),
  })
  .describe(
    "Resets an account password using the token from the forgot-password email and the desired new password.",
  );

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required")
      .describe(
        "The user's current (existing) password. Used to re-authenticate before allowing the password change.",
      ),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .describe(
        "The new password to replace the current one. Must be at least 8 characters.",
      ),
    confirmPassword: z
      .string()
      .min(1, "Confirm password is required")
      .describe("Must match the new password exactly."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .describe(
    "Changes the password for an authenticated user. Requires the existing password as confirmation and a matching new password pair.",
  );

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export const PasskeyRegistrationSchema = z
  .object({
    challenge: base64UrlString("Challenge")
      .max(1024, "Challenge must be at most 1024 characters")
      .describe(
        "Base64url-encoded WebAuthn challenge issued by the server. Prevents replay attacks — each challenge is single-use and time-limited.",
      ),
    credentialId: base64UrlString("Credential ID")
      .max(1024, "Credential ID must be at most 1024 characters")
      .describe(
        "Base64url-encoded unique identifier of the newly created WebAuthn credential, as returned by the authenticator.",
      ),
    attestationObject: base64UrlString("Attestation object")
      .max(20000, "Attestation object must be at most 20000 characters")
      .describe(
        "Base64url-encoded CBOR-serialized attestation object from the authenticator. Contains the authenticator data and attestation statement used to verify the credential.",
      ),
    clientDataJSON: base64UrlString("Client data JSON")
      .max(5000, "Client data JSON must be at most 5000 characters")
      .describe(
        "Base64url-encoded JSON object collected by the browser (origin, challenge, type). Used server-side to confirm the request originated from the correct relying party.",
      ),
  })
  .strict()
  .describe(
    "WebAuthn passkey registration payload. All four fields are required and must be base64url-encoded strings returned by the browser's navigator.credentials.create() call.",
  );

export type PasskeyRegistrationInput = z.infer<typeof PasskeyRegistrationSchema>;
