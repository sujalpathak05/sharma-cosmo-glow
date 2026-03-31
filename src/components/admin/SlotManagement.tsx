import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CalendarOff, Clock, Plus, Trash2, Loader2 } from "lucide-react";

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

type OffDate = { id: string; date: string; reason: string | null };
type DisabledSlot = { id: string; date: string; time_slot: string };

const SlotManagement = () => {
  const [offDates, setOffDates] = useState<OffDate[]>([]);
  const [disabledSlots, setDisabledSlots] = useState<DisabledSlot[]>([]);
  const [newOffDate, setNewOffDate] = useState("");
  const [newOffReason, setNewOffReason] = useState("");
  const [slotDate, setSlotDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"off-dates" | "slots">("off-dates");

  const today = new Date().toISOString().split("T")[0];

  const fetchData = async () => {
    const [offRes, slotRes] = await Promise.all([
      supabase.from("off_dates").select("*").order("date", { ascending: true }),
      supabase.from("disabled_slots").select("*").order("date", { ascending: true }),
    ]);
    if (offRes.data) setOffDates(offRes.data as OffDate[]);
    if (slotRes.data) setDisabledSlots(slotRes.data as DisabledSlot[]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Load existing disabled slots when slotDate changes
  useEffect(() => {
    if (slotDate) {
      const existing = disabledSlots
        .filter((s) => s.date === slotDate)
        .map((s) => s.time_slot);
      setSelectedSlots(existing);
    } else {
      setSelectedSlots([]);
    }
  }, [slotDate, disabledSlots]);

  const addOffDate = async () => {
    if (!newOffDate) return;
    setLoading(true);
    const { error } = await supabase.from("off_dates").insert({
      date: newOffDate,
      reason: newOffReason.trim() || null,
    } as any);
    if (error) {
      toast.error(error.code === "23505" ? "This date is already marked as off." : "Failed to add off date.");
    } else {
      toast.success("Off date added.");
      setNewOffDate("");
      setNewOffReason("");
      fetchData();
    }
    setLoading(false);
  };

  const removeOffDate = async (id: string) => {
    const { error } = await supabase.from("off_dates").delete().eq("id", id);
    if (error) {
      toast.error("Failed to remove off date.");
    } else {
      toast.success("Off date removed.");
      setOffDates((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const saveDisabledSlots = async () => {
    if (!slotDate) return;
    setLoading(true);

    // Delete existing slots for this date
    await supabase.from("disabled_slots").delete().eq("date", slotDate);

    // Insert new disabled slots
    if (selectedSlots.length > 0) {
      const rows = selectedSlots.map((slot) => ({
        date: slotDate,
        time_slot: slot,
      }));
      const { error } = await supabase.from("disabled_slots").insert(rows as any);
      if (error) {
        toast.error("Failed to save disabled slots.");
      } else {
        toast.success(`${selectedSlots.length} slot(s) disabled for ${slotDate}.`);
      }
    } else {
      toast.success("All slots enabled for this date.");
    }

    fetchData();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("off-dates")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "off-dates" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <CalendarOff size={16} /> Off Dates
        </button>
        <button
          onClick={() => setTab("slots")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "slots" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock size={16} /> Time Slots
        </button>
      </div>

      {tab === "off-dates" && (
        <div className="space-y-4">
          <div className="glass-panel spotlight-card rounded-[26px] p-5">
            <h3 className="font-display text-base font-semibold text-foreground mb-4">Add Off Date</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="date"
                min={today}
                value={newOffDate}
                onChange={(e) => setNewOffDate(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="text"
                placeholder="Reason (optional)"
                value={newOffReason}
                onChange={(e) => setNewOffReason(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={addOffDate}
                disabled={loading || !newOffDate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Plus size={16} /> Add
              </button>
            </div>
          </div>

          <div className="glass-panel spotlight-card rounded-[26px] p-5">
            <h3 className="font-display text-base font-semibold text-foreground mb-4">Scheduled Off Dates</h3>
            {offDates.length === 0 ? (
              <p className="text-muted-foreground text-sm font-body">No off dates scheduled.</p>
            ) : (
              <div className="space-y-2">
                {offDates.map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <span className="font-body text-sm font-medium text-foreground">
                        {new Date(d.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", weekday: "short" })}
                      </span>
                      {d.reason && <span className="text-muted-foreground text-xs ml-2">- {d.reason}</span>}
                    </div>
                    <button onClick={() => removeOffDate(d.id)} className="text-destructive hover:text-destructive/80 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "slots" && (
        <div className="space-y-4">
          <div className="glass-panel spotlight-card rounded-[26px] p-5">
            <h3 className="font-display text-base font-semibold text-foreground mb-4">Manage Time Slots</h3>
            <p className="text-muted-foreground text-xs font-body mb-3">Select a date, then click slots to disable/enable them.</p>
            <input
              type="date"
              min={today}
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring mb-4"
            />

            {slotDate && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {ALL_TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleSlot(slot)}
                      className={`px-3 py-2 rounded-lg text-xs font-body font-medium transition-all duration-200 border ${
                        selectedSlots.includes(slot)
                          ? "bg-destructive/10 text-destructive border-destructive/30 line-through"
                          : "bg-background text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-body">
                    {selectedSlots.length} slot(s) will be disabled
                  </p>
                  <button
                    onClick={saveDisabledSlots}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                    Save Changes
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Currently disabled slots summary */}
          {disabledSlots.length > 0 && (
            <div className="glass-panel spotlight-card rounded-[26px] p-5">
              <h3 className="font-display text-base font-semibold text-foreground mb-3">Currently Disabled Slots</h3>
              <div className="space-y-2">
                {Object.entries(
                  disabledSlots.reduce<Record<string, string[]>>((acc, s) => {
                    if (!acc[s.date]) acc[s.date] = [];
                    acc[s.date].push(s.time_slot);
                    return acc;
                  }, {})
                ).map(([date, slots]) => (
                  <div key={date} className="p-3 bg-muted rounded-lg">
                    <p className="font-body text-sm font-medium text-foreground mb-1">
                      {new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", weekday: "short" })}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">{slots.join(", ")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SlotManagement;

