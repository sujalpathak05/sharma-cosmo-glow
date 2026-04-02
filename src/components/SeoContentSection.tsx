import { ArrowRight, MapPin, Search, Stethoscope } from "lucide-react";

import FaqAccordion from "@/components/FaqAccordion";
import { homeFaqs, homeKeywordClusters, homeSeoBlocks } from "@/data/homeSeo";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const iconMap = [Search, Stethoscope, MapPin];

const SeoContentSection = () => {
  const sectionRef = useScrollReveal<HTMLElement>();

  return (
    <section
      id="seo-content"
      ref={sectionRef}
      className="deferred-section section-glow reveal relative overflow-hidden bg-gradient-to-b from-background via-cream to-background py-24 lg:py-32 section-padding"
    >
      <div className="absolute inset-0 motion-grid opacity-30 pointer-events-none" />
      <div className="absolute pointer-events-none right-0 top-16 h-64 w-64 motion-orb-gold opacity-60" />

      <div className="section-container">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-4">Delhi NCR Skin and Hair Care</p>
          <h2 className="heading-display text-3xl sm:text-4xl lg:text-[2.9rem] mb-5">
            Skin clinic in Noida serving Delhi NCR with focused acne, hair, laser, and anti-aging care
          </h2>
          <p className="text-body text-base sm:text-lg">
            Sharma Cosmo Clinic is built for patients who want a doctor-led consultation, clear
            treatment sequencing, and follow-up that is easy to manage from Noida and nearby Delhi
            NCR locations. The content below answers the same high-intent questions patients often
            ask before booking.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {homeKeywordClusters.map((cluster, index) => {
            const Icon = iconMap[index] ?? Search;

            return (
              <article
                key={cluster.title}
                className="glass-panel rounded-[1.75rem] p-6 shadow-sm"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-soft">
                  <Icon size={22} className="text-primary" />
                </div>
                <h3 className="font-display text-2xl text-foreground mb-3">{cluster.title}</h3>
                <p className="text-body text-sm mb-4">{cluster.description}</p>
                <div className="flex flex-wrap gap-2">
                  {cluster.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-border bg-white/85 px-3 py-1.5 text-xs font-medium text-foreground"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-14 grid gap-6 xl:grid-cols-2">
          {homeSeoBlocks.map((block) => (
            <article
              key={block.title}
              className="rounded-[2rem] border border-border bg-card p-7 shadow-sm sm:p-8"
            >
              <h3 className="font-display text-2xl text-foreground sm:text-[2rem]">{block.title}</h3>
              <div className="mt-5 space-y-4">
                {block.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-body text-sm sm:text-base">
                    {paragraph}
                  </p>
                ))}
              </div>

              {block.bullets && block.bullets.length > 0 ? (
                <ul className="mt-6 space-y-3">
                  {block.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-sm text-muted-foreground sm:text-base">
                      <span className="mt-2 inline-block h-2 w-2 rounded-full bg-primary" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-[2rem] border border-[#ead7b0] bg-[#fff8ed] p-7 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="font-body text-sm uppercase tracking-[0.15em] text-[#a16c23] mb-3">Treatment planning</p>
              <h3 className="font-display text-2xl text-foreground sm:text-[2rem]">
                Looking for a cosmetic clinic near you that explains the next step clearly?
              </h3>
              <p className="mt-4 text-body text-sm sm:text-base">
                Use the consultation to understand the likely cause, the realistic timeline,
                procedure suitability, aftercare needs, and whether the treatment plan is designed
                for your concern rather than for a generic package.
              </p>
            </div>

            <a href="#appointment" className="btn-primary inline-flex items-center gap-2 self-start lg:self-auto">
              Book a consultation
              <ArrowRight size={16} />
            </a>
          </div>
        </div>

        <div className="mt-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-4">FAQs</p>
            <h3 className="heading-display text-3xl sm:text-4xl mb-4">
              Frequently asked questions about skin, hair, laser, and anti-aging care
            </h3>
            <p className="text-body">
              These answers are written to support featured-snippet style search intent while
              keeping the clinic location and service scope accurate.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <FaqAccordion items={homeFaqs} className="space-y-4" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeoContentSection;
