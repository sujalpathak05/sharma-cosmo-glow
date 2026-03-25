import { useEffect, useRef, useState } from "react";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from "lucide-react";

const contactInfo = [
  { icon: MapPin, title: "Address", lines: ["123, MG Road, Near City Hospital", "Sharma Cosmo Clinic, Mumbai - 400001"] },
  { icon: Phone, title: "Phone", lines: ["+91 98765 43210", "+91 12345 67890"] },
  { icon: Mail, title: "Email", lines: ["info@sharmacosmo.com", "appointments@sharmacosmo.com"] },
  { icon: Clock, title: "Working Hours", lines: ["Mon – Sat: 10:00 AM – 7:00 PM", "Sunday: By Appointment Only"] },
];

const ContactSection = () => {
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
    <section id="contact" ref={sectionRef} className="py-24 lg:py-32 bg-cream section-padding overflow-hidden">
      <div className="section-container">
        <div className={`text-center mb-16 transition-all duration-800 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-4">Contact Us</p>
          <h2 className="heading-display text-3xl sm:text-4xl lg:text-[2.75rem] mb-4">
            Visit Our Clinic
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Info - slide from left */}
          <div className={`space-y-8 transition-all duration-1000 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}>
            {contactInfo.map((item, i) => (
              <div
                key={item.title}
                className={`flex gap-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${0.2 + i * 0.1}s` }}
              >
                <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-rose-soft flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 group cursor-default">
                  <item.icon size={20} className="text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <div>
                  <p className="font-body font-semibold text-foreground text-sm">{item.title}</p>
                  {item.lines.map((line) => (
                    <p key={line} className="font-body text-sm text-muted-foreground">{line}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Social */}
            <div className={`flex gap-3 pt-2 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "0.7s" }}>
              {[
                { icon: Instagram, href: "https://instagram.com" },
                { icon: Facebook, href: "https://facebook.com" },
              ].map(({ icon: Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:scale-110 transition-all duration-300 active:scale-95"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Map - slide from right */}
          <div className={`rounded-2xl overflow-hidden shadow-lg h-[400px] transition-all duration-1000 ${visible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-10 scale-95"}`} style={{ transitionDelay: "0.3s" }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.0!2d72.8311!3d19.0760!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA0JzMzLjYiTiA3MsKwNDknNTIuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Sharma Cosmo Clinic Location"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
