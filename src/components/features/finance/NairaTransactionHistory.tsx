"use client";

import React, { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Clock, Loader2 } from "lucide-react";

interface FiatTransaction {
  id: string;
  type: "deposit" | "withdrawal" | "payout";
  amount: number; // kobo
  status: "pending" | "completed" | "failed";
  provider: string;
  providerReference: string;
  createdAt: string;
}

const MOCK_FIAT_TXS: FiatTransaction[] = [
  { id: "ft-1", type: "deposit", amount: 500_000_00, status: "completed", provider: "monnify", providerReference: "MFY_20251001_001", createdAt: "2025-10-25T14:00:00Z" },
  { id: "ft-2", type: "payout", amount: 120_000_00, status: "completed", provider: "monnify", providerReference: "MFY_20251002_002", createdAt: "2025-10-24T09:00:00Z" },
  { id: "ft-3", type: "deposit", amount: 1_000_000_00, status: "pending", provider: "flutterwave", providerReference: "FLW_20251003_003", createdAt: "2025-10-23T11:30:00Z" },
  { id: "ft-4", type: "withdrawal", amount: 250_000_00, status: "failed", provider: "monnify", providerReference: "MFY_20251004_004", createdAt: "2025-10-22T16:45:00Z" },
  { id: "ft-5", type: "payout", amount: 80_000_00, status: "completed", provider: "flutterwave", providerReference: "FLW_20251005_005", createdAt: "2025-10-21T10:00:00Z" },
  { id: "ft-6", type: "deposit", amount: 2_500_000_00, status: "completed", provider: "monnify", providerReference: "MFY_20251006_006", createdAt: "2025-10-20T08:15:00Z" },
];

function formatNgn(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function statusBadge(status: FiatTransaction["status"]) {
  const map = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    failed: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${map[status]}`}>
      {status}
    </span>
  );
}

function typeIcon(type: FiatTransaction["type"]) {
  if (type === "deposit") return <ArrowDownLeft className="h-4 w-4 text-emerald-600" />;
  if (type === "payout") return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
  return <ArrowUpRight className="h-4 w-4 text-orange-600" />;
}

export default function NairaTransactionHistory() {
  const [transactions, setTransactions] = useState<FiatTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In production this would be a fetch to /api/v1/finance/ngn/transactions
    const timer = setTimeout(() => {
      setTransactions(MOCK_FIAT_TXS);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400 mr-2" />
        <span className="text-sm text-gray-500">Loading transactions…</span>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16">
        <Clock className="mx-auto h-8 w-8 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">No Naira transactions yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-medium uppercase tracking-wider text-gray-500">
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Provider</th>
            <th className="px-4 py-3">Reference</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {typeIcon(tx.type)}
                  <span className="capitalize font-medium text-gray-800">{tx.type}</span>
                </div>
              </td>
              <td className="px-4 py-3 font-semibold text-gray-900">{formatNgn(tx.amount)}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 capitalize">
                  {tx.provider}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-500">{tx.providerReference}</td>
              <td className="px-4 py-3">{statusBadge(tx.status)}</td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {new Date(tx.createdAt).toLocaleDateString("en-NG", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
