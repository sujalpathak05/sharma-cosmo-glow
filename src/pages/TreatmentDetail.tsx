import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import FaqAccordion from "@/components/FaqAccordion";
import NotFound from "@/pages/NotFound";
import { treatments } from "@/data/treatments";
import { clinicContact } from "@/lib/contactDetails";

const TreatmentDetail = () => {
  const { slug } = useParams();
  const treatment = treatments.find((item) => item.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!treatment) {
    return <NotFound />;
  }

  const relatedTreatments = treatments
    .filter((item) => item.category === treatment.category && item.slug !== treatment.slug)
    .slice(0, 3);

  const canonicalUrl = `https://sharmacosmoclinic.com/treatments/${treatment.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalProcedure",
        name: treatment.title,
        description: treatment.metaDescription,
        url: canonicalUrl,
        provider: {
          "@type": "MedicalClinic",
          name: "Sharma Cosmo Clinic",
          address: clinicContact.addressInline,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: treatment.faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{treatment.pageTitle} | Sharma Cosmo Clinic</title>
        <meta name="description" content={treatment.metaDescription} />
        <meta name="keywords" content={treatment.keywords.join(", ")} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${treatment.pageTitle} | Sharma Cosmo Clinic`} />
        <meta property="og:description" content={treatment.metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:title" content={`${treatment.pageTitle} | Sharma Cosmo Clinic`} />
        <meta name="twitter:description" content={treatment.metaDescription} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-background via-cream to-background section-padding">
        <div className="section-container max-w-5xl py-24 lg:py-28">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/"
              className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground"
            >
              Sharma <span className="text-primary">Cosmo</span> <span className="text-rose-500">Clinic</span>
            </Link>

            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ArrowLeft size={16} />
              Back to treatments
            </Link>
          </div>

          <section className="rounded-[2rem] border border-border bg-card p-7 shadow-sm sm:p-10">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-rose-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Treatment
              </span>
              <span className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground">
                {treatment.category}
              </span>
            </div>

            <div className="mb-8 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-rose-soft">
                <Sparkles size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="heading-display text-3xl sm:text-4xl lg:text-[3rem] mb-2">{treatment.title}</h1>
                <p className="font-body text-base text-primary mb-4">{treatment.tagline}</p>
                <p className="text-body text-base sm:text-lg max-w-3xl">{treatment.summary}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {treatment.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-2xl border border-border bg-secondary/70 px-4 py-4 text-sm text-muted-foreground"
                >
                  {highlight}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link to="/appointment" className="btn-primary inline-flex items-center gap-2">
                Book Appointment
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-border bg-card p-7 shadow-sm sm:p-10">
            <div className="space-y-6">
              {treatment.intro.map((paragraph) => (
                <p key={paragraph} className="text-body text-base sm:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <div className="mt-8 space-y-8">
            {treatment.sections.map((section) => (
              <section
                key={section.heading}
                className="rounded-[2rem] border border-border bg-card p-7 shadow-sm sm:p-10"
              >
                <h2 className="heading-display text-2xl sm:text-3xl mb-5">{section.heading}</h2>
                <div className="space-y-5">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-body text-base sm:text-lg">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {section.bullets && section.bullets.length > 0 ? (
                  <ul className="mt-6 space-y-3">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3 text-sm text-muted-foreground sm:text-base">
                        <span className="mt-2 inline-block h-2 w-2 rounded-full bg-primary" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <section className="mt-8 rounded-[2rem] border border-border bg-card p-7 shadow-sm sm:p-10">
            <div className="mb-8">
              <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-3">FAQs</p>
              <h2 className="heading-display text-2xl sm:text-3xl mb-4">Frequently asked questions</h2>
              <p className="text-body">
                Answers to the questions patients most often ask before booking {treatment.title.toLowerCase()}.
              </p>
            </div>

            <FaqAccordion items={treatment.faqs} className="space-y-4" />
          </section>

          {relatedTreatments.length > 0 && (
            <section className="mt-8">
              <div className="mb-6">
                <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-3">Related Treatments</p>
                <h2 className="heading-display text-2xl sm:text-3xl">You May Also Be Interested In</h2>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {relatedTreatments.map((relatedTreatment) => (
                  <Link
                    key={relatedTreatment.slug}
                    to={`/treatments/${relatedTreatment.slug}`}
                    className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-black/5"
                  >
                    <p className="font-body text-xs uppercase tracking-[0.14em] text-primary mb-2">
                      {relatedTreatment.category}
                    </p>
                    <h3 className="font-display text-xl text-foreground mb-3">{relatedTreatment.title}</h3>
                    <p className="text-body text-sm mb-4">{relatedTreatment.summary}</p>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                      View treatment
                      <ArrowRight size={15} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="mt-8 rounded-[2rem] border border-border bg-gradient-to-br from-primary/10 via-card to-card p-7 shadow-sm sm:p-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-display text-2xl text-foreground mb-2">
                  Ready to start your {treatment.title.toLowerCase()}?
                </p>
                <p className="text-body max-w-2xl">
                  Book a consultation at Sharma Cosmo Clinic, {clinicContact.addressInline}, and get a
                  treatment plan built around your skin or hair, your goals, and what will realistically work for you.
                </p>
              </div>

              <Link to="/appointment" className="btn-primary inline-flex items-center gap-2 self-start lg:self-auto">
                Book Appointment
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default TreatmentDetail;
