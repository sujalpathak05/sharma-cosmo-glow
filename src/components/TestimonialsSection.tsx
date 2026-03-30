import { useEffect, useRef, useState } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Review = {
  id: string;
  name: string;
  treatment: string;
  rating: number;
  text: string;
};

const defaultReviews: Review[] = [
  { id: "1", name: "Priya Mehta", treatment: "Skin Rejuvenation", rating: 5, text: "Meri skin pehle se kaafi dull thi, bahut tension rehti thi. Dr. Sharma ne meri problem samjhi aur treatment plan diya — ab meri skin mein itna difference aa gaya hai ki log poochte hain kya kiya. Bahut khush hoon results se!" },
  { id: "2", name: "Arjun Kapoor", treatment: "Hair Fall Treatment", rating: 5, text: "Hair fall ki wajah se confidence bahut down ho gaya tha. Bahut jagah try kiya lekin kuch kaam nahi aaya. Yahan PRP therapy li aur 3 mahine mein hi naye baal aane lage. Doctor aur staff dono bahut supportive hain." },
  { id: "3", name: "Sneha Reddy", treatment: "Acne Treatment", rating: 5, text: "Saalon se acne ki problem thi, scars bhi bahut the. Sharma Cosmo Clinic mein treatment liya toh acne bhi control hua aur scars bhi fade hone lage. Ab bina makeup ke bhi confident feel karti hoon. Thank you Dr. Sharma!" },
  { id: "4", name: "Vikram Patel", treatment: "Laser Treatment", rating: 4, text: "Clinic bahut clean aur professional hai. Laser treatment mein bilkul darr nahi laga, staff ne pehle sab samjhaya. Recovery bhi fast hui. Jo bhi skin related problem ho, yahan zaroor aayein — highly recommended." },
];

const treatments = [
  "Skin Treatment", "Acne & Pigmentation", "Hair Fall Treatment",
  "Laser Treatment", "Anti-Aging Treatment", "Cosmetic Procedures",
];

const TestimonialsSection = () => {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [reviews, setReviews] = useState<Review[]>(defaultReviews);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", treatment: treatments[0], rating: 5, text: "" });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase.from("reviews").select("*").eq("is_approved", true).order("created_at", { ascending: false });
      if (data && data.length > 0) {
        setReviews(data.map(r => ({ id: r.id, name: r.name, treatment: r.treatment, rating: r.rating, text: r.text })));
      }
    };
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      name: form.name.trim(),
      treatment: form.treatment,
      rating: form.rating,
      text: form.text.trim(),
    });
    if (error) {
      toast.error("Failed to submit review. Please try again.");
    } else {
      toast.success("Thank you! Your review has been submitted for approval.");
      setForm({ name: "", treatment: treatments[0], rating: 5, text: "" });
      setShowForm(false);
    }
    setSubmitting(false);
  };

  return (
    <section id="testimonials" ref={sectionRef} className="py-24 lg:py-32 section-padding overflow-hidden">
      <div className="section-container">
        <div className={`text-center mb-16 transition-all duration-800 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-4">Testimonials</p>
          <h2 className="heading-display text-3xl sm:text-4xl lg:text-[2.75rem] mb-4">
            What Our Patients Say
          </h2>
          <p className="text-body max-w-2xl mx-auto mb-6">
            Real experiences from real patients who trusted us with their skin & hair care.
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Send size={16} /> Write Your Review
          </button>
        </div>

        {/* Review Form */}
        {showForm && (
          <div className={`max-w-lg mx-auto mb-12 bg-card rounded-2xl p-6 border border-border shadow-lg transition-all duration-500 ${showForm ? "animate-fade-up" : ""}`}>
            <h3 className="font-display text-xl font-semibold text-foreground mb-4">Share Your Experience</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                required
              />
              <select
                value={form.treatment}
                onChange={e => setForm({ ...form, treatment: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:ring-2 focus:ring-primary/30 outline-none"
              >
                {treatments.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div>
                <p className="font-body text-sm text-muted-foreground mb-2">Rating</p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setForm({ ...form, rating: s })}>
                      <Star size={24} className={`transition-colors ${s <= form.rating ? "fill-gold text-gold" : "text-border"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Write your experience..."
                value={form.text}
                onChange={e => setForm({ ...form, text: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground font-body text-sm focus:ring-2 focus:ring-primary/30 outline-none resize-none"
                required
              />
              <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Submit Review
              </button>
            </form>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.slice(0, 8).map((t, i) => (
            <div
              key={t.id}
              className={`bg-card rounded-2xl p-6 border border-border card-hover transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${0.15 + i * 0.12}s` }}
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    size={16}
                    className={`transition-all duration-300 ${
                      si < t.rating ? "fill-gold text-gold" : "text-border"
                    } ${visible ? "scale-100" : "scale-0"}`}
                    style={{ transitionDelay: `${0.5 + i * 0.12 + si * 0.05}s` }}
                  />
                ))}
              </div>
              <p className="text-body text-sm mb-6 line-clamp-5">"{t.text}"</p>
              <div className="border-t border-border pt-4">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-body font-semibold text-sm mb-2">
                  {t.name[0]}
                </div>
                <p className="font-body font-semibold text-foreground text-sm">{t.name}</p>
                <p className="font-body text-xs text-muted-foreground">{t.treatment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
