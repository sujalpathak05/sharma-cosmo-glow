import { Heart } from "lucide-react";

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground/70 py-12 section-padding">
    <div className="section-container">
      <div className="grid sm:grid-cols-3 gap-8 mb-10">
        <div>
          <p className="font-display text-xl font-bold text-primary-foreground mb-3">
            Sharma <span className="text-primary">Cosmo</span>
          </p>
          <p className="font-body text-sm leading-relaxed max-w-xs">
            Your trusted destination for advanced skincare and cosmetic treatments. 
            Enhancing your natural beauty with expertise and care.
          </p>
        </div>
        <div>
          <p className="font-body font-semibold text-primary-foreground text-sm mb-3">Quick Links</p>
          <ul className="space-y-2">
            {["About", "Services", "Gallery", "Contact"].map((l) => (
              <li key={l}>
                <a href={`#${l.toLowerCase()}`} className="font-body text-sm hover:text-primary-foreground transition-colors">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-body font-semibold text-primary-foreground text-sm mb-3">Services</p>
          <ul className="space-y-2">
            {["Skin Treatment", "Hair Fall Treatment", "Laser Treatment", "Anti-Aging"].map((s) => (
              <li key={s}>
                <a href="#services" className="font-body text-sm hover:text-primary-foreground transition-colors">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 pt-8 text-center">
        <p className="font-body text-xs flex items-center justify-center gap-1">
          © 2026 Sharma Cosmo Clinic. Made with <Heart size={12} className="text-primary" /> All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
