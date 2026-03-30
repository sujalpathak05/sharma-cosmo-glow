import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import BlogSection from "@/components/BlogSection";
import AppointmentSection from "@/components/AppointmentSection";
import GallerySection from "@/components/GallerySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import { Helmet } from "react-helmet-async";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  "name": "Sharma Cosmo Clinic",
  "description": "Best skin clinic & cosmetology center in Noida offering hair treatment, acne care, pigmentation solutions, laser procedures, anti-aging services by Dr. Visi Kant Sharma.",
  "url": "https://sharmacosmo.com",
  "telephone": "+919876543210",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Noida",
    "addressRegion": "Uttar Pradesh",
    "addressCountry": "IN"
  },
  "medicalSpecialty": "Dermatology",
  "doctor": {
    "@type": "Physician",
    "name": "Dr. Visi Kant Sharma",
    "medicalSpecialty": "Dermatology"
  }
};

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Sharma Cosmo Clinic Noida | Best Skin & Hair Treatment by Dr. Visi Kant Sharma</title>
        <meta
          name="description"
          content="Sharma Cosmo Clinic Noida — Best skin doctor & cosmetology center. Hair fall treatment, acne care, pigmentation, laser procedures, anti-aging by Dr. Visi Kant Sharma. Book appointment now!"
        />
        <meta
          name="keywords"
          content="Sharma Cosmo Clinic, skin clinic Noida, hair treatment Noida, acne treatment Noida, pigmentation treatment, PRP hair therapy, laser treatment Noida, anti-aging Noida, dermatologist Noida, Dr. Visi Kant Sharma, best skin doctor Noida, cosmetology Noida"
        />
        <link rel="canonical" href="https://sharmacosmo.com" />
        <meta property="og:title" content="Sharma Cosmo Clinic Noida | Best Skin & Hair Treatment" />
        <meta property="og:description" content="Best skin clinic in Noida. Hair fall, acne, pigmentation, laser & anti-aging treatment by Dr. Visi Kant Sharma." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sharmacosmo.com" />
        <meta name="twitter:title" content="Sharma Cosmo Clinic Noida | Best Skin & Hair Treatment" />
        <meta name="twitter:description" content="Best skin clinic in Noida. Hair fall, acne, pigmentation, laser & anti-aging treatment by Dr. Visi Kant Sharma." />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
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
