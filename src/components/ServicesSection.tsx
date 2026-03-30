import { Sparkles, Droplets, Wind, Zap, Clock, Scissors, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const services = [
  { icon: Sparkles, title: "Skin Treatment", desc: "Comprehensive skin care solutions including facials, chemical peels, and advanced dermatological treatments for radiant, healthy skin.", detail: "Our skin treatments are customized to address your specific concerns using the latest dermatological advances." },
  { icon: Droplets, title: "Acne & Pigmentation", desc: "Targeted treatments for acne, dark spots, melasma, and uneven skin tone using medical-grade formulations and procedures.", detail: "We use a combination of topical treatments, light therapy, and chemical peels for lasting results." },
  { icon: Wind, title: "Hair Fall Treatment", desc: "Advanced solutions for hair thinning and loss including PRP therapy, mesotherapy, and personalized regrowth programs.", detail: "Our hair restoration programs combine medical treatments with nutritional guidance for optimal results." },
  { icon: Zap, title: "Laser Treatment", desc: "State-of-the-art laser procedures for hair removal, skin resurfacing, scar reduction, and pigmentation correction.", detail: "We use FDA-approved lasers with customizable settings for safe, effective treatment across all skin types." },
  { icon: Clock, title: "Anti-Aging Treatment", desc: "Turn back the clock with botox, dermal fillers, skin tightening, and collagen-boosting therapies for youthful skin.", detail: "Our anti-aging protocols focus on natural-looking results that enhance your features without overdoing it." },
  { icon: Scissors, title: "Cosmetic Procedures", desc: "Expert cosmetic enhancements including lip augmentation, rhinoplasty consultation, and body contouring treatments.", detail: "Each procedure is carefully planned with a detailed consultation to ensure your goals are met safely." },
];

const ServicesSection = () => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="services" ref={sectionRef} className="section-glow relative py-24 lg:py-32 section-padding overflow-hidden">
      <div className="absolute inset-0 motion-grid opacity-40 pointer-events-none" />
      <div className="absolute pointer-events-none -right-16 top-24 h-64 w-64 motion-orb-gold opacity-70" />

      <div className="section-container">
        <div className={`text-center mb-16 transition-all duration-800 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-4">Our Services</p>
          <h2 className="heading-display text-3xl sm:text-4xl lg:text-[2.75rem] mb-4">
            Treatments We Offer
          </h2>
          <p className="text-body max-w-2xl mx-auto">
            From advanced skin rejuvenation to cosmetic enhancements, we provide a comprehensive
            range of treatments designed to bring out your best.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const isExpanded = expandedIdx === i;

            return (
              <div
                key={service.title}
                className={`spotlight-card group rounded-[1.75rem] border border-border bg-card/90 p-7 shadow-sm cursor-pointer transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 ${
                  visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
                }`}
                style={{ transitionDelay: `${0.1 + i * 0.1}s` }}
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
              >
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-80" />
                <div className="absolute right-6 top-5 font-display text-[3.2rem] leading-none text-primary/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                  {String(i + 1).padStart(2, "0")}
                </div>

                <div className="w-12 h-12 rounded-2xl bg-rose-soft flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <service.icon size={22} className="text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>

                <h3 className="font-display text-xl font-semibold text-foreground mb-3">{service.title}</h3>
                <p className="text-body text-sm">{service.desc}</p>

                <div
                  className={`grid transition-all duration-500 ease-out ${isExpanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-70 mt-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="text-body text-sm pt-4 border-t border-border">{service.detail}</p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-expanded={isExpanded}
                  className="mt-5 inline-flex items-center gap-2 font-body text-sm font-medium text-primary"
                >
                  <span>{isExpanded ? "Hide Details" : "Explore Treatment"}</span>
                  <ArrowRight
                    size={16}
                    className={`transition-transform duration-300 ${isExpanded ? "rotate-90" : "group-hover:translate-x-1"}`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
