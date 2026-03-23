import { useStaggerReveal } from "@/hooks/useScrollReveal";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Mehta",
    treatment: "Skin Rejuvenation",
    rating: 5,
    text: "My skin has never looked better! Dr. Sharma really took the time to understand my concerns and created a treatment plan that worked wonders. The results are visible and I feel so much more confident.",
  },
  {
    name: "Arjun Kapoor",
    treatment: "Hair Fall Treatment",
    rating: 5,
    text: "After trying numerous remedies, I finally found a solution at Sharma Cosmo Clinic. The PRP therapy combined with their hair care regimen has shown incredible results in just three months.",
  },
  {
    name: "Sneha Reddy",
    treatment: "Acne Treatment",
    rating: 5,
    text: "I struggled with acne for years. The team at Sharma Cosmo Clinic not only treated my acne effectively but also helped fade the scars. I'm so grateful for their expertise and care.",
  },
  {
    name: "Vikram Patel",
    treatment: "Laser Treatment",
    rating: 4,
    text: "Professional, hygienic, and results-driven. The laser treatment was smooth and the recovery was quick. The staff made me feel comfortable throughout. Highly recommended clinic.",
  },
];

const TestimonialsSection = () => {
  const containerRef = useStaggerReveal();

  return (
    <section id="testimonials" className="py-24 lg:py-32 section-padding">
      <div className="section-container">
        <div className="text-center mb-16">
          <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-4">Testimonials</p>
          <h2 className="heading-display text-3xl sm:text-4xl lg:text-[2.75rem] mb-4">
            What Our Patients Say
          </h2>
          <p className="text-body max-w-2xl mx-auto">
            Real experiences from real patients who trusted us with their skin.
          </p>
        </div>

        <div ref={containerRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="reveal bg-card rounded-2xl p-6 border border-border card-hover">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < t.rating ? "fill-gold text-gold" : "text-border"}
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
