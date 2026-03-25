import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";

const testimonials = [
  { name: "Priya Mehta", treatment: "Skin Rejuvenation", rating: 5, text: "My skin has never looked better! Dr. Sharma really took the time to understand my concerns and created a treatment plan that worked wonders. The results are visible and I feel so much more confident." },
  { name: "Arjun Kapoor", treatment: "Hair Fall Treatment", rating: 5, text: "After trying numerous remedies, I finally found a solution at Sharma Cosmo Clinic. The PRP therapy combined with their hair care regimen has shown incredible results in just three months." },
  { name: "Sneha Reddy", treatment: "Acne Treatment", rating: 5, text: "I struggled with acne for years. The team at Sharma Cosmo Clinic not only treated my acne effectively but also helped fade the scars. I'm so grateful for their expertise and care." },
  { name: "Vikram Patel", treatment: "Laser Treatment", rating: 4, text: "Professional, hygienic, and results-driven. The laser treatment was smooth and the recovery was quick. The staff made me feel comfortable throughout. Highly recommended clinic." },
];

const TestimonialsSection = () => {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  return (
    <section id="testimonials" ref={sectionRef} className="py-24 lg:py-32 section-padding overflow-hidden">
      <div className="section-container">
        <div className={`text-center mb-16 transition-all duration-800 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-4">Testimonials</p>
          <h2 className="heading-display text-3xl sm:text-4xl lg:text-[2.75rem] mb-4">
            What Our Patients Say
          </h2>
          <p className="text-body max-w-2xl mx-auto">
            Real experiences from real patients who trusted us with their skin.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
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
                      si < t.rating
                        ? "fill-gold text-gold"
                        : "text-border"
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
