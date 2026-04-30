import { apiClient } from "../api-client";

interface DepositRequest {
  amount: number;
  provider?: "monnify" | "flutterwave";
  redirectUrl?: string;
}

interface DepositResponse {
  reference: string;
  provider: string;
  checkoutUrl?: string;
  paymentUrl?: string;
  authorizationUrl?: string;
  status: string;
  amount: number;
  currency: string;
}

export class FinanceService {
  static async initializeDeposit(request: DepositRequest): Promise<DepositResponse> {
    return apiClient.post<DepositResponse>("/api/v1/finance/fiat/deposit", request);
  }
}
