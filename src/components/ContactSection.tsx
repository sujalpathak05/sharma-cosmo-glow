import { useEffect, useRef, useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { clinicContact } from "@/lib/contactDetails";

const contactInfo = [
  {
    icon: Phone,
    title: "Call Us",
    lines: [{ label: clinicContact.phoneDisplay, href: `tel:${clinicContact.phoneHref}` }],
  },
  {
    icon: Mail,
    title: "Email Support",
    lines: [{ label: clinicContact.email, href: `mailto:${clinicContact.email}` }],
  },
  {
    icon: MapPin,
    title: "Visit Us",
    lines: clinicContact.addressLines.map((line) => ({ label: line })),
  },
];

const ContactSection = () => {
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
    <section id="contact" ref={sectionRef} className="deferred-section section-glow relative py-24 lg:py-32 bg-cream section-padding overflow-hidden">
      <div className="absolute inset-0 motion-grid opacity-35 pointer-events-none" />
      <div className="absolute pointer-events-none -right-16 bottom-0 h-72 w-72 motion-orb opacity-60" />

      <div className="section-container">
        <div className={`text-center mb-16 transition-all duration-800 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-4">Support Desk</p>
          <h2 className="heading-display text-3xl sm:text-4xl lg:text-[2.75rem] mb-4">
            Contact &amp; Support
          </h2>
          <p className="text-body max-w-2xl mx-auto">
            Reach out for appointments, treatment guidance, or directions to our Noida clinic if
            you are visiting from Noida or nearby Delhi NCR areas.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-stretch">
          <div className={`space-y-5 transition-all duration-1000 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}>
            {contactInfo.map((item, i) => (
              <div
                key={item.title}
                className={`spotlight-card glass-panel rounded-[1.5rem] flex gap-4 p-5 transition-all duration-700 hover:-translate-y-1 ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${0.2 + i * 0.1}s` }}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-rose-soft flex items-center justify-center transition-all duration-300 hover:bg-primary hover:text-primary-foreground">
                  <item.icon size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-body font-semibold text-foreground text-sm mb-1">{item.title}</p>
                  {item.lines.map((line) => (
                    line.href ? (
                      <a
                        key={line.label}
                        href={line.href}
                        className="block font-body text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {line.label}
                      </a>
                    ) : (
                      <p key={line.label} className="font-body text-sm text-muted-foreground">
                        {line.label}
                      </p>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div
            className={`glass-panel rounded-[1.75rem] overflow-hidden shadow-lg h-[400px] transition-all duration-1000 ${
              visible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-10 scale-95"
            }`}
            style={{ transitionDelay: "0.3s" }}
          >
            <iframe
              src={clinicContact.mapEmbedSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Sharma Cosmo Clinic Noida Location"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
