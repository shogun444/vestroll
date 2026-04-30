import AppShell from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/providers/theme-provider";
import PageTransition from "@/components/shared/animations/PageTransition";
import { FeedbackWidget } from "@/components/shared/feedback-widget";
import { formatNairaFromKobo } from "@/lib/format-naira";
import { AuthUtils } from "@/server/utils/auth";
import { FinanceWalletService } from "@/server/services/finance-wallet.service";

export default async function AppScopedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let formattedBalance: string = "₦0.00";

  try {
    const user = await AuthUtils.getCurrentUser();
    if (user?.organizationId) {
      const balance = await FinanceWalletService.getOrganizationFiatBalance(user.organizationId);
      formattedBalance = formatNairaFromKobo(Number(balance));
    }
  } catch (error) {
    console.error("Failed to fetch organization balance:", error);
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AppShell balance={formattedBalance}>
        <PageTransition>{children}</PageTransition>
      </AppShell>
      <FeedbackWidget />
    </ThemeProvider>
  );
}
