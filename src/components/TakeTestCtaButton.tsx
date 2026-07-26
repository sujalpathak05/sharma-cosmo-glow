import { ChevronDown, Sparkles } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type TakeTestCtaButtonProps = {
  onHairTestOpen: () => void;
  onSkinTestOpen: () => void;
  className?: string;
  compact?: boolean;
};

const TakeTestCtaButton = ({ onHairTestOpen, onSkinTestOpen, className, compact = false }: TakeTestCtaButtonProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        className={cn(
          "group inline-flex items-center justify-center gap-2 rounded-full border border-[#e4c07d] bg-[linear-gradient(135deg,#fff7e7,#e7b866)] font-body font-bold uppercase tracking-[0.08em] text-[#2f251f] shadow-[0_18px_36px_-24px_rgba(92,59,13,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_42px_-24px_rgba(92,59,13,0.78)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d99b42] focus-visible:ring-offset-2 active:scale-[0.98] data-[state=open]:-translate-y-0.5",
          compact ? "px-4 py-2.5 text-[11px]" : "px-6 py-3 text-xs sm:text-sm",
          className,
        )}
      >
        <Sparkles className="h-4 w-4 text-[#9d661f] transition-transform duration-300 group-hover:rotate-6" aria-hidden="true" />
        <span className="whitespace-nowrap">TAKE YOUR TEST™</span>
        <ChevronDown className="h-4 w-4 text-[#9d661f] transition-transform duration-300 group-data-[state=open]:rotate-180" aria-hidden="true" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="center" sideOffset={10} className="w-64 rounded-2xl border-[#ead7b0] bg-[#fffdf9] p-2 shadow-[0_28px_60px_-30px_rgba(39,28,18,0.55)]">
      <DropdownMenuItem
        onSelect={onHairTestOpen}
        className="cursor-pointer gap-3 rounded-xl px-3 py-3 font-body text-sm font-semibold text-[#2f251f] focus:bg-[#fff0cd] focus:text-[#2f251f]"
      >
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#fff0cd] text-[#9d661f]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
        <span>
          <span className="block">Hair Test</span>
          <span className="block font-normal text-xs text-muted-foreground">Find the root cause of your hair fall</span>
        </span>
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={onSkinTestOpen}
        className="cursor-pointer gap-3 rounded-xl px-3 py-3 font-body text-sm font-semibold text-[#2f251f] focus:bg-[#fde3e8] focus:text-[#2f251f]"
      >
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#fde3e8] text-[#b23a52]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
        <span>
          <span className="block">Skin Test</span>
          <span className="block font-normal text-xs text-muted-foreground">Understand your skin concern in minutes</span>
        </span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default TakeTestCtaButton;
