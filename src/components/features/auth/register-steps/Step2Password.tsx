"use client";

import React, { useState, useMemo } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Step2Props {
  onNext: (password: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const RequirementItem: React.FC<{ met: boolean; text: string }> = ({
  met,
  text,
}) => (
  <div className="flex items-center gap-3">
    <div
      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${met ? "bg-primary-500" : "bg-white border-2 border-gray-200"}`}
    >
      {met && <Check size={14} className="text-white" />}
    </div>
    <span className={`text-sm ${met ? "text-gray-900" : "text-gray-600"}`}>
      {text}
    </span>
  </div>
);

export default function Step2Password({
  onNext,
  onBack,
  isLoading,
}: Step2Props) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const requirements = useMemo(
    () => ({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*]/.test(password),
    }),
    [password],
  );

  const canSubmit =
    Object.values(requirements).every(Boolean) &&
    password === confirmPassword &&
    confirmPassword.length > 0;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-gray-900 text-3xl md:text-[2.5rem] font-bold mb-2 tracking-[-2%]">
          Add a password
        </h2>
        <p className="text-gray-600 text-base">
          Create a secure password to access your VestRoll account
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-900 mb-2">
            New password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E2A8C]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-900 mb-2">
            Confirm password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E2A8C]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <RequirementItem
            met={requirements.minLength}
            text="Minimum of 8 characters"
          />
          <RequirementItem
            met={requirements.hasUppercase}
            text="At least one uppercase letter (A-Z)"
          />
          <RequirementItem
            met={requirements.hasNumber}
            text="At least one number (0-9)"
          />
          <RequirementItem
            met={requirements.hasSpecial}
            text="At least one special character (!@#$%^&*)"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={onBack}
            className="w-1/3 py-4 rounded-xl font-semibold text-[#5E2A8C] border-2 border-[#5E2A8C] hover:bg-gray-50 transition-all"
          >
            Back
          </button>
          <button
            onClick={() => onNext(password)}
            disabled={!canSubmit || isLoading}
            className="flex-1 py-4 bg-[#5E2A8C] text-white rounded-xl font-semibold hover:bg-[#4E2275] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" className="border-white/30 border-t-white" />
                Processing...
              </div>
            ) : (
              "Create password"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
