import { apiClient } from "../api-client";

export interface UserSummary {
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: string | null;
  organizationName: string | null;
}

export interface OnboardingStep {
  key: string;
  label: string;
  completed: boolean;
}

export interface OnboardingStatus {
  emailVerified: boolean;
  companyInfoProvided: boolean;
  kybVerified: boolean;
  walletFunded: boolean;
  completedSteps: number;
  totalSteps: number;
  progressPercentage: number;
  steps: OnboardingStep[];
}

export interface AttentionItems {
  contractsPendingSignature: number;
  milestonesCompleted: number;
  invoicesRequiringPayment: number;
  pendingTimesheets: number;
  pendingExpenses: number;
  pendingTimeOffRequests: number;
}

export class DashboardService {
  static async getUserSummary(): Promise<UserSummary> {
    return apiClient.get<UserSummary>("/api/v1/dashboard/user-summary");
  }

  static async getOnboardingStatus(): Promise<OnboardingStatus> {
    return apiClient.get<OnboardingStatus>("/api/v1/dashboard/onboarding");
  }

  static async getAttentionItems(): Promise<AttentionItems> {
    return apiClient.get<AttentionItems>("/api/v1/dashboard/attention");
  }
}
