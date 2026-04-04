import { useEffect, useRef, useState } from "react";
import gallery1 from "@/assets/clinic-gallery-1.jpg";
import gallery2 from "@/assets/clinic-gallery-2.jpg";
import gallery3 from "@/assets/clinic-gallery-3.jpg";
import heroImg from "@/assets/hero-clinic.webp";

const images = [
  { src: heroImg, alt: "Advanced treatment room", label: "Treatment Room" },
  { src: gallery1, alt: "Clinic reception area", label: "Reception Area" },
  { src: gallery2, alt: "Consultation room", label: "Consultation Room" },
  { src: gallery3, alt: "Premium skincare products", label: "Premium Products" },
];

const GallerySection = () => {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="gallery" ref={sectionRef} className="deferred-section section-glow relative py-24 lg:py-32 bg-cream section-padding overflow-hidden">
      <div className="absolute inset-0 motion-grid opacity-35 pointer-events-none" />
      <div className="absolute pointer-events-none -left-12 bottom-10 h-64 w-64 motion-orb opacity-70" />

      <div className="section-container">
        <div className={`text-center mb-16 transition-all duration-800 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-4">Gallery</p>
          <h2 className="heading-display text-3xl sm:text-4xl lg:text-[2.75rem] mb-4">
            Our Clinic & Results
          </h2>
          <p className="text-body max-w-2xl mx-auto">
            Step inside our state-of-the-art facility and see the quality environment where
            your transformation begins.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {images.map((image, i) => (
            <div
              key={image.label}
              className={`spotlight-card group relative rounded-[1.75rem] overflow-hidden transition-all duration-700 ${
                i === 0 ? "sm:row-span-2" : ""
              } ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-8"}`}
              style={{ transitionDelay: `${0.15 + i * 0.12}s` }}
            >
              <img
                src={image.src}
                alt={image.alt}
                className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-[1deg] ${
                  i === 0 ? "h-full min-h-[300px]" : "aspect-[4/3]"
                }`}
                loading="lazy"
                decoding="async"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-foreground/72 via-foreground/12 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute left-5 top-5">
                <div className="glass-panel rounded-full px-3 py-1.5 text-xs font-medium text-foreground/80 transition-all duration-500 group-hover:-translate-y-1">
                  {image.label}
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="font-display text-xl text-primary-foreground mb-1">{image.label}</p>
                  <p className="font-body text-sm text-primary-foreground/75">{image.alt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
