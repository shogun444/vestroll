"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { RegistrationFormData } from "../RegistrationWizard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Step1Props {
  formData: RegistrationFormData;
  updateFormData: (data: Partial<RegistrationFormData>) => void;
  onNext: () => void;
  isLoading?: boolean;
}

export default function Step1BasicInfo({
  formData,
  updateFormData,
  onNext,
  isLoading,
}: Step1Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.businessEmail.trim()) {
      newErrors.businessEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.businessEmail)) {
      newErrors.businessEmail = "Invalid email address";
    }
    if (!formData.agreement) newErrors.agreement = "You must accept the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    updateFormData({ [name]: type === "checkbox" ? checked : value });
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="mb-8">
        <h2 className="text-gray-900 text-3xl md:text-[2.5rem] font-bold mb-2 tracking-[-2%]">
          Welcome to VestRoll!
        </h2>
        <p className="text-gray-600 text-sm md:text-base">
          Let's get to know you! Provide the details below to continue
        </p>
      </div>

      <div>
        <label className="block text-gray-900 text-xs font-medium mb-2">
          First Name
        </label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="Enter your first name"
          className={`w-full px-4 py-3.5 bg-gray-50 text-gray-900 rounded-lg border ${
            errors.firstName ? "border-red-300" : "border-gray-200"
          } focus:outline-none focus:ring-2 focus:ring-[#5E2A8C] transition-all`}
        />
        {errors.firstName && (
          <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
        )}
      </div>

      <div>
        <label className="block text-gray-900 text-xs font-medium mb-2">
          Last Name
        </label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Enter your last name"
          className={`w-full px-4 py-3.5 bg-gray-50 text-gray-900 rounded-lg border ${
            errors.lastName ? "border-red-300" : "border-gray-200"
          } focus:outline-none focus:ring-2 focus:ring-[#5E2A8C] transition-all`}
        />
        {errors.lastName && (
          <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
        )}
      </div>

      <div>
        <label className="block text-gray-900 text-xs font-medium mb-2">
          Business Email
        </label>
        <input
          type="email"
          name="businessEmail"
          value={formData.businessEmail}
          onChange={handleChange}
          placeholder="Enter your business email"
          className={`w-full px-4 py-3.5 bg-gray-50 text-gray-900 rounded-lg border ${
            errors.businessEmail ? "border-red-300" : "border-gray-200"
          } focus:outline-none focus:ring-2 focus:ring-[#5E2A8C] transition-all`}
        />
        {errors.businessEmail && (
          <p className="mt-1 text-xs text-red-600">{errors.businessEmail}</p>
        )}
      </div>

      <div className="flex items-start gap-2 mt-4">
        <div className="relative mt-1">
          <input
            id="agreement"
            name="agreement"
            type="checkbox"
            checked={formData.agreement}
            onChange={handleChange}
            className="w-5 h-5 border rounded appearance-none cursor-pointer border-[#5E2A8C] checked:bg-[#5E2A8C]"
          />
          <Check
            size={14}
            className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
          />
          {formData.agreement && (
            <Check
              size={14}
              className="absolute inset-0 m-auto text-white pointer-events-none"
            />
          )}
        </div>
        <label
          htmlFor="agreement"
          className="text-xs text-gray-600 leading-tight"
        >
          By creating an account, I agree to our{" "}
          <Link href="/terms" className="text-[#5E2A8C] font-semibold">
            Terms of Service and Privacy Policy
          </Link>{" "}
          and confirm that I am 18 years and older
        </label>
      </div>
      {errors.agreement && (
        <p className="text-xs text-red-600">{errors.agreement}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 mt-4 bg-[#5E2A8C] text-white rounded-xl font-semibold hover:bg-[#4E2275] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" className="border-white/30 border-t-white" />
            Processing...
          </div>
        ) : (
          "Continue"
        )}
      </button>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Already own a VestRoll account?{" "}
          <Link href="/login" className="text-[#5E2A8C] font-bold">
            Login
          </Link>
        </p>
      </div>
    </form>
  );
}
