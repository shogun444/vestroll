"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardService, AttentionItems } from "@/lib/api/dashboard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function RequiringAttention() {
  const [data, setData] = useState<AttentionItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    DashboardService.getAttentionItems()
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const attentions = data
    ? [
        { name: "Contracts", attentions: data.contractsPendingSignature },
        { name: "Milestone", attentions: data.milestonesCompleted },
        { name: "Invoices", attentions: data.invoicesRequiringPayment },
        { name: "Time off", attentions: data.pendingTimeOffRequests },
        { name: "Time tracking", attentions: data.pendingTimesheets },
        { name: "Expense", attentions: data.pendingExpenses },
      ]
    : Array(6).fill({ name: "", attentions: 0 });

  return (
    <section className="sm:p-4 py-0 px-4 rounded-lg flex gap-2 sm:gap-4 flex-col sm:bg-white flex-1 dark:sm:bg-gray-900">
      <p className="text-base font-medium text-text-header leading-[120%] dark:text-gray-100">
        Requiring attention
      </p>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 gap-2"
      >
        {attentions.map((atn, index) => (
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="rounded-lg p-4 bg-white sm:border-[#DCE0E5] sm:border flex items-center justify-between shadow-sm hover:shadow-md transition-shadow dark:bg-gray-900 dark:border-gray-800"
            key={index}
          >
            {isLoading ? (
              <div className="w-full h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ) : (
              <>
                <p className="text-sm text-text-subtext font-medium dark:text-gray-400">
                  {atn.name}
                </p>
                <span
                  className={`${atn.attentions > 0 ? "text-primary-500" : "text-text-header dark:text-gray-200"} size-8 rounded-full flex items-center justify-center bg-[#F3EBF9] dark:bg-gray-800 font-medium`}
                >
                  {atn.attentions}
                </span>
              </>
            )}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default RequiringAttention;
