import { useEffect, useRef, useState } from "react";
import gallery1 from "@/assets/clinic-gallery-1.jpg";
import gallery2 from "@/assets/clinic-gallery-2.jpg";
import gallery3 from "@/assets/clinic-gallery-3.jpg";
import heroImg from "@/assets/hero-clinic.jpg";

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
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="gallery" ref={sectionRef} className="py-24 lg:py-32 bg-cream section-padding overflow-hidden">
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
          {images.map((img, i) => (
            <div
              key={img.label}
              className={`group relative rounded-2xl overflow-hidden transition-all duration-700 ${
                i === 0 ? "sm:row-span-2" : ""
              } ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
              style={{ transitionDelay: `${0.15 + i * 0.12}s` }}
            >
              <img
                src={img.src}
                alt={img.alt}
                className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                  i === 0 ? "h-full min-h-[300px]" : "aspect-[4/3]"
                }`}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-6">
                <p className="font-body font-medium text-primary-foreground text-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{img.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
