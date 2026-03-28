import { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Gallery", href: "#gallery" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Blogs", href: "#blogs" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-card/95 backdrop-blur-md shadow-lg shadow-black/[0.03]"
          : "bg-card/70 backdrop-blur-sm"
      } ${loaded ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
    >
      <nav className="section-container section-padding flex items-center justify-between h-16 sm:h-20">
        <a href="#home" className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-tight hover:scale-105 transition-transform duration-200">
          Sharma <span className="text-primary">Cosmo</span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden xl:flex items-center gap-6">
          {navLinks.map((link, i) => (
            <li
              key={link.href}
              className={`transition-all duration-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}`}
              style={{ transitionDelay: `${0.1 + i * 0.05}s` }}
            >
              <a
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:scale-x-0 after:origin-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-left"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden xl:flex items-center gap-4">
          <a href="tel:+919876543210" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Phone size={16} />
            +91 98765 43210
          </a>
          <a href="#appointment" className="btn-primary text-sm !px-6 !py-2.5">
            Book Appointment
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="xl:hidden p-2 text-foreground active:scale-95 transition-transform"
          aria-label="Toggle menu"
        >
          <div className="relative w-6 h-6">
            <Menu size={24} className={`absolute inset-0 transition-all duration-300 ${mobileOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"}`} />
            <X size={24} className={`absolute inset-0 transition-all duration-300 ${mobileOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"}`} />
          </div>
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`xl:hidden overflow-hidden transition-all duration-500 ease-out ${mobileOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="bg-card/98 backdrop-blur-lg border-t border-border section-padding py-6 flex flex-col gap-4">
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`text-base font-medium text-foreground py-2 transition-all duration-300 ${mobileOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
              style={{ transitionDelay: mobileOpen ? `${i * 0.05}s` : "0s" }}
            >
              {link.label}
            </a>
          ))}
          <a href="#appointment" onClick={() => setMobileOpen(false)} className="btn-primary text-center mt-2">
            Book Appointment
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
