"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthLayer from "@/components/features/auth/AuthLayer";
import OTPVerification from "@/components/shared/otpVerificationModal";

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "User";

  const handleVerify = async (otp: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const isValid = otp === "123456";
    if (isValid) {
      router.push("/dashboard");
    }
    return isValid;
  };

  const handleResend = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Verification code resent!");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <OTPVerification
      email={email}
      onVerify={handleVerify}
      onResend={handleResend}
      onGoBack={handleGoBack}
      resendCooldown={60}
    />
  );
}

function VerifyOTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}

export default VerifyOTPPage;
