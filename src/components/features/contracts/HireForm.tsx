import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";

export default function HiringForm() {
  const [hireType, setHireType] = useState("freelancer");
  const [projectSize, setProjectSize] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [scopeOfWork, setScopeOfWork] = useState("");
  const [paymentPreference, setPaymentPreference] = useState<"crypto" | "fiat">("crypto");
  
  // Bank details state
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isValidatingBank, setIsValidatingBank] = useState(false);
  const [bankError, setBankError] = useState("");

  const handleAccountVerification = useCallback(async (accountNum: string) => {
    if (accountNum.length !== 10) {
      setBankError("Account number must be 10 digits");
      setAccountName("");
      return;
    }
    
    if (!bankName) {
      setBankError("Please select a bank first");
      setAccountName("");
      return;
    }

    setIsValidatingBank(true);
    setBankError("");
    setAccountName("");

    try {
      // Real implementation would call /api/v1/team/employees/bank-verification
      // const res = await fetch("/api/v1/team/employees/bank-verification", { method: "POST", ...});
      // const data = await res.json();
      
      // Simulating network request
      await new Promise(resolve => setTimeout(resolve, 800));
      setAccountName("John Doe Verified");
    } catch (err) {
      setBankError("Failed to verify account");
    } finally {
      setIsValidatingBank(false);
    }
  }, [bankName]);

  return (
    <div className="">
      {/* Hire type */}
      <div className="mb-9">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Hire type
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setHireType("freelancer")}
            className={`px-4 h-8 rounded-4xl text-sm font-medium transition-all ${
              hireType === "freelancer"
                ? "bg-purple-100 text-purple-700 border border-purple-300"
                : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
            }`}
          >
            Freelancer
          </button>
          <button
            onClick={() => setHireType("contractor")}
            className={`px-4 h-8 rounded-4xl text-sm font-medium transition-all ${
              hireType === "contractor"
                ? "bg-purple-100 text-purple-700 border border-purple-300"
                : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
            }`}
          >
            Contractor
          </button>
        </div>
      </div>

      {/* Project size and Job role */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Title
          </label>
          <input
            type="text"
            placeholder="Placeholder"
            value={projectSize}
            onChange={(e) => setProjectSize(e.target.value)}
            className="w-full p-3 h-12 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job role
          </label>
          <div className="relative">
            <select
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              className="w-full h-12 p-3 px border border-gray-300 rounded-md text-sm text-gray-400 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="">Select--</option>
              <option value="developer">Developer</option>
              <option value="designer">Designer</option>
              <option value="manager">Manager</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Scope of work */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Scope of work
          </label>
          <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            Select
          </button>
        </div>
        <textarea
          placeholder="Select--"
          value={scopeOfWork}
          onChange={(e) => setScopeOfWork(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 text-gray-400 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Payment Preference */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Payment Preference
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setPaymentPreference("crypto")}
            className={`px-4 h-8 rounded-4xl text-sm font-medium transition-all ${
              paymentPreference === "crypto"
                ? "bg-purple-100 text-purple-700 border border-purple-300"
                : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
            }`}
          >
            Crypto (USDC/XLM)
          </button>
          <button
            onClick={() => setPaymentPreference("fiat")}
            className={`px-4 h-8 rounded-4xl text-sm font-medium transition-all ${
              paymentPreference === "fiat"
                ? "bg-purple-100 text-purple-700 border border-purple-300"
                : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
            }`}
          >
            Fiat (NGN Transfer)
          </button>
        </div>
      </div>

      {/* Fiat Bank Details */}
      {paymentPreference === "fiat" && (
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-5 mb-6">
          <h3 className="text-sm font-medium text-gray-800 mb-4">Bank Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Bank Name</label>
              <select
                value={bankName}
                onChange={(e) => {
                  setBankName(e.target.value);
                  if (accountNumber.length === 10) handleAccountVerification(accountNumber);
                }}
                className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Bank</option>
                <option value="044">Access Bank</option>
                <option value="011">First Bank</option>
                <option value="058">GTBank</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Account Number (10 digits)</label>
              <input
                type="text"
                maxLength={10}
                placeholder="0123456789"
                value={accountNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setAccountNumber(val);
                  if (val.length === 10) handleAccountVerification(val);
                }}
                className={`w-full h-11 px-3 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                  bankError ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"
                }`}
              />
              {bankError && <p className="text-xs text-red-500 mt-1">{bankError}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-2">Account Name</label>
              <div className="relative w-full h-11 px-3 border border-gray-200 bg-gray-100 rounded-md text-sm flex items-center">
                {isValidatingBank ? (
                  <div className="flex items-center text-gray-500">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Fetching Name...
                  </div>
                ) : accountName ? (
                  <span className="text-green-700 font-medium">{accountName}</span>
                ) : (
                  <span className="text-gray-400 italic">Enter account number to verify</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
