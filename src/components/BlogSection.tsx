import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

import { blogPosts } from "@/data/blogPosts";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const getCardsPerView = () => {
  if (typeof window === "undefined") return 1;
  return window.innerWidth >= 1024 ? 2 : 1;
};

const BlogSection = () => {
  const sectionRef = useScrollReveal<HTMLElement>();
  const [cardsPerView, setCardsPerView] = useState(getCardsPerView);
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    const handleResize = () => setCardsPerView(getCardsPerView());

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pageGroups = [];
  for (let index = 0; index < blogPosts.length; index += cardsPerView) {
    pageGroups.push(blogPosts.slice(index, index + cardsPerView));
  }

  const totalPages = Math.max(1, pageGroups.length);
  const totalFaqs = blogPosts.reduce((sum, post) => sum + post.faqs.length, 0);
  const totalSections = blogPosts.reduce((sum, post) => sum + post.sections.length, 0);

  useEffect(() => {
    setActivePage((current) => Math.min(current, totalPages - 1));
  }, [totalPages]);

  const goToPage = (nextPage: number) => {
    const bounded = Math.max(0, Math.min(nextPage, totalPages - 1));
    setActivePage(bounded);
  };

  return (
    <section
      id="blogs"
      ref={sectionRef}
      className="deferred-section section-glow reveal relative overflow-hidden bg-gradient-to-b from-background via-cream to-background py-24 lg:py-32 section-padding"
    >
      <div className="absolute inset-0 motion-grid opacity-30 pointer-events-none" />
      <div className="absolute pointer-events-none left-0 top-20 h-56 w-56 motion-orb-gold opacity-60" />

      <div className="section-container">
        <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-end mb-14">
          <div>
            <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-4">Clinic knowledge slider</p>
            <h2 className="heading-display text-3xl sm:text-4xl lg:text-[2.85rem] mb-5">
              Swipe through deeper treatment guides before opening the full blog
            </h2>
            <p className="text-body max-w-3xl">
              Home page par ab compact but richer blog preview slider diya gaya hai. Har slide me
              topic summary ke saath practical context, guide coverage, FAQs, aur inside-the-article
              topics ka snapshot milta hai, so patients can understand more before clicking in.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            <div className="glass-panel rounded-2xl px-4 py-5 text-center shadow-sm">
              <p className="font-display text-2xl sm:text-3xl text-primary mb-1">{blogPosts.length}</p>
              <p className="font-body text-xs sm:text-sm text-muted-foreground">Guides in slider</p>
            </div>
            <div className="glass-panel rounded-2xl px-4 py-5 text-center shadow-sm">
              <p className="font-display text-2xl sm:text-3xl text-primary mb-1">{totalSections}</p>
              <p className="font-body text-xs sm:text-sm text-muted-foreground">Topic sections</p>
            </div>
            <div className="glass-panel rounded-2xl px-4 py-5 text-center shadow-sm">
              <p className="font-display text-2xl sm:text-3xl text-primary mb-1">{totalFaqs}</p>
              <p className="font-body text-xs sm:text-sm text-muted-foreground">Helpful FAQs</p>
            </div>
            <div className="glass-panel rounded-2xl px-4 py-5 text-center shadow-sm">
              <p className="font-display text-2xl sm:text-3xl text-primary mb-1">Hair + Skin</p>
              <p className="font-body text-xs sm:text-sm text-muted-foreground">High-intent guides</p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-2">Featured blog slider</p>
            <p className="text-body max-w-2xl">
              Preview cards ko expand kiya gaya hai so each guide now shows more useful content
              directly on the homepage instead of pushing everything into separate sections.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground">
              {activePage + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(activePage - 1)}
              disabled={activePage === 0}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Previous blog slide"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => goToPage(activePage + 1)}
              disabled={activePage === totalPages - 1}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Next blog slide"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activePage * 100}%)` }}
          >
            {pageGroups.map((group, pageIndex) => (
              <div key={`blog-page-${pageIndex}`} className="min-w-full">
                <div className="grid gap-6 lg:grid-cols-2">
                  {group.map((post) => (
                    <article
                      key={post.slug}
                      className="spotlight-card flex h-full flex-col rounded-[2rem] border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-black/5 sm:p-7"
                    >
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-soft">
                            <BookOpen size={20} className="text-primary" />
                          </div>
                          <div>
                            <p className="font-body text-xs uppercase tracking-[0.14em] text-primary">
                              {post.category}
                            </p>
                            <p className="font-body text-sm text-muted-foreground">{post.readTime}</p>
                          </div>
                        </div>

                        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                          {post.publishedLabel}
                        </span>
                      </div>

                      <h3 className="font-display text-2xl text-foreground mb-3">{post.title}</h3>
                      <p className="text-body text-sm mb-4">{post.summary}</p>
                      <p className="text-body text-sm mb-5">{post.intro[0]}</p>

                      <div className="mb-5 flex flex-wrap gap-2">
                        {post.keywords.slice(0, 4).map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>

                      <div className="mb-5 rounded-[1.5rem] border border-border bg-secondary/50 p-4">
                        <p className="font-body text-xs uppercase tracking-[0.14em] text-primary mb-3">Inside this guide</p>
                        <div className="grid gap-2">
                          {post.sections.slice(0, 3).map((section) => (
                            <div key={section.heading} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                              <span>{section.heading}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-6 grid gap-2">
                        {post.highlights.map((highlight) => (
                          <div key={highlight} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                          <span>{post.sections.length} sections</span>
                          <span>{post.faqs.length} FAQs</span>
                        </div>

                        <Link
                          to={`/blogs/${post.slug}`}
                          className="inline-flex items-center gap-2 text-sm font-medium text-primary"
                        >
                          Read the full guide
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {totalPages > 1 ? (
          <div className="mt-6 flex justify-center gap-2">
            {pageGroups.map((_, index) => (
              <button
                key={`blog-dot-${index}`}
                type="button"
                onClick={() => goToPage(index)}
                aria-label={`Go to blog slide ${index + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  index === activePage ? "w-10 bg-primary" : "w-2.5 bg-primary/25 hover:bg-primary/45"
                }`}
              />
            ))}
          </div>
        ) : null}

        <div className="glass-panel mt-12 rounded-3xl px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-display text-2xl text-foreground mb-2">Need help choosing the right treatment?</p>
              <p className="text-body max-w-2xl">
                Slider se topic samajh lo, phir consultation book karke apne skin, scalp, budget,
                routine, and treatment timeline ke hisaab se personalized plan le lo.
              </p>
            </div>

            <a href="#appointment" className="btn-primary inline-flex items-center gap-2 self-start lg:self-auto">
              Book consultation
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
