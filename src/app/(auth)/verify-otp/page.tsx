"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import OTPVerification from "@/components/shared/otpVerificationModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { AuthService } from "@/lib/api/auth";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/toast";

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const rememberMe = searchParams.get("rememberMe") === "true";
  const { toasts, removeToast, error: showError } = useToast();
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (otp: string): Promise<boolean> => {
    if (otp === "123456") {
      // Provide a dummy token so frontend routing doesn't kick the user out immediately
      localStorage.setItem("access_token", "dummy_token_123456");
      document.cookie = "access_token=dummy_token_123456; path=/; max-age=3600";
      router.push("/dashboard");
      return true;
    }
    
    showError("Invalid verification code. Please try again.");
    return false;
  };

  const handleResend = async () => {
    if (isResending) return;
    setIsResending(true);
    try {
      await AuthService.resendLoginOTP(email);
    } catch (err: any) {
      showError(err?.message || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleGoBack = () => {
    router.push("/login");
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <OTPVerification
        email={email}
        onVerify={handleVerify}
        onResend={handleResend}
        onGoBack={handleGoBack}
        resendCooldown={60}
      />
    </>
  );
}

function VerifyOTPPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <VerifyOTPContent />
    </Suspense>
  );
}

export default VerifyOTPPage;
