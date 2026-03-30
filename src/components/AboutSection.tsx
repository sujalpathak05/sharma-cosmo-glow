import doctorImage from "@/assets/doctor-profile.jpg";
import { useEffect, useRef, useState } from "react";
import { GraduationCap, Stethoscope, Heart, Award } from "lucide-react";

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
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="py-24 lg:py-32 bg-cream section-padding overflow-hidden">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className={`relative transition-all duration-1000 ease-out ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}>
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/10 group">
              <img
                src={doctorImage}
                alt="Dr. Visi Kant Sharma - Lead Dermatologist at Sharma Cosmo Clinic Noida"
                className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className={`absolute -bottom-6 -right-4 sm:right-6 bg-card rounded-xl p-5 shadow-xl shadow-black/8 transition-all duration-700 ${visible ? "opacity-100 scale-100 animate-float" : "opacity-0 scale-75"}`} style={{ transitionDelay: "0.5s" }}>
              <p className="font-display text-3xl font-bold text-primary">12+</p>
              <p className="font-body text-sm text-muted-foreground">Years of<br/>Excellence</p>
            </div>
          </div>

          {/* Content */}
          <div className={`transition-all duration-1000 ease-out ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`} style={{ transitionDelay: "0.2s" }}>
            <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-4">Our Doctor</p>
            <h2 className="heading-display text-3xl sm:text-4xl lg:text-[2.75rem] mb-2">
              Dr. Visi Kant Sharma
            </h2>
            <p className="text-body text-base mb-6 max-w-lg">
              MBBS, CCEBDM (Diabetology), PGDCC, and Fellowship in Aesthetic Medicine. 
              Dr. Visi Kant Sharma brings together medical expertise and aesthetic care to offer 
              thoughtful, personalized consultations at Sharma Cosmo Clinic.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {qualifications.map((item, i) => (
                <div
                  key={item.title}
                  className={`bg-card rounded-xl p-5 border border-border transition-all duration-700 hover:shadow-lg hover:-translate-y-1 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{ transitionDelay: `${0.5 + i * 0.12}s` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-rose-soft flex items-center justify-center mb-3">
                    <item.icon size={20} className="text-primary" />
                  </div>
                  <p className="font-body text-xs uppercase tracking-wider text-primary mb-1">Qualification</p>
                  <p className="font-body font-semibold text-foreground text-sm">{item.title}</p>
                </div>
              ))}
            </div>

            <a
              href="#appointment"
              className={`btn-primary inline-block transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "1s" }}
            >
              Book a Consultation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
