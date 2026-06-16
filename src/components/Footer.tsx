import { Heart, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { clinicContact } from "@/lib/contactDetails";
import { sectionRoutes } from "@/lib/siteRoutes";

const quickLinks = [
  { label: "About", to: sectionRoutes.about },
  { label: "Services", to: sectionRoutes.services },
  { label: "Blogs", to: sectionRoutes.blogs },
  { label: "Gallery", to: sectionRoutes.gallery },
  { label: "Contact", to: sectionRoutes.contact },
];

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground/70 py-12 section-padding">
    <div className="section-container">
      <div className="grid lg:grid-cols-4 gap-8 mb-10">
        <div>
          <p className="font-display text-xl font-bold text-primary-foreground mb-3">
            Sharma <span className="text-primary">Cosmo Clinic</span>
          </p>
          <p className="font-body text-sm leading-relaxed max-w-xs">
            Your trusted skin clinic in Noida for advanced skincare and cosmetic treatments.
            Serving patients from Noida, Greater Noida, Ghaziabad, and Delhi NCR.
          </p>
        </div>
        <div>
          <p className="font-body font-semibold text-primary-foreground text-sm mb-3">Quick Links</p>
          <ul className="space-y-2">
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="font-body text-sm hover:text-primary-foreground transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-body font-semibold text-primary-foreground text-sm mb-3">Services</p>
          <ul className="space-y-2">
            {[
              "Skin Treatment",
              "Hair Fall Treatment",
              "Psoriasis Treatment",
              "Alopecia Treatment",
              "Vitiligo Treatment",
              "Laser Treatment",
              "Anti-Aging",
            ].map((service) => (
              <li key={service}>
                <Link to={sectionRoutes.services} className="font-body text-sm hover:text-primary-foreground transition-colors">
                  {service}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-body font-semibold text-primary-foreground text-sm mb-4">Contact &amp; Support</p>
          <div className="space-y-4">
            <a
              href={`tel:${clinicContact.phoneHref}`}
              className="flex items-start gap-3 text-sm text-primary-foreground hover:text-white transition-colors"
            >
              <Phone size={18} className="text-primary mt-0.5 shrink-0" />
              <span>{clinicContact.phoneDisplay}</span>
            </a>
            <a
              href={`mailto:${clinicContact.email}`}
              className="flex items-start gap-3 text-sm text-primary-foreground hover:text-white transition-colors break-all"
            >
              <Mail size={18} className="text-primary mt-0.5 shrink-0" />
              <span>{clinicContact.email}</span>
            </a>
            <div className="flex items-start gap-3 text-sm text-primary-foreground">
              <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                {clinicContact.addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 pt-8 text-center">
        <p className="font-body text-xs flex items-center justify-center gap-1">
          Copyright 2026 Sharma Cosmo Clinic. Made with <Heart size={12} className="text-primary" /> All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
