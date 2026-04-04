import doctorImage from "@/assets/doctor-profile.webp";
import { useEffect, useRef, useState } from "react";
import { GraduationCap, Stethoscope, Heart, Award, ArrowRight } from "lucide-react";

const qualifications = [
  { icon: GraduationCap, title: "MBBS", desc: "Bachelor of Medicine and Bachelor of Surgery" },
  { icon: Stethoscope, title: "CCEBDM (Diabetology)", desc: "Certificate Course in Evidence Based Diabetes Management" },
  { icon: Heart, title: "PGDCC", desc: "Post Graduate Diploma in Clinical Cosmetology" },
  { icon: Award, title: "Fellowship in Aesthetic Medicine", desc: "Advanced training in aesthetic and cosmetic procedures" },
];

const AboutSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

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
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="deferred-section section-glow py-24 lg:py-32 bg-cream section-padding overflow-hidden">
      <div className="absolute inset-0 motion-grid opacity-35 pointer-events-none" />
      <div className="absolute pointer-events-none -left-16 top-32 h-56 w-56 motion-orb opacity-70" />

      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className={`relative transition-all duration-1000 ease-out ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}>
            <div className="spotlight-card rounded-[2rem] overflow-hidden shadow-2xl shadow-black/10 group bg-card/60">
              <img
                src={doctorImage}
                alt="Dr. Vishikant Sharma at Sharma Cosmo Clinic in Noida"
                className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105 group-hover:rotate-[1deg]"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div
              className={`absolute -bottom-6 -right-4 sm:right-6 glass-panel rounded-2xl p-5 shadow-xl transition-all duration-700 ${
                visible ? "opacity-100 scale-100" : "opacity-0 scale-75"
              }`}
              style={{ transitionDelay: "0.5s", animation: visible ? "float 3.6s ease-in-out 0.8s infinite" : undefined }}
            >
              <p className="font-display text-3xl font-bold text-primary">12+</p>
              <p className="font-body text-sm text-muted-foreground">Years of<br />Excellence</p>
            </div>
          </div>

          <div className={`transition-all duration-1000 ease-out ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`} style={{ transitionDelay: "0.2s" }}>
            <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-4">Our Doctor</p>
            <h2 className="heading-display text-3xl sm:text-4xl lg:text-[2.75rem] mb-2">
              Dr. Vishikant Sharma
            </h2>
            <p className="text-body text-base mb-6 max-w-lg">
              MBBS, CCEBDM (Diabetology), PGDCC, and Fellowship in Aesthetic Medicine.
              Dr. Vishikant Sharma brings together medical practice, clinical cosmetology, and
              aesthetic medicine to offer thoughtful, personalized consultations at Sharma Cosmo
              Clinic.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {qualifications.map((item, i) => (
                <div
                  key={item.title}
                  className={`spotlight-card glass-panel group rounded-2xl p-5 transition-all duration-700 hover:-translate-y-2 ${
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${0.45 + i * 0.12}s` }}
                >
                  <div className="w-11 h-11 rounded-xl bg-rose-soft flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-105">
                    <item.icon size={20} className="text-primary" />
                  </div>
                  <p className="font-body font-semibold text-foreground text-sm mb-1">{item.title}</p>
                  <p className="font-body text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>

            <a
              href="#appointment"
              className={`btn-primary inline-flex items-center gap-2 transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "0.95s" }}
            >
              Book a Consultation
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
