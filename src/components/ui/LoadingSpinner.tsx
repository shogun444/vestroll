import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Renders a full-screen centered overlay — used for page-level loading */
  fullScreen?: boolean;
}

const sizeMap = {
  sm: "w-4 h-4 border-2",
  md: "w-5 h-5 border-2",
  lg: "w-8 h-8 border-[3px]",
};

export default function LoadingSpinner({
  size = "md",
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "rounded-full border-[#5E2A8C]/30 border-t-[#5E2A8C] animate-spin",
        sizeMap[size],
        className,
      )}
    />
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <span className="text-sm text-gray-500 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return spinner;
}
