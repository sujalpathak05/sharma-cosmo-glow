import { lazy, Suspense, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HairTestModal from "@/components/HairTestModal";
import { Helmet } from "react-helmet-async";
import { clinicContact } from "@/lib/contactDetails";

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
  const openHairTest = () => setHairTestOpen(true);

  return (
    <>
      <Helmet>
        <title>Sharma Cosmo Clinic Noida | Skin Clinic Near Delhi for Acne, PRP Hair, Laser and Anti-Aging Care</title>
        <meta
          name="description"
          content="Sharma Cosmo Clinic Noida offers acne treatment, PRP hair treatment, psoriasis treatment, alopecia treatment, vitiligo treatment, chemical peel treatment, laser hair removal, botox consultations, and anti-aging care for patients across Delhi NCR."
        />
        <meta
          name="keywords"
          content="skin clinic in Delhi, cosmetic clinic near me, laser hair removal Delhi, acne treatment Delhi, psoriasis treatment, alopecia treatment, vitiligo treatment, best dermatologist Delhi, PRP hair treatment, chemical peel treatment, botox clinic, anti-aging treatment, skin clinic Noida, Delhi NCR skin clinic"
        />
        <link rel="canonical" href="https://sharmacosmoclinic.com" />
        <meta property="og:title" content="Sharma Cosmo Clinic Noida | Skin Clinic Near Delhi for Acne, PRP Hair, Laser and Anti-Aging Care" />
        <meta property="og:description" content="Doctor-led skin, hair, laser, PRP, chemical peel, psoriasis, alopecia, vitiligo, botox, and anti-aging care in Noida for patients across Delhi NCR." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sharmacosmoclinic.com" />
        <meta name="twitter:title" content="Sharma Cosmo Clinic Noida | Skin Clinic Near Delhi for Acne, PRP Hair, Laser and Anti-Aging Care" />
        <meta name="twitter:description" content="Doctor-led skin, hair, laser, PRP, chemical peel, psoriasis, alopecia, vitiligo, botox, and anti-aging care in Noida for patients across Delhi NCR." />
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
      <HairTestModal open={hairTestOpen} onOpenChange={setHairTestOpen} />
    </>
  );
};

export default Index;
