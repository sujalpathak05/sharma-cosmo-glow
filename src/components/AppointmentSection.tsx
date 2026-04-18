import { useState, useEffect } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { CalendarDays, CheckCircle2, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { clinicContact } from "@/lib/contactDetails";
import { slotLabelToSqlTime } from "@/lib/appointmentTime";
import { buildStoredAppointmentMessage, removeLocalAppointment, saveLocalAppointment } from "@/lib/appointmentStore";
import { consultationModeOptions, getConsultationFee, getConsultationModeLabel, type ConsultationMode } from "@/lib/consultationMode";
import { patientGenderOptions, type PatientGender } from "@/lib/patientGender";

const locations = [{ value: "Noida", label: "Noida" }];
const appointmentServiceOptions = [{ label: "Hair Solution" }, { label: "Skin Solution" }];

const ALL_TIME_SLOTS = [
  "11:00 AM - 11:15 AM",
  "11:15 AM - 11:30 AM",
  "11:30 AM - 11:45 AM",
  "11:45 AM - 12:00 PM",
  "12:00 PM - 12:15 PM",
  "12:15 PM - 12:30 PM",
  "12:30 PM - 12:45 PM",
  "12:45 PM - 1:00 PM",
  "1:00 PM - 1:15 PM",
  "1:15 PM - 1:30 PM",
  "1:30 PM - 1:45 PM",
  "1:45 PM - 2:00 PM",
  "2:00 PM - 2:15 PM",
  "2:15 PM - 2:30 PM",
  "2:30 PM - 2:45 PM",
  "2:45 PM - 3:00 PM",
  "5:30 PM - 5:45 PM",
  "5:45 PM - 6:00 PM",
  "6:00 PM - 6:15 PM",
  "6:15 PM - 6:30 PM",
  "6:30 PM - 6:45 PM",
  "6:45 PM - 7:00 PM",
  "7:00 PM - 7:15 PM",
  "7:15 PM - 7:30 PM",
  "7:30 PM - 7:45 PM",
  "7:45 PM - 8:00 PM",
];

type AppointmentFormData = {
  name: string;
  phone: string;
  email: string;
  gender: PatientGender | "";
  service: string;
  consultationMode: ConsultationMode;
  location: string;
  date: string;
  time: string;
  message: string;
};

const AppointmentSection = () => {
  const sectionRef = useScrollReveal<HTMLElement>();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [offDates, setOffDates] = useState<string[]>([]);
  const [disabledSlots, setDisabledSlots] = useState<string[]>([]);
  const [savedMode, setSavedMode] = useState<"cloud" | "local">("cloud");
  const [formData, setFormData] = useState<AppointmentFormData>({
    name: "",
    phone: "",
    email: "",
    gender: "",
    service: "",
    consultationMode: "offline" as ConsultationMode,
    location: "",
    date: "",
    time: "",
    message: "",
  });

  useEffect(() => {
    const fetchOffDates = async () => {
      const { data } = await supabase.from("off_dates").select("date");
      if (data) setOffDates(data.map((d: { date: string }) => d.date));
    };
    fetchOffDates();
  }, []);

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

      if (data) setDisabledSlots(data.map((d: { time_slot: string }) => d.time_slot));
    };

    fetchDisabledSlots();
  }, [formData.date]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "date") {
      setFormData({ ...formData, date: value, time: "" } as AppointmentFormData);
    } else {
      setFormData({ ...formData, [name]: value } as AppointmentFormData);
    }
  };

  const isDateOff = (dateStr: string) => offDates.includes(dateStr);
  const availableSlots = ALL_TIME_SLOTS.filter((slot) => !disabledSlots.includes(slot));

  const today = new Date().toISOString().split("T")[0];

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      gender: "",
      service: "",
      consultationMode: "offline",
      location: "",
      date: "",
      time: "",
      message: "",
    });
  };

  const syncAppointmentToCloud = async (
    localId: string,
    appointmentPayload: {
      name: string;
      phone: string;
      email: string | null;
      service: string;
      location: string;
      preferred_date: string | null;
      preferred_time: string | null;
      message: string | null;
    },
  ) => {
    try {
      const { error } = await supabase.from("appointments").insert(appointmentPayload);

      if (error) {
        console.error("Appointment cloud sync failed, kept local backup:", error);
        return;
      }

      removeLocalAppointment(localId);
      setSavedMode("cloud");
    } catch (error) {
      console.error("Appointment background sync error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim() || !formData.gender || !formData.service || !formData.location) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (formData.date && isDateOff(formData.date)) {
      toast.error("Selected date is not available. Please choose another date.");
      return;
    }

    setLoading(true);

    try {
      const preferredTime = formData.time ? slotLabelToSqlTime(formData.time) : null;
      if (formData.time && !preferredTime) {
        toast.error("Selected time slot could not be processed. Please choose the slot again.");
        setLoading(false);
        return;
      }

      const appointmentPayload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        service: formData.service,
        location: formData.location,
        preferred_date: formData.date || null,
        preferred_time: preferredTime,
        message: buildStoredAppointmentMessage(formData.message.trim() || null, formData.consultationMode, formData.gender || null),
      };

      const localRecord = saveLocalAppointment({
        ...appointmentPayload,
        gender: formData.gender || null,
        message: formData.message.trim() || null,
        consultation_mode: formData.consultationMode,
      });
      void syncAppointmentToCloud(localRecord.id, appointmentPayload);

      setSavedMode("local");
      setSubmitted(true);
      toast.success("Appointment request submitted! It is saved instantly and syncing to the admin dashboard.");
    } catch (err) {
      console.error("Appointment submission error:", err);
      toast.error("Something went wrong while saving your appointment.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="appointment" ref={sectionRef} className="deferred-section section-glow relative reveal py-24 lg:py-32 bg-rose-soft section-padding overflow-hidden">
        <div className="absolute inset-0 motion-grid opacity-30 pointer-events-none" />
        <div className="section-container text-center max-w-xl mx-auto">
          <div className="glass-panel rounded-[2rem] p-10 sm:p-12 shadow-xl">
            <CheckCircle2 size={56} className="mx-auto text-primary mb-6" />
            <h3 className="heading-display text-2xl mb-3">
              {savedMode === "cloud" ? "Booking Confirmed!" : "Booking Saved!"}
            </h3>
            <p className="text-body mb-6">
              Thank you, {formData.name}! We have saved your appointment request for{" "}
              <strong>{formData.service}</strong> at <strong>{formData.location}</strong>.
            </p>
            <p className="font-body text-sm text-muted-foreground mb-3">
              Consultation mode: <strong>{getConsultationModeLabel(formData.consultationMode)}</strong> - Fee{" "}
              <strong>Rs. {getConsultationFee(formData.consultationMode)}</strong>
            </p>
            {savedMode === "local" ? (
              <p className="font-body text-sm text-muted-foreground mb-8">
                Cloud sync is currently unavailable, so this request has been safely kept in the admin backup queue on this browser.
              </p>
            ) : (
              <p className="font-body text-sm text-muted-foreground mb-8">
                Our team will reach out within 24 hours to confirm your visit.
              </p>
            )}
            <button
              onClick={() => {
                setSubmitted(false);
                resetForm();
              }}
              className="btn-primary"
            >
              Book Another
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
      <section id="appointment" ref={sectionRef} className="deferred-section section-glow relative reveal py-24 lg:py-32 bg-rose-soft section-padding overflow-hidden">
      <div className="absolute inset-0 motion-grid opacity-30 pointer-events-none" />
      <div className="absolute pointer-events-none left-0 top-20 h-64 w-64 motion-orb opacity-60" />

      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-4">Book Now</p>
            <h2 className="heading-display text-3xl sm:text-4xl lg:text-[2.75rem] mb-6">
              Schedule Your Consultation
            </h2>
            <p className="text-body mb-8 max-w-md">
              Book an appointment for acne treatment, PRP hair treatment, laser hair removal,
              chemical peel treatment, or anti-aging care and get a plan matched to your concern.
            </p>

            <div className="space-y-4">
              <div className="glass-panel spotlight-card rounded-[1.5rem] p-5 flex items-start gap-4">
                <CalendarDays className="text-primary mt-1" size={24} />
                <div>
                  <p className="font-body font-semibold text-foreground text-sm">Mon - Sat: 11:00 AM - 3:00 PM & 5:30 PM - 8:00 PM</p>
                  <p className="font-body text-sm text-muted-foreground">Sunday by appointment only</p>
                </div>
              </div>

              <div className="glass-panel spotlight-card rounded-[1.5rem] p-5 flex items-start gap-4">
                <MapPin className="text-primary mt-1" size={24} />
                <div>
                  <p className="font-body font-semibold text-foreground text-sm">Noida Clinic</p>
                  <p className="font-body text-sm text-muted-foreground">{clinicContact.addressInline}</p>
                </div>
              </div>

            </div>

            <a
              href={clinicContact.whatsappHref}
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

          <form onSubmit={handleSubmit} className="glass-panel rounded-[2rem] p-8 shadow-xl shadow-black/5">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={18} className="text-primary" />
              <p className="font-body text-sm text-muted-foreground">Fast booking form with admin backup</p>
            </div>

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
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/90 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
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
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/90 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  placeholder={clinicContact.phoneDisplay}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <input
                  name="email"
                  type="email"
                  maxLength={255}
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/90 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Gender *</label>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/90 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                >
                  <option value="">Select gender</option>
                  {patientGenderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Service *</label>
                <select
                  name="service"
                  required
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/90 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                >
                  <option value="">Select a service</option>
                  {appointmentServiceOptions.map((option) => (
                    <option key={option.label} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Consultation Mode *</label>
                <select
                  name="consultationMode"
                  required
                  value={formData.consultationMode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/90 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                >
                  {consultationModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
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
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/90 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                >
                  <option value="">Select location</option>
                  {locations.map((location) => (
                    <option key={location.value} value={location.value}>{location.label}</option>
                  ))}
                </select>
              </div>
            </div>


            <div className="mb-4 rounded-[1.25rem] border border-[#ead7b0] bg-[#fff8ed] px-4 py-4">
              <p className="font-body text-xs uppercase tracking-[0.18em] text-[#a16c23]">Consultation Fee</p>
              <p className="mt-2 font-body text-sm text-foreground">
                {getConsultationModeLabel(formData.consultationMode)}: <strong>Rs. {getConsultationFee(formData.consultationMode)}</strong>
              </p>
            </div>

            <div className="mb-4">
              <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Preferred Date</label>
              <input
                name="date"
                type="date"
                min={today}
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border bg-background/90 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow ${
                  formData.date && isDateOff(formData.date) ? "border-destructive" : "border-border"
                }`}
              />
              {formData.date && isDateOff(formData.date) && (
                <p className="text-destructive text-xs mt-1 font-body">This date is unavailable. Please select another date.</p>
              )}
            </div>

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
                      className={`px-3 py-2 rounded-xl text-xs font-body font-medium transition-all duration-200 border ${
                        formData.time === slot
                          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                          : "bg-background/90 text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
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
                className="w-full px-4 py-3 rounded-xl border border-border bg-background/90 text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none"
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

