import { useState, useEffect } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { CalendarDays, CheckCircle2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const services = [
  "Skin Treatment",
  "Acne & Pigmentation",
  "Hair Fall Treatment",
  "Laser Treatment",
  "Anti-Aging Treatment",
  "Cosmetic Procedures",
];

const locations = [
  { value: "Noida", label: "Noida" },
];

const ALL_TIME_SLOTS = [
  "11:00 AM – 11:15 AM",
  "11:15 AM – 11:30 AM",
  "11:30 AM – 11:45 AM",
  "11:45 AM – 12:00 PM",
  "12:00 PM – 12:15 PM",
  "12:15 PM – 12:30 PM",
  "12:30 PM – 12:45 PM",
  "12:45 PM – 1:00 PM",
  "1:00 PM – 1:15 PM",
  "1:15 PM – 1:30 PM",
  "1:30 PM – 1:45 PM",
  "1:45 PM – 2:00 PM",
  "2:00 PM – 2:15 PM",
  "2:15 PM – 2:30 PM",
  "2:30 PM – 2:45 PM",
  "2:45 PM – 3:00 PM",
  "5:30 PM – 5:45 PM",
  "5:45 PM – 6:00 PM",
  "6:00 PM – 6:15 PM",
  "6:15 PM – 6:30 PM",
  "6:30 PM – 6:45 PM",
  "6:45 PM – 7:00 PM",
  "7:00 PM – 7:15 PM",
  "7:15 PM – 7:30 PM",
  "7:30 PM – 7:45 PM",
  "7:45 PM – 8:00 PM",
];

const AppointmentSection = () => {
  const sectionRef = useScrollReveal<HTMLElement>();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [offDates, setOffDates] = useState<string[]>([]);
  const [disabledSlots, setDisabledSlots] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    location: "",
    date: "",
    time: "",
    message: "",
  });

  // Fetch off dates
  useEffect(() => {
    const fetchOffDates = async () => {
      const { data } = await supabase.from("off_dates").select("date");
      if (data) setOffDates(data.map((d: any) => d.date));
    };
    fetchOffDates();
  }, []);

  // Fetch disabled slots when date changes
  useEffect(() => {
    if (!formData.date) {
      setDisabledSlots([]);
      return;
    }
    const fetchDisabledSlots = async () => {
      const { data } = await supabase
        .from("disabled_slots")
        .select("time_slot")
        .eq("date", formData.date);
      if (data) setDisabledSlots(data.map((d: any) => d.time_slot));
    };
    fetchDisabledSlots();
  }, [formData.date]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "date") {
      setFormData({ ...formData, date: value, time: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const isDateOff = (dateStr: string) => offDates.includes(dateStr);

  const availableSlots = ALL_TIME_SLOTS.filter((slot) => !disabledSlots.includes(slot));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.service || !formData.location) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (formData.date && isDateOff(formData.date)) {
      toast.error("Selected date is not available. Please choose another date.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("appointments").insert({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        service: formData.service,
        location: formData.location,
        preferred_date: formData.date || null,
        preferred_time: formData.time || null,
        message: formData.message.trim() || null,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Appointment request submitted! We'll contact you shortly.");
    } catch (err) {
      console.error("Appointment submission error:", err);
      toast.error("Something went wrong. Please try again or book via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD for min attribute
  const today = new Date().toISOString().split("T")[0];

  if (submitted) {
    return (
      <section id="appointment" ref={sectionRef} className="reveal py-24 lg:py-32 bg-rose-soft section-padding">
        <div className="section-container text-center max-w-lg mx-auto">
          <div className="bg-card rounded-2xl p-12 shadow-lg">
            <CheckCircle2 size={56} className="mx-auto text-primary mb-6" />
            <h3 className="heading-display text-2xl mb-3">Booking Confirmed!</h3>
            <p className="text-body mb-8">
              Thank you, {formData.name}! We've received your appointment request for <strong>{formData.service}</strong> at <strong>{formData.location}</strong>.
              Our team will reach out within 24 hours to confirm your visit.
            </p>
            <button onClick={() => { setSubmitted(false); setFormData({ name: "", phone: "", email: "", service: "", location: "", date: "", time: "", message: "" }); }} className="btn-primary">
              Book Another
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="appointment" ref={sectionRef} className="reveal py-24 lg:py-32 bg-rose-soft section-padding">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left info */}
          <div>
            <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-4">Book Now</p>
            <h2 className="heading-display text-3xl sm:text-4xl lg:text-[2.75rem] mb-6">
              Schedule Your Consultation
            </h2>
            <p className="text-body mb-8 max-w-md">
              Take the first step toward healthier, more radiant skin. Book your appointment
              today and let our experts craft the perfect treatment plan for you.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <CalendarDays className="text-primary" size={24} />
                <div>
                  <p className="font-body font-semibold text-foreground text-sm">Mon – Sat: 11:00 AM – 3:00 PM & 5:30 PM – 8:00 PM</p>
                  <p className="font-body text-sm text-muted-foreground">Sunday by appointment only</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="text-primary" size={24} />
                <div>
                  <p className="font-body font-semibold text-foreground text-sm">Noida Clinic</p>
                  <p className="font-body text-sm text-muted-foreground">Sector 18, Noida, UP</p>
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <a
              href="https://wa.me/919876543210?text=Hi,%20I%20would%20like%20to%20book%20an%20appointment%20at%20Sharma%20Cosmo%20Clinic."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 mt-10 px-6 py-3 rounded-full bg-[hsl(142,70%,40%)] text-primary-foreground font-body font-medium text-sm hover:shadow-lg transition-all duration-200 active:scale-[0.97]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.507 3.932 1.396 5.608L.05 23.65a.5.5 0 00.612.612l5.993-1.328A11.935 11.935 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.83 0-3.55-.5-5.026-1.364l-.36-.214-3.73.827.86-3.684-.235-.374A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Book via WhatsApp
            </a>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-xl shadow-black/5">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Name *</label>
                <input
                  name="name"
                  type="text"
                  required
                  maxLength={100}
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Phone *</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  maxLength={15}
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <input
                name="email"
                type="email"
                maxLength={255}
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="you@example.com"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Service *</label>
                <select
                  name="service"
                  required
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                >
                  <option value="">Select a service</option>
                  {services.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Location *</label>
                <select
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                >
                  <option value="">Select location</option>
                  {locations.map((loc) => (
                    <option key={loc.value} value={loc.value}>{loc.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Preferred Date</label>
              <input
                name="date"
                type="date"
                min={today}
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow ${
                  formData.date && isDateOff(formData.date) ? "border-destructive" : "border-border"
                }`}
              />
              {formData.date && isDateOff(formData.date) && (
                <p className="text-destructive text-xs mt-1 font-body">⚠ This date is unavailable. Please select another date.</p>
              )}
            </div>

            {/* Time Slots */}
            <div className="mb-6">
              <label className="font-body text-sm font-medium text-foreground mb-2 block">Preferred Time Slot</label>
              {formData.date && isDateOff(formData.date) ? (
                <p className="text-muted-foreground text-sm font-body">Select an available date first.</p>
              ) : availableSlots.length === 0 && formData.date ? (
                <p className="text-muted-foreground text-sm font-body">No slots available for this date.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {(formData.date ? availableSlots : ALL_TIME_SLOTS).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData({ ...formData, time: slot })}
                      className={`px-3 py-2 rounded-lg text-xs font-body font-medium transition-all duration-200 border ${
                        formData.time === slot
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Message (optional)</label>
              <textarea
                name="message"
                rows={3}
                maxLength={1000}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none"
                placeholder="Any specific concerns or questions..."
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-center disabled:opacity-60">
              {loading ? "Submitting..." : "Submit Appointment Request"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AppointmentSection;
