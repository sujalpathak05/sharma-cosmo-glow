import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type HairTestCtaButtonProps = {
  onClick: () => void;
  className?: string;
  compact?: boolean;
};

const HairTestCtaButton = ({ onClick, className, compact = false }: HairTestCtaButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "group inline-flex items-center justify-center gap-2 rounded-full border border-[#e4c07d] bg-[linear-gradient(135deg,#fff7e7,#e7b866)] font-body font-bold uppercase tracking-[0.08em] text-[#2f251f] shadow-[0_18px_36px_-24px_rgba(92,59,13,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_42px_-24px_rgba(92,59,13,0.78)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d99b42] focus-visible:ring-offset-2 active:scale-[0.98]",
      compact ? "px-4 py-2.5 text-[11px]" : "px-6 py-3 text-xs sm:text-sm",
      className,
    )}
  >
    <Sparkles className="h-4 w-4 text-[#9d661f] transition-transform duration-300 group-hover:rotate-6" aria-hidden="true" />
    <span className="whitespace-nowrap">TAKE THE HAIR TEST™</span>
  </button>
);

export default HairTestCtaButton;
