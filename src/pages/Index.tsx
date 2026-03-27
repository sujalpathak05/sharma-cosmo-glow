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

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Sharma Cosmo Clinic - Hair & Skin Treatments</title>
        <meta
          name="description"
          content="Sharma Cosmo Clinic offers professional hair treatment, skin treatment, acne care, pigmentation solutions, laser procedures, anti-aging services, and expert patient blogs."
        />
        <meta
          name="keywords"
          content="Sharma Cosmo Clinic, hair treatment, skin treatment, acne treatment, pigmentation treatment, PRP hair therapy, laser treatment, anti-aging, dermatology blog"
        />
        <link rel="canonical" href="https://sharmacosmo.com" />
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
