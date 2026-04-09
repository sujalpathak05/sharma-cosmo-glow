import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-clinic.jpg";

const heroHighlights = [
  "Personalized acne and pigmentation care",
  "PRP hair treatment and scalp support",
  "Laser hair removal and anti-aging planning",
];

const highlightedPhrases = ["acne treatment", "PRP hair treatment"];

const heroCards = [
  {
    title: "Tailored Treatment Plans",
    text: "Every consultation is built around your skin, hair, lifestyle, and the concern you want to solve first.",
  },
  {
    title: "Clinic-Led Follow Through",
    text: "From first visit to follow-up guidance, the care pathway stays clear, calm, and easy to revisit.",
  },
];

const stats = [
  { num: "12+", label: "Years Experience" },
  { num: "8,500+", label: "Happy Patients" },
  { num: "15+", label: "Treatments" },
];

const HeroSection = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden bg-charcoal">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Sharma Cosmo Clinic Noida - Best Skin and Hair Treatment Center"
          className={`w-full h-full object-cover transition-transform ease-out ${loaded ? "scale-100" : "scale-110"}`}
          style={{ transitionDuration: "1500ms" }}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/88 via-foreground/62 to-foreground/28" />
        <div className="absolute inset-0 motion-grid mix-blend-soft-light" />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`motion-orb absolute -left-20 top-24 h-72 w-72 transition-opacity duration-1000 ${loaded ? "opacity-100" : "opacity-0"}`} />
        <div
          className={`motion-orb-gold absolute right-[12%] top-[18%] h-56 w-56 transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDuration: "1400ms" }}
        />
        <div
          className={`motion-orb absolute bottom-16 right-[30%] h-64 w-64 transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDuration: "1800ms" }}
        />
      </div>

      <div className="relative section-container section-padding pt-32 pb-20 lg:pt-0">
        <div className="grid items-center gap-12 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="max-w-2xl">
            <div
              className={`rounded-[2rem] border border-white/12 bg-black/20 p-6 shadow-[0_40px_120px_-56px_rgba(0,0,0,0.95)] backdrop-blur-md transition-all duration-1000 sm:p-8 lg:p-10 ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div
                className={`inline-flex items-center gap-2 rounded-full glass-panel px-4 py-2 text-sm text-primary-foreground/90 transition-all duration-1000 ${
                  loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                }`}
              >
                <Sparkles size={15} className="text-gold" />
                Skin clinic in Noida serving Delhi NCR
              </div>

              <p
                className={`font-body text-sm uppercase tracking-[0.2em] text-rose-medium mt-7 mb-5 transition-all duration-1000 ease-out ${
                  loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-16"
                }`}
                style={{ transitionDelay: "0.15s" }}
              >
                Skin clinic near Delhi in Noida
              </p>

              <h1 className="space-y-3" style={{ textShadow: "0 10px 35px rgba(0,0,0,0.5)" }}>
                <div className="overflow-hidden">
                  <span
                    className={`block heading-display text-4xl sm:text-5xl lg:text-6xl text-primary-foreground transition-all duration-1000 ease-out ${
                      loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
                    }`}
                    style={{ transitionDelay: "0.28s", lineHeight: "1.08" }}
                  >
                    Skin, hair, and aesthetic care
                  </span>
                </div>

                <div className="overflow-hidden">
                  <div
                    className={`flex flex-wrap gap-3 transition-all duration-1000 ease-out ${
                      loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
                    }`}
                    style={{ transitionDelay: "0.42s" }}
                  >
                    {highlightedPhrases.map((phrase) => (
                      <span
                        key={phrase}
                        className="inline-flex rounded-[1.05rem] border border-white/20 px-4 py-1.5 font-display text-2xl sm:text-3xl lg:text-4xl text-charcoal shadow-[0_24px_50px_-30px_rgba(0,0,0,0.85)]"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(255,248,238,0.98), rgba(246,214,152,0.96))",
                        }}
                      >
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden">
                  <span
                    className={`block heading-display text-4xl sm:text-5xl lg:text-6xl text-primary-foreground transition-all duration-1000 ease-out ${
                      loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
                    }`}
                    style={{ transitionDelay: "0.56s", lineHeight: "1.08" }}
                  >
                    for Noida and Delhi NCR patients.
                  </span>
                </div>
              </h1>

              <div className="overflow-hidden mt-6">
                <p
                  className={`font-body text-base sm:text-lg text-primary-foreground/84 max-w-xl leading-relaxed transition-all duration-1000 ease-out ${
                    loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
                  }`}
                  style={{ transitionDelay: "0.72s" }}
                >
                  Doctor-led care by Dr. Vishikant Sharma for acne treatment, chemical peel treatment,
                  PRP hair treatment, laser hair removal planning, botox consultations, and anti-aging
                  treatment that stays personal from day one.
                </p>
              </div>

              <div
                className={`grid gap-3 mb-10 mt-8 sm:grid-cols-2 transition-all duration-1000 ease-out ${
                  loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
                }`}
                style={{ transitionDelay: "0.86s" }}
              >
                {heroHighlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/40 px-4 py-3 text-sm text-charcoal shadow-[0_22px_50px_-34px_rgba(0,0,0,0.85)] backdrop-blur-md"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,250,245,0.95), rgba(244,226,210,0.92))",
                    }}
                  >
                    <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-gold align-middle shadow-[0_0_0_4px_rgba(215,154,74,0.14)]" />
                    <span className="align-middle font-semibold">{item}</span>
                  </div>
                ))}
              </div>

              <div
                className={`flex flex-wrap gap-4 transition-all duration-1000 ease-out ${
                  loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: "1s" }}
              >
                <a href="#appointment" className="btn-primary group inline-flex items-center gap-2">
                  <span>Book Appointment</span>
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                <a
                  href="#services"
                  className="btn-outline group inline-flex items-center gap-2 !border-primary-foreground/40 !text-primary-foreground hover:!bg-primary-foreground/10"
                >
                  <span>Our Services</span>
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            <div
              className={`grid gap-4 mt-8 sm:grid-cols-3 transition-all duration-1000 ease-out ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "1.1s" }}
            >
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="rounded-[1.7rem] border border-white/45 px-5 py-4 backdrop-blur-md shadow-[0_28px_60px_-36px_rgba(0,0,0,0.75)]"
                  style={{
                    ...(loaded ? { animation: `float 3.6s ease-in-out ${1.2 + index * 0.3}s infinite` } : {}),
                    background:
                      "linear-gradient(135deg, rgba(255,250,245,0.96), rgba(244,226,210,0.9))",
                  }}
                >
                  <p className="font-display text-3xl sm:text-4xl font-bold text-charcoal drop-shadow-[0_12px_24px_rgba(255,255,255,0.28)]">
                    {stat.num}
                  </p>
                  <p className="mt-2 inline-flex rounded-full bg-white/75 px-3 py-1 font-body text-xs sm:text-sm font-semibold text-primary shadow-[0_10px_24px_-18px_rgba(0,0,0,0.55)]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden xl:flex flex-col gap-5 justify-self-end">
            {heroCards.map((card, index) => (
              <div
                key={card.title}
                className={`glass-panel spotlight-card rounded-[1.75rem] p-6 text-left transition-all duration-1000 ${
                  loaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16"
                }`}
                style={{
                  transitionDelay: `${1 + index * 0.16}s`,
                  animation: loaded ? `float ${4.2 + index * 0.6}s ease-in-out ${1.4 + index * 0.25}s infinite` : undefined,
                }}
              >
                <p className="font-body text-xs uppercase tracking-[0.16em] text-primary mb-3">Clinic Experience</p>
                <p
                  className="inline-block rounded-[1.15rem] px-4 py-2 font-display text-2xl leading-tight text-charcoal shadow-[0_24px_60px_-34px_rgba(0,0,0,0.8)] mb-4"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,249,242,0.98), rgba(244,213,169,0.92))",
                  }}
                >
                  {card.title}
                </p>
                <p className="font-body text-sm leading-relaxed text-foreground/80">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDelay: "1.5s" }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex justify-center pt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground/60 animate-[slide-up_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
