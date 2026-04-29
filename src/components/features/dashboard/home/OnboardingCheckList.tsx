"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckCircleIcon } from "@/../public/svg";
import CircularProgress from "./CircularProgress";
import { motion } from "framer-motion";
import { DashboardService, OnboardingStatus } from "@/lib/api/dashboard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

function OnboardingCheckList() {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);

  useEffect(() => {
    DashboardService.getOnboardingStatus().then(setStatus).catch(console.error);
  }, []);

  const checkList = status
    ? status.steps.map((step) => ({ name: step.label, path: step.key, verify: step.completed }))
    : [
        { name: "Verify email", path: "verify-email", verify: false },
        { name: "Provide company info", path: "company-info", verify: false },
        { name: "Complete KYB", path: "kyb-verification", verify: false },
        { name: "Fund wallet", path: "connect-wallet", verify: false },
      ];

  const progress = status?.progressPercentage ?? 0;

  const renderItem = (onboarding: { name: string; path: string; verify: boolean }, index: number) => (
    <motion.div
      key={index}
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={`/dashboard/${onboarding.path}`}
        className="p-4 rounded-lg border border-[#8674E7] bg-[#00000033] text-sm font-medium text-white flex justify-between items-center cursor-pointer h-full"
      >
        <span>{onboarding.name}</span>
        <span>{onboarding.verify ? <CheckCircleIcon /> : <ArrowRightIcon />}</span>
      </Link>
    </motion.div>
  );

  return (
    <section
      style={{ backgroundImage: "url('/images/onboarding_bg.png')" }}
      className="p-8 rounded-xl space-y-6 bg-cover bg-center bg-no-repeat"
    >
      <div className="flex items-center gap-6">
        <CircularProgress progress={progress} />
        <article className="space-y-2">
          <p className="text-white sm:text-2xl text-xl font-bold">Onboarding Checklist</p>
          <p className="text-[#E8E5FA] font-medium text-xs sm:text-sm leading-[120%]">
            You&apos;re one step away! Complete the following to get access to all features
          </p>
        </article>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="sm:grid grid-cols-1 hidden md:grid-cols-2 xl:grid-cols-4 w-full gap-2"
      >
        {checkList.map(renderItem)}
      </motion.div>

      <div className="space-y-2 sm:hidden">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
          {checkList.slice(0, 2).map(renderItem)}
        </motion.div>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex items-center gap-2">
          {checkList.slice(2, 4).map((item, index) => (
            <motion.div key={index} variants={itemVariants} className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={`/dashboard/${item.path}`}
                className="p-4 rounded-lg border border-[#8674E7] bg-[#00000033] text-sm font-medium text-white flex justify-between items-center cursor-pointer"
              >
                <span>{item.name}</span>
                <span>{item.verify ? <CheckCircleIcon /> : <ArrowRightIcon />}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default OnboardingCheckList;
