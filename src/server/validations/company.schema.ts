import { z } from "zod";

export const providerPreferenceSchema = z
  .enum(["monnify", "flutterwave"])
  .describe(
    "Preferred payment provider for automated transactions. 'monnify' = standard Nigerian bank transfers; 'flutterwave' = multi-currency cards and stablecoin settlements.",
  );

const nullableTrimmedString = z
  .string()
  .trim()
  .min(1)
  .nullable()
  .optional();

export const updateCompanyProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .optional()
      .describe(
        "Display name of the organization. Must be between 1 and 255 characters. Unique at the global scope.",
      ),
    industry: nullableTrimmedString.describe(
      "The business sector the organization operates in (e.g. 'Tech', 'Finance'). Optional.",
    ),
    registrationNumber: nullableTrimmedString.describe(
      "Official government-issued business registration number or ID. Used for KYB verification.",
    ),
    providerPreference: providerPreferenceSchema.optional(),
    registered: z
      .object({
        street: nullableTrimmedString.describe("Registered business street address."),
        city: nullableTrimmedString.describe("Registered business city."),
        state: nullableTrimmedString.describe("Registered business state or province."),
        postalCode: nullableTrimmedString.describe("Registered business postal / ZIP code."),
        country: nullableTrimmedString.describe("Registered business country (ISO-3166-1 alpha-2)."),
      })
      .optional()
      .describe(
        "The legal registered address for this organization. Used for tax and compliance purposes.",
      ),
    billing: z
      .object({
        street: nullableTrimmedString.describe("Primary billing street address."),
        city: nullableTrimmedString.describe("Primary billing city."),
        state: nullableTrimmedString.describe("Primary billing state or province."),
        postalCode: nullableTrimmedString.describe("Primary billing postal / ZIP code."),
        country: nullableTrimmedString.describe("Primary billing country (ISO-3166-1 alpha-2)."),
      })
      .optional()
      .describe(
        "The primary billing address for invoices and payment processing. Can be different from the registered address.",
      ),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  })
  .describe(
    "Request body for updating organization-level profile settings. Supports partial updates for name, contact details, and address configurations.",
  );

export type UpdateCompanyProfileInput = z.infer<typeof updateCompanyProfileSchema>;