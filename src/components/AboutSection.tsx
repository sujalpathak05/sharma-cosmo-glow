import doctorImage from "@/assets/doctor-profile.jpg";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Award, GraduationCap, Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const credentials = [
  { icon: GraduationCap, title: "MBBS, MD Dermatology", desc: "Board-certified dermatologist with advanced training in cosmetic procedures" },
  { icon: Award, title: "Award-Winning Practice", desc: "Recognized for clinical excellence and patient satisfaction" },
  { icon: Heart, title: "Patient-First Approach", desc: "Personalized treatment plans tailored to your unique skin needs" },
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
          {/* Image - slides from left */}
          <div className={`relative transition-all duration-1000 ease-out ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}>
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/10 group">
              <img
                src={doctorImage}
                alt="Dr. Sharma - Lead Dermatologist"
                className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            {/* Floating badge with bounce-in */}
            <div className={`absolute -bottom-6 -right-4 sm:right-6 bg-card rounded-xl p-5 shadow-xl shadow-black/8 transition-all duration-700 ${visible ? "opacity-100 scale-100 animate-float" : "opacity-0 scale-75"}`} style={{ transitionDelay: "0.5s" }}>
              <p className="font-display text-3xl font-bold text-primary">12+</p>
              <p className="font-body text-sm text-muted-foreground">Years of<br/>Excellence</p>
            </div>
          </div>

          {/* Content - slides from right */}
          <div className={`transition-all duration-1000 ease-out ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`} style={{ transitionDelay: "0.2s" }}>
            <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-4">About Us</p>
            <h2 className="heading-display text-3xl sm:text-4xl lg:text-[2.75rem] mb-6">
              Trusted Skin & Cosmetology Care
            </h2>
            <p className="text-body text-base mb-8 max-w-lg">
              Sharma Cosmo Clinic is a premier skincare and cosmetic center dedicated to helping you 
              look and feel your absolute best. With over a decade of expertise, we combine advanced 
              medical technology with personalized care to deliver exceptional results.
            </p>

            <div className="space-y-5 mb-10">
              {credentials.map((item, i) => (
                <div
                  key={item.title}
                  className={`flex gap-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{ transitionDelay: `${0.5 + i * 0.15}s` }}
                >
                  <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-rose-soft flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-body font-semibold text-foreground text-sm">{item.title}</p>
                    <p className="font-body text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="#appointment"
              className={`btn-primary inline-block transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "1s" }}
            >
              Meet Our Doctor
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
