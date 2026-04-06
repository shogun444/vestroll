import { db, organizationWallets } from "@/server/db";
import { eq } from "drizzle-orm";
import { BadRequestError } from "@/server/utils/errors";

const VIRTUAL_BANK_NAMES = [
  "Providus Bank",
  "Wema Bank",
  "Moniepoint MFB",
  "Safe Haven MFB",
];

function formatWalletResponse(wallet?: typeof organizationWallets.$inferSelect) {
  return {
    walletId: wallet?.id ?? null,
    organizationId: wallet?.organizationId ?? null,
    virtualAccountNumber: wallet?.virtualAccountNumber ?? null,
    virtualBankName: wallet?.virtualBankName ?? null,
    hasVirtualAccount: !!(
      wallet?.virtualAccountNumber && wallet?.virtualBankName
    ),
  };
}

function generateVirtualBankName(organizationId: string) {
  let seed = 0;

  for (const char of organizationId) {
    seed += char.charCodeAt(0);
  }

  return VIRTUAL_BANK_NAMES[seed % VIRTUAL_BANK_NAMES.length];
}

function generateVirtualAccountNumber() {
  const timeSeed = Date.now().toString().slice(-8);
  const randomSeed = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");

  return `${timeSeed}${randomSeed}`;
}

/**
 * Mock conversion rates. In a real application, these would be fetched
 * from an oracle or real-time exchange API (e.g. Stellar SDEX or Binance).
 */
const MOCK_XLM_TO_NGN_RATE = 1500.50;

export class FinanceWalletService {
  /**
   * Converts an amount of XLM to NGN (Kobo representation).
   * @param xlmAmount - Amount in XLM (whole numbers + decimals).
   * @returns Amount in Kobo (NGN * 100).
   */
  static convertXlmToNgn(xlmAmount: number): bigint {
    const ngnValue = xlmAmount * MOCK_XLM_TO_NGN_RATE;
    return BigInt(Math.round(ngnValue * 100)); // Return in kobo
  }

  /**
   * Converts an amount of NGN (Kobo) to XLM.
   * @param ngnKoboAmount - Amount in Kobo (NGN * 100).
   * @returns Amount in XLM (float).
   */
  static convertNgnToXlm(ngnKoboAmount: bigint): number {
    const ngnValue = Number(ngnKoboAmount) / 100;
    return ngnValue / MOCK_XLM_TO_NGN_RATE;
  }

  static async getOrganizationWallet(organizationId: string) {
    if (!organizationId) {
      throw new BadRequestError("User is not associated with any organization");
    }

    const [wallet] = await db
      .select()
      .from(organizationWallets)
      .where(eq(organizationWallets.organizationId, organizationId));

    return formatWalletResponse(wallet);
  }

  static async ensureVirtualAccount(organizationId: string) {
    if (!organizationId) {
      throw new BadRequestError("User is not associated with any organization");
    }

    const [existingWallet] = await db
      .select()
      .from(organizationWallets)
      .where(eq(organizationWallets.organizationId, organizationId));

    if (
      existingWallet?.virtualAccountNumber &&
      existingWallet?.virtualBankName
    ) {
      return formatWalletResponse(existingWallet);
    }

    const walletPayload = {
      organizationId,
      walletAddress: existingWallet?.walletAddress ?? null,
      funded: existingWallet?.funded ?? false,
      fundedAt: existingWallet?.fundedAt ?? null,
      virtualAccountNumber: generateVirtualAccountNumber(),
      virtualBankName: generateVirtualBankName(organizationId),
      updatedAt: new Date(),
    };

    const [wallet] = existingWallet
      ? await db
          .update(organizationWallets)
          .set(walletPayload)
          .where(eq(organizationWallets.organizationId, organizationId))
          .returning()
      : await db
          .insert(organizationWallets)
          .values(walletPayload)
          .returning();

    return formatWalletResponse(wallet);
  }
}
