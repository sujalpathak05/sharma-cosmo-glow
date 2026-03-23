import heroImage from "@/assets/hero-clinic.jpg";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Sharma Cosmo Clinic treatment room"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
      </div>

      <div className="relative section-container section-padding pt-32 pb-20 lg:pt-0">
        <div className="max-w-xl">
          <p
            className="font-body text-sm uppercase tracking-[0.2em] text-rose-medium mb-6 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            Welcome to Sharma Cosmo Clinic
          </p>
          <h1
            className="heading-display text-4xl sm:text-5xl lg:text-6xl text-primary-foreground mb-6 animate-fade-up"
            style={{ animationDelay: "0.25s", lineHeight: "1.08" }}
          >
            Enhancing Your Natural Beauty
          </h1>
          <p
            className="font-body text-base sm:text-lg text-primary-foreground/80 mb-10 max-w-md leading-relaxed animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            Experience world-class dermatology and cosmetic treatments in a luxurious, 
            caring environment. Your skin deserves the best.
          </p>
          <div
            className="flex flex-wrap gap-4 animate-fade-up"
            style={{ animationDelay: "0.55s" }}
          >
            <a href="#appointment" className="btn-primary">
              Book Appointment
            </a>
            <a href="#services" className="btn-outline !border-primary-foreground/40 !text-primary-foreground hover:!bg-primary-foreground/10">
              Our Services
            </a>
          </div>

          {/* Stats */}
          <div
            className="flex gap-10 mt-14 animate-fade-up"
            style={{ animationDelay: "0.7s" }}
          >
            {[
              { num: "12+", label: "Years Experience" },
              { num: "8,500+", label: "Happy Patients" },
              { num: "15+", label: "Treatments" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground">{s.num}</p>
                <p className="font-body text-xs sm:text-sm text-primary-foreground/60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
