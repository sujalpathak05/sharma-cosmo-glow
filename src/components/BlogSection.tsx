import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { blogPosts } from "@/data/blogPosts";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const filters = ["All", "Hair Treatment", "Skin Treatment"] as const;

type BlogFilter = (typeof filters)[number];

const BlogSection = () => {
  const headerRef = useScrollReveal<HTMLDivElement>();
  const ctaRef = useScrollReveal<HTMLDivElement>();
  const [activeFilter, setActiveFilter] = useState<BlogFilter>("All");
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  const filteredPosts =
    activeFilter === "All"
      ? blogPosts
      : blogPosts.filter((post) => post.category === activeFilter);

  useEffect(() => {
    if (!api) {
      return;
    }

    const updateSlides = () => {
      setCurrentSlide(api.selectedScrollSnap());
      setSlideCount(api.scrollSnapList().length);
    };

    updateSlides();
    api.on("select", updateSlides);
    api.on("reInit", updateSlides);

    return () => {
      api.off("select", updateSlides);
      api.off("reInit", updateSlides);
    };
  }, [api]);

  const stats = [
    { label: "Expert blogs", value: `${blogPosts.length}+` },
    { label: "Hair care guides", value: `${blogPosts.filter((post) => post.category === "Hair Treatment").length}` },
    { label: "Skin care guides", value: `${blogPosts.filter((post) => post.category === "Skin Treatment").length}` },
  ];

  return (
    <section
      id="blogs"
      className="section-glow relative py-24 lg:py-32 bg-gradient-to-b from-background via-cream to-background section-padding overflow-hidden"
    >
      <div className="absolute inset-0 motion-grid opacity-30 pointer-events-none" />
      <div className="absolute pointer-events-none left-0 top-20 h-56 w-56 motion-orb-gold opacity-60" />
      <div className="section-container">
        <div
          ref={headerRef}
          className="reveal grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end mb-14"
        >
          <div>
            <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-4">Blog Section</p>
            <h2 className="heading-display text-3xl sm:text-4xl lg:text-[2.85rem] mb-5">
              Hair & Skin Care Blogs by Sharma Cosmo Clinic
            </h2>
            <p className="text-body max-w-3xl">
              Browse our clinic insights in a smooth slider. Open any blog card to move to a
              dedicated blog page with the full write-up and treatment-focused guidance.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass-panel rounded-2xl px-4 py-5 text-center shadow-sm"
              >
                <p className="font-display text-2xl sm:text-3xl text-primary mb-1">{stat.value}</p>
                <p className="font-body text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => {
              const isActive = activeFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/15"
                      : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-full border-border bg-card"
              onClick={() => api?.scrollPrev()}
            >
              <ArrowLeft />
              <span className="sr-only">Previous blogs</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-full border-border bg-card"
              onClick={() => api?.scrollNext()}
            >
              <ArrowRight />
              <span className="sr-only">Next blogs</span>
            </Button>
          </div>
        </div>

        <Carousel
          key={activeFilter}
          setApi={setApi}
          opts={{ align: "start", loop: filteredPosts.length > 1 }}
          className="w-full"
        >
          <CarouselContent>
            {filteredPosts.map((post) => (
              <CarouselItem key={post.slug} className="md:basis-1/2 xl:basis-1/3">
                <Link
                  to={`/blogs/${post.slug}`}
                  className="spotlight-card group block h-full rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-xl hover:shadow-black/5"
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
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        post.category === "Hair Treatment"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-sky-100 text-sky-700"
                      }`}
                    >
                      {post.category === "Hair Treatment" ? "Hair Care" : "Skin Care"}
                    </span>
                  </div>

                  <div className="flex h-full flex-col">
                    <h3 className="font-display text-2xl text-foreground mb-3 transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>
                    <p className="text-body text-sm mb-5">{post.summary}</p>

                    <div className="mb-6 grid gap-2">
                      {post.highlights.slice(0, 3).map((highlight) => (
                        <div key={highlight} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-primary">
                      Open blog
                      <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {Array.from({ length: slideCount }).map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to blog slide ${index + 1}`}
                onClick={() => api?.scrollTo(index)}
                className={`h-2.5 rounded-full transition-all ${
                  currentSlide === index ? "w-8 bg-primary" : "w-2.5 bg-primary/25 hover:bg-primary/45"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 sm:hidden">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-full border-border bg-card"
              onClick={() => api?.scrollPrev()}
            >
              <ArrowLeft />
              <span className="sr-only">Previous blogs</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-full border-border bg-card"
              onClick={() => api?.scrollNext()}
            >
              <ArrowRight />
              <span className="sr-only">Next blogs</span>
            </Button>
          </div>
        </div>

        <div
          ref={ctaRef}
          className="reveal glass-panel mt-12 rounded-3xl px-6 py-8 sm:px-8 sm:py-10"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-display text-2xl text-foreground mb-2">Need a treatment plan, not just a blog?</p>
              <p className="text-body max-w-2xl">
                If you are dealing with hair fall, dandruff, acne, pigmentation, dull skin, or
                early signs of aging, book a consultation and let our clinic guide you toward the
                right next step.
              </p>
            </div>

            <a href="#appointment" className="btn-primary inline-flex items-center gap-2 self-start lg:self-auto">
              Book Consultation
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
