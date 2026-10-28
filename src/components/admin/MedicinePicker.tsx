import { useMemo, useRef, useState } from "react";
import { Check, Plus, Search } from "lucide-react";

import type { PharmacyMedicine } from "@/lib/clinicAdminStore";
import { cn } from "@/lib/utils";

type MedicinePickerProps = {
  medicines: PharmacyMedicine[];
  onPick: (medicine: PharmacyMedicine) => void;
  /** Medicine ids already in the bill, marked as "Added" in the list. */
  selectedIds: string[];
  /** Sales cannot pick medicines with zero stock; purchases can. */
  blockOutOfStock?: boolean;
};

const MAX_RESULTS = 50;

const formatMoney = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const MedicinePicker = ({ medicines, onPick, selectedIds, blockOutOfStock }: MedicinePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matches = term
      ? medicines.filter((item) => [item.name, item.generic, item.batch, item.group].some((value) => value.toLowerCase().includes(term)))
      : medicines;
    return [...matches]
      .sort((left, right) => {
        if (!term) return left.name.localeCompare(right.name);
        const leftStarts = left.name.toLowerCase().startsWith(term) ? 0 : 1;
        const rightStarts = right.name.toLowerCase().startsWith(term) ? 0 : 1;
        return leftStarts - rightStarts || left.name.localeCompare(right.name);
      })
      .slice(0, MAX_RESULTS);
  }, [medicines, query]);

  const isBlocked = (medicine: PharmacyMedicine) => Boolean(blockOutOfStock) && medicine.stock <= 0;

  const pick = (medicine: PharmacyMedicine) => {
    if (isBlocked(medicine)) return;
    onPick(medicine);
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.min(results.length - 1, current + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(0, current - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const medicine = results[activeIndex];
      if (open && medicine) pick(medicine);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-2xl border-2 border-[#d8ccff] bg-white px-4 py-3 text-sm focus-within:border-[#5a49d6]">
        <Search className="h-4 w-4 shrink-0 text-[#5a49d6]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          placeholder="Medicine search karein (name, generic ya batch) — click karte hi bill me add ho jayegi"
          className="w-full bg-transparent outline-none"
        />
      </div>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-[#d8ccff] bg-white p-1.5 shadow-[0_24px_50px_-20px_rgba(66,43,133,0.45)]">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">{medicines.length === 0 ? "Pharmacy master me koi medicine nahi hai." : "Is search ke liye koi medicine nahi mili."}</p>
          ) : (
            results.map((medicine, index) => {
              const blocked = isBlocked(medicine);
              const added = selectedIds.includes(medicine.id);
              return (
                <button
                  key={medicine.id}
                  type="button"
                  disabled={blocked}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => pick(medicine)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
                    index === activeIndex && !blocked ? "bg-[#f5f1ff]" : "",
                    blocked ? "cursor-not-allowed opacity-50" : "",
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{medicine.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {medicine.generic !== "-" ? `${medicine.generic} • ` : ""}Batch {medicine.batch} • Exp {medicine.expiryDate}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-[#5a49d6]">{formatMoney(medicine.unitPrice)}</p>
                      <p className={cn("text-xs", medicine.stock <= 0 ? "text-rose-600" : "text-muted-foreground")}>{medicine.stock <= 0 ? "Out of stock" : `Stock ${medicine.stock}`}</p>
                    </div>
                    {added ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                        <Check className="h-3 w-3" />
                        +1
                      </span>
                    ) : (
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#5a49d6] text-white">
                        <Plus className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
};

export default MedicinePicker;
