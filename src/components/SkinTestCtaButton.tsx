import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type SkinTestCtaButtonProps = {
  onClick: () => void;
  className?: string;
  compact?: boolean;
};

const SkinTestCtaButton = ({ onClick, className, compact = false }: SkinTestCtaButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "group inline-flex items-center justify-center gap-2 rounded-full border border-[#e8adba] bg-[linear-gradient(135deg,#fff3f5,#e8a3b3)] font-body font-bold uppercase tracking-[0.08em] text-[#3b1f26] shadow-[0_18px_36px_-24px_rgba(140,32,60,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_42px_-24px_rgba(140,32,60,0.68)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8607a] focus-visible:ring-offset-2 active:scale-[0.98]",
      compact ? "px-4 py-2.5 text-[11px]" : "px-6 py-3 text-xs sm:text-sm",
      className,
    )}
  >
    <Sparkles className="h-4 w-4 text-[#b23a52] transition-transform duration-300 group-hover:rotate-6" aria-hidden="true" />
    <span className="whitespace-nowrap">TAKE THE SKIN TEST™</span>
  </button>
);

export default SkinTestCtaButton;
