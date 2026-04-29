"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { RegistrationFormData } from "../RegistrationWizard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Step5Props {
  formData: RegistrationFormData;
  updateFormData: (data: Partial<RegistrationFormData>) => void;
  onBack: () => void;
  onComplete: () => void;
  isLoading?: boolean;
}

const Dropdown: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ label, value, onChange, options, placeholder, isOpen, onToggle }) => (
  <div className="relative">
    <label className="block mb-2 text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`w-full px-4 py-3 text-left bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5E2A8C] transition-all ${
          value ? "text-gray-900" : "text-gray-500"
        }`}
      >
        {value || placeholder}
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg max-h-60">
          {options.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onChange(opt);
                onToggle();
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-gray-900"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default function Step5BusinessDetails({
  formData,
  updateFormData,
  onBack,
  onComplete,
  isLoading,
}: Step5Props) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Germany",
    "France",
    "Australia",
    "Japan",
    "Singapore",
    "Netherlands",
    "Nigeria",
    "South Africa",
    "Other",
  ];
  const industries = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Retail",
    "Manufacturing",
    "Real Estate",
    "Media & Entertainment",
    "Other",
  ];
  const companySizes = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1000+ employees",
  ];

  const handleInputChange = (
    field: keyof RegistrationFormData,
    value: string,
  ) => {
    updateFormData({ [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  const isFormValid =
    formData.companyName &&
    formData.companySize &&
    formData.companyIndustry &&
    formData.headquarterCountry &&
    formData.businessDescription;

  return (
    <div className="w-full space-y-6">
      <div className="mb-8">
        <h2 className="text-gray-900 text-3xl md:text-[2.5rem] font-bold mb-2 tracking-[-2%]">
          Add business details
        </h2>
        <p className="text-gray-600 text-base">Tell us about your business</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Company name
          </label>
          <input
            type="text"
            value={formData.companyName || ""}
            onChange={(e) => handleInputChange("companyName", e.target.value)}
            placeholder="Name of your company"
            className="w-full px-4 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5E2A8C]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Dropdown
            label="Company size"
            value={formData.companySize || ""}
            onChange={(val) => handleInputChange("companySize", val)}
            options={companySizes}
            placeholder="Select"
            isOpen={openDropdown === "size"}
            onToggle={() =>
              setOpenDropdown(openDropdown === "size" ? null : "size")
            }
          />
          <Dropdown
            label="Industry"
            value={formData.companyIndustry || ""}
            onChange={(val) => handleInputChange("companyIndustry", val)}
            options={industries}
            placeholder="Select"
            isOpen={openDropdown === "industry"}
            onToggle={() =>
              setOpenDropdown(openDropdown === "industry" ? null : "industry")
            }
          />
        </div>

        <Dropdown
          label="Headquarter country"
          value={formData.headquarterCountry || ""}
          onChange={(val) => handleInputChange("headquarterCountry", val)}
          options={countries}
          placeholder="Where is your headquarter located?"
          isOpen={openDropdown === "country"}
          onToggle={() =>
            setOpenDropdown(openDropdown === "country" ? null : "country")
          }
        />

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Business description
          </label>
          <textarea
            value={formData.businessDescription || ""}
            onChange={(e) =>
              handleInputChange("businessDescription", e.target.value)
            }
            placeholder="Describe what your company does"
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5E2A8C] resize-none"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="w-1/3 py-4 rounded-xl font-semibold text-[#5E2A8C] border-2 border-[#5E2A8C] hover:bg-gray-50 transition-all"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="flex-1 py-4 bg-[#5E2A8C] text-white rounded-xl font-semibold hover:bg-[#4E2275] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" className="border-white/30 border-t-white" />
                Processing...
              </div>
            ) : (
              "Complete Registration"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
