import { lazy, Suspense, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { clinicContact } from "@/lib/contactDetails";
import { getPathForHash, getSectionIdForPath, scrollToSectionId } from "@/lib/siteRoutes";

const HairTestModal = lazy(() => import("@/components/HairTestModal"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const ServicesSection = lazy(() => import("@/components/ServicesSection"));
const BlogSection = lazy(() => import("@/components/BlogSection"));
const AppointmentSection = lazy(() => import("@/components/AppointmentSection"));
const GallerySection = lazy(() => import("@/components/GallerySection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const Footer = lazy(() => import("@/components/Footer"));
const FloatingButtons = lazy(() => import("@/components/FloatingButtons"));

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["MedicalClinic", "LocalBusiness"],
      "@id": "https://sharmacosmoclinic.com/#clinic",
      "name": "Sharma Cosmo Clinic",
      "description": "Skin, hair, laser, PRP, chemical peel, psoriasis, alopecia, vitiligo, and anti-aging treatments in Noida for patients across Delhi NCR.",
      "url": "https://sharmacosmoclinic.com",
      "telephone": clinicContact.phoneDisplay,
      "email": clinicContact.email,
      "logo": "https://sharmacosmoclinic.com/favicon.svg",
      "priceRange": "$$",
      "medicalSpecialty": "Aesthetic Medicine",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "T-22, P Block, Sector 11",
        "addressLocality": "Noida",
        "addressRegion": "Uttar Pradesh",
        "postalCode": "201301",
        "addressCountry": "IN"
      },
      "areaServed": [
        { "@type": "City", "name": "Noida" },
        { "@type": "City", "name": "Delhi" },
        { "@type": "City", "name": "New Delhi" },
        { "@type": "City", "name": "Ghaziabad" }
      ],
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "11:00",
          "closes": "20:00"
        }
      ],
      "employee": {
        "@type": "Physician",
        "name": "Dr. Vishikant Sharma",
        "description": "MBBS, CCEBDM, PGDCC, Fellowship in Aesthetic Medicine"
      }
    }
  ]
};

const Index = () => {
  const [hairTestOpen, setHairTestOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const openHairTest = () => setHairTestOpen(true);

  useEffect(() => {
    const pathFromHash = getPathForHash(location.hash);
    if (pathFromHash) {
      navigate(pathFromHash, { replace: true });
      return;
    }

    const sectionId = getSectionIdForPath(location.pathname);
    if (!sectionId) return;

    let timeoutId: number | undefined;

    const scrollWithRetry = (attempt = 0) => {
      const scrolled = scrollToSectionId(sectionId);
      if (!scrolled && attempt < 50) {
        timeoutId = window.setTimeout(() => scrollWithRetry(attempt + 1), 100);
      }
    };

    const frameId = window.requestAnimationFrame(() => scrollWithRetry());

    return () => {
      window.cancelAnimationFrame(frameId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [location.hash, location.pathname, navigate]);

  return (
    <>
      <Helmet>
        <title>Sharma Cosmo Clinic | Skin, Hair &amp; Cosmetic Clinic Noida</title>
        <meta
          name="description"
          content="Best dermatologist in Noida at Sharma Cosmo Clinic. Expert acne treatment, PRP hair treatment, laser hair removal, and cosmetic procedures for patients across Delhi NCR."
        />
        <meta
          name="keywords"
          content="skin clinic in Noida, cosmetic clinic in Noida, hair treatment in Noida, best dermatologist in Noida, acne treatment in Noida, PRP hair treatment in Noida, laser hair removal in Noida, pigmentation treatment, psoriasis treatment, alopecia treatment, vitiligo treatment, chemical peel treatment, botox clinic, anti-aging treatment, advanced skin care clinic, experienced dermatologist, Delhi NCR skin clinic"
        />
        <link rel="canonical" href="https://sharmacosmoclinic.com" />
        <meta property="og:title" content="Sharma Cosmo Clinic | Skin, Hair &amp; Cosmetic Clinic Noida" />
        <meta property="og:description" content="Best dermatologist in Noida. Expert acne treatment, PRP hair treatment, laser hair removal, and cosmetic procedures for patients across Delhi NCR." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sharmacosmoclinic.com" />
        <meta name="twitter:title" content="Sharma Cosmo Clinic | Skin, Hair &amp; Cosmetic Clinic Noida" />
        <meta name="twitter:description" content="Best dermatologist in Noida. Expert acne treatment, PRP hair treatment, laser hair removal, and cosmetic procedures for patients across Delhi NCR." />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Navbar onHairTestOpen={openHairTest} />
      <main>
        <HeroSection onHairTestOpen={openHairTest} />
        <Suspense fallback={<div className="min-h-[40vh]" />}>
          <AboutSection />
          <ServicesSection />
          <AppointmentSection />
          <GallerySection />
          <TestimonialsSection />
          <BlogSection />
          <ContactSection />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
        <FloatingButtons />
      </Suspense>
      <Suspense fallback={null}>
        <HairTestModal open={hairTestOpen} onOpenChange={setHairTestOpen} />
      </Suspense>
    </>
  );
};

export default Index;
