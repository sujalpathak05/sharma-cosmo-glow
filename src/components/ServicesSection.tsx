import { useStaggerReveal } from "@/hooks/useScrollReveal";
import { Sparkles, Droplets, Wind, Zap, Clock, Scissors } from "lucide-react";
import { useState } from "react";

const services = [
  {
    icon: Sparkles,
    title: "Skin Treatment",
    desc: "Comprehensive skin care solutions including facials, chemical peels, and advanced dermatological treatments for radiant, healthy skin.",
    detail: "Our skin treatments are customized to address your specific concerns using the latest dermatological advances.",
  },
  {
    icon: Droplets,
    title: "Acne & Pigmentation",
    desc: "Targeted treatments for acne, dark spots, melasma, and uneven skin tone using medical-grade formulations and procedures.",
    detail: "We use a combination of topical treatments, light therapy, and chemical peels for lasting results.",
  },
  {
    icon: Wind,
    title: "Hair Fall Treatment",
    desc: "Advanced solutions for hair thinning and loss including PRP therapy, mesotherapy, and personalized regrowth programs.",
    detail: "Our hair restoration programs combine medical treatments with nutritional guidance for optimal results.",
  },
  {
    icon: Zap,
    title: "Laser Treatment",
    desc: "State-of-the-art laser procedures for hair removal, skin resurfacing, scar reduction, and pigmentation correction.",
    detail: "We use FDA-approved lasers with customizable settings for safe, effective treatment across all skin types.",
  },
  {
    icon: Clock,
    title: "Anti-Aging Treatment",
    desc: "Turn back the clock with botox, dermal fillers, skin tightening, and collagen-boosting therapies for youthful skin.",
    detail: "Our anti-aging protocols focus on natural-looking results that enhance your features without overdoing it.",
  },
  {
    icon: Scissors,
    title: "Cosmetic Procedures",
    desc: "Expert cosmetic enhancements including lip augmentation, rhinoplasty consultation, and body contouring treatments.",
    detail: "Each procedure is carefully planned with a detailed consultation to ensure your goals are met safely.",
  },
];

const ServicesSection = () => {
  const containerRef = useStaggerReveal();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <section id="services" className="py-24 lg:py-32 section-padding">
      <div className="section-container">
        <div className="text-center mb-16">
          <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-4">Our Services</p>
          <h2 className="heading-display text-3xl sm:text-4xl lg:text-[2.75rem] mb-4">
            Treatments We Offer
          </h2>
          <p className="text-body max-w-2xl mx-auto">
            From advanced skin rejuvenation to cosmetic enhancements, we provide a comprehensive 
            range of treatments designed to bring out your best.
          </p>
        </div>

        <div ref={containerRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div
              key={s.title}
              className="reveal group bg-card rounded-2xl p-7 border border-border card-hover cursor-pointer"
              onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
            >
              <div className="w-12 h-12 rounded-xl bg-rose-soft flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <s.icon size={22} className="text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">{s.title}</h3>
              <p className="text-body text-sm">{s.desc}</p>
              {expandedIdx === i && (
                <p className="text-body text-sm mt-3 pt-3 border-t border-border animate-fade-in">{s.detail}</p>
              )}
              <button className="mt-4 font-body text-sm font-medium text-primary hover:underline transition-all">
                {expandedIdx === i ? "Show Less" : "Learn More →"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
