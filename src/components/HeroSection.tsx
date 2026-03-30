import { useEffect, useState } from "react";
import heroImage from "@/assets/hero-clinic.jpg";

const HeroSection = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Sharma Cosmo Clinic Noida - Best Skin and Hair Treatment Center"
          className={`w-full h-full object-cover transition-transform duration-[1.5s] ease-out ${loaded ? "scale-100" : "scale-110"}`}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/10 blur-[80px] transition-opacity duration-[2s] ${loaded ? "opacity-100" : "opacity-0"}`} />
        <div className={`absolute bottom-1/3 right-1/3 w-48 h-48 rounded-full bg-primary/5 blur-[60px] transition-opacity duration-[2.5s] delay-500 ${loaded ? "opacity-100 animate-float" : "opacity-0"}`} />
      </div>

      <div className="relative section-container section-padding pt-32 pb-20 lg:pt-0">
        <div className="max-w-xl">
          <p
            className={`font-body text-sm uppercase tracking-[0.2em] text-rose-medium mb-6 transition-all duration-1000 ease-out ${loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-16"}`}
            style={{ transitionDelay: "0.3s" }}
          >
            Best Skin & Hair Clinic in Noida
          </p>
          <h1
            className={`heading-display text-4xl sm:text-5xl lg:text-6xl text-primary-foreground mb-6 transition-all duration-1000 ease-out ${loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20"}`}
            style={{ transitionDelay: "0.5s", lineHeight: "1.08" }}
          >
            Sharma Cosmo Clinic — Skin & Hair Experts in Noida
          </h1>
          <p
            className={`font-body text-base sm:text-lg text-primary-foreground/80 mb-10 max-w-md leading-relaxed transition-all duration-1000 ease-out ${loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-16"}`}
            style={{ transitionDelay: "0.7s" }}
          >
            Advanced dermatology & cosmetic treatments by Dr. Visi Kant Sharma. 
            Your skin deserves the best care.
          </p>
          <div
            className={`flex flex-wrap gap-4 transition-all duration-1000 ease-out ${loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}
            style={{ transitionDelay: "0.9s" }}
          >
            <a href="#appointment" className="btn-primary group">
              <span className="relative z-10">Book Appointment</span>
            </a>
            <a href="#services" className="btn-outline !border-primary-foreground/40 !text-primary-foreground hover:!bg-primary-foreground/10">
              Our Services
            </a>
          </div>

          <div
            className={`flex gap-10 mt-14 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "1.1s" }}
          >
            {[
              { num: "12+", label: "Years Experience" },
              { num: "8,500+", label: "Happy Patients" },
              { num: "15+", label: "Treatments" },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`transition-all duration-500 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
                style={{ transitionDelay: `${1.3 + i * 0.15}s` }}
              >
                <p className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground">{s.num}</p>
                <p className="font-body text-xs sm:text-sm text-primary-foreground/60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 ${loaded ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "1.8s" }}>
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex justify-center pt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground/60 animate-[slide-up_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
