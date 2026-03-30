import { CalendarDays } from "lucide-react";
import { clinicContact } from "@/lib/contactDetails";

const FloatingButtons = () => (
  <>
    <a
      href={clinicContact.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-6 right-6 z-40 isolate flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(142,70%,40%)] text-primary-foreground shadow-lg shadow-black/15 hover:scale-105 active:scale-95 transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <span className="absolute inset-0 rounded-full bg-[hsl(142,70%,40%)] opacity-30" style={{ animation: "halo-pulse 3.2s ease-in-out infinite" }} />
      <span className="absolute inset-[-6px] rounded-full border border-white/20 opacity-80" style={{ animation: "halo-pulse 3.2s ease-in-out 0.8s infinite" }} />
      <svg viewBox="0 0 24 24" fill="currentColor" className="relative z-10 w-7 h-7 transition-transform duration-300 group-hover:scale-110">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.507 3.932 1.396 5.608L.05 23.65a.5.5 0 00.612.612l5.993-1.328A11.935 11.935 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.83 0-3.55-.5-5.026-1.364l-.36-.214-3.73.827.86-3.684-.235-.374A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
      </svg>
    </a>

    <a
      href="#appointment"
      className="group fixed bottom-6 left-6 z-40 lg:hidden isolate flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-body font-medium text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform"
    >
      <span className="absolute inset-0 rounded-full bg-primary/30" style={{ animation: "halo-pulse 3.4s ease-in-out infinite" }} />
      <CalendarDays size={18} className="relative z-10" />
      <span className="relative z-10">Book Now</span>
    </a>
  </>
);

export default FloatingButtons;
