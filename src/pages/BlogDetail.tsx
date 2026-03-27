import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import NotFound from "@/pages/NotFound";
import { blogPosts } from "@/data/blogPosts";

const BlogDetail = () => {
  const { slug } = useParams();
  const post = blogPosts.find((item) => item.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return <NotFound />;
  }

  const relatedPosts = blogPosts
    .filter((item) => item.category === post.category && item.slug !== post.slug)
    .slice(0, 3);

  return (
    <>
      <Helmet>
        <title>{post.title} | Sharma Cosmo Clinic</title>
        <meta name="description" content={post.summary} />
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

            <a
              href="/#blogs"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ArrowLeft size={16} />
              Back to blogs
            </a>
          </div>

          <section className="rounded-[2rem] border border-border bg-card p-7 shadow-sm sm:p-10">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-rose-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Blog
              </span>
              <span className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground">
                {post.category}
              </span>
              <span className="text-sm text-muted-foreground">{post.readTime}</span>
            </div>

            <div className="mb-8 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-rose-soft">
                <BookOpen size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="heading-display text-3xl sm:text-4xl lg:text-[3rem] mb-4">{post.title}</h1>
                <p className="text-body text-base sm:text-lg max-w-3xl">{post.summary}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {post.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-2xl border border-border bg-secondary/70 px-4 py-4 text-sm text-muted-foreground"
                >
                  {highlight}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-border bg-card p-7 shadow-sm sm:p-10">
            <div className="space-y-6">
              {post.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-body text-base sm:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-border bg-card p-7 shadow-sm sm:p-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-display text-2xl text-foreground mb-2">Want expert guidance after reading this blog?</p>
                <p className="text-body max-w-2xl">
                  Book a consultation for a personalized hair or skin treatment plan based on your
                  exact concern, scalp condition, and skin goals.
                </p>
              </div>

              <a href="/#appointment" className="btn-primary inline-flex items-center gap-2 self-start lg:self-auto">
                Book Consultation
                <ArrowRight size={16} />
              </a>
            </div>
          </section>

          {relatedPosts.length > 0 && (
            <section className="mt-10">
              <div className="mb-6">
                <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-3">More Blogs</p>
                <h2 className="heading-display text-2xl sm:text-3xl">Continue Reading</h2>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    to={`/blogs/${relatedPost.slug}`}
                    className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-black/5"
                  >
                    <p className="font-body text-xs uppercase tracking-[0.14em] text-primary mb-2">
                      {relatedPost.readTime}
                    </p>
                    <h3 className="font-display text-xl text-foreground mb-3">{relatedPost.title}</h3>
                    <p className="text-body text-sm mb-4">{relatedPost.summary}</p>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                      Read this blog
                      <ArrowRight size={15} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
};

export default BlogDetail;
