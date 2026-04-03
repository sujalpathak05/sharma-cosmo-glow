import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";

const AboutSection = lazy(() => import("@/components/AboutSection"));
const ServicesSection = lazy(() => import("@/components/ServicesSection"));
const BlogSection = lazy(() => import("@/components/BlogSection"));
const AppointmentSection = lazy(() => import("@/components/AppointmentSection"));
const GallerySection = lazy(() => import("@/components/GallerySection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const SeoContentSection = lazy(() => import("@/components/SeoContentSection"));
const Footer = lazy(() => import("@/components/Footer"));
const FloatingButtons = lazy(() => import("@/components/FloatingButtons"));
import { Helmet } from "react-helmet-async";
import { clinicContact } from "@/lib/contactDetails";
import { homeFaqs } from "@/data/homeSeo";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["MedicalClinic", "LocalBusiness"],
      "@id": "https://sharmacosmoclinic.com/#clinic",
      "name": "Sharma Cosmo Clinic",
      "description": "Skin, hair, laser, PRP, chemical peel, and anti-aging treatments in Noida for patients across Delhi NCR.",
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
    },
    {
      "@type": "FAQPage",
      "mainEntity": homeFaqs.map((item) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    }
  ]
};

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Sharma Cosmo Clinic Noida | Skin Clinic Near Delhi for Acne, PRP Hair, Laser and Anti-Aging Care</title>
        <meta
          name="description"
          content="Sharma Cosmo Clinic Noida offers acne treatment, PRP hair treatment, chemical peel treatment, laser hair removal, botox consultations, and anti-aging care for patients across Delhi NCR."
        />
        <meta
          name="keywords"
          content="skin clinic in Delhi, cosmetic clinic near me, laser hair removal Delhi, acne treatment Delhi, best dermatologist Delhi, PRP hair treatment, chemical peel treatment, botox clinic, anti-aging treatment, skin clinic Noida, Delhi NCR skin clinic"
        />
        <link rel="canonical" href="https://sharmacosmoclinic.com" />
        <meta property="og:title" content="Sharma Cosmo Clinic Noida | Skin Clinic Near Delhi for Acne, PRP Hair, Laser and Anti-Aging Care" />
        <meta property="og:description" content="Doctor-led skin, hair, laser, PRP, chemical peel, botox, and anti-aging care in Noida for patients across Delhi NCR." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sharmacosmoclinic.com" />
        <meta name="twitter:title" content="Sharma Cosmo Clinic Noida | Skin Clinic Near Delhi for Acne, PRP Hair, Laser and Anti-Aging Care" />
        <meta name="twitter:description" content="Doctor-led skin, hair, laser, PRP, chemical peel, botox, and anti-aging care in Noida for patients across Delhi NCR." />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <SeoContentSection />
        <AppointmentSection />
        <GallerySection />
        <TestimonialsSection />
        <BlogSection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
};

export default Index;
