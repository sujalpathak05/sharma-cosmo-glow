import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

import { blogPosts } from "@/data/blogPosts";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const BlogSection = () => {
  const sectionRef = useScrollReveal<HTMLElement>();

  return (
    <section
      id="blogs"
      ref={sectionRef}
      className="deferred-section section-glow reveal relative overflow-hidden bg-gradient-to-b from-background via-cream to-background py-24 lg:py-32 section-padding"
    >
      <div className="absolute inset-0 motion-grid opacity-30 pointer-events-none" />
      <div className="absolute pointer-events-none left-0 top-20 h-56 w-56 motion-orb-gold opacity-60" />

      <div className="section-container">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end mb-14">
          <div>
            <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-4">Long-form blog content</p>
            <h2 className="heading-display text-3xl sm:text-4xl lg:text-[2.85rem] mb-5">
              Deep treatment guides built for high-intent search traffic
            </h2>
            <p className="text-body max-w-3xl">
              These blog pages are written as detailed treatment resources, not thin filler
              content. Each guide covers a specific topic in depth, includes practical FAQs, and
              targets the queries patients actually search before they decide where to book.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            <div className="glass-panel rounded-2xl px-4 py-5 text-center shadow-sm">
              <p className="font-display text-2xl sm:text-3xl text-primary mb-1">{blogPosts.length}</p>
              <p className="font-body text-xs sm:text-sm text-muted-foreground">Detailed guides</p>
            </div>
            <div className="glass-panel rounded-2xl px-4 py-5 text-center shadow-sm">
              <p className="font-display text-2xl sm:text-3xl text-primary mb-1">1500+</p>
              <p className="font-body text-xs sm:text-sm text-muted-foreground">Words per post</p>
            </div>
            <div className="glass-panel rounded-2xl px-4 py-5 text-center shadow-sm">
              <p className="font-display text-2xl sm:text-3xl text-primary mb-1">FAQ</p>
              <p className="font-body text-xs sm:text-sm text-muted-foreground">Featured snippet ready</p>
            </div>
            <div className="glass-panel rounded-2xl px-4 py-5 text-center shadow-sm">
              <p className="font-display text-2xl sm:text-3xl text-primary mb-1">SEO</p>
              <p className="font-body text-xs sm:text-sm text-muted-foreground">Local plus service intent</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="spotlight-card rounded-[2rem] border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-xl hover:shadow-black/5 sm:p-7"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
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
              <p className="text-body text-sm mb-5">{post.summary}</p>

              <div className="mb-6 flex flex-wrap gap-2">
                {post.keywords.slice(0, 3).map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              <div className="mb-6 grid gap-2">
                {post.highlights.map((highlight) => (
                  <div key={highlight} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>

              <Link
                to={`/blogs/${post.slug}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary"
              >
                Read the full guide
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>

        <div className="glass-panel mt-12 rounded-3xl px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-display text-2xl text-foreground mb-2">Need help choosing the right treatment?</p>
              <p className="text-body max-w-2xl">
                Read the guides for context, then book a consultation if you want a plan built
                around your skin, scalp, time, and budget rather than generic internet advice.
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
