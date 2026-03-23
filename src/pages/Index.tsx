import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
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
        <title>Sharma Cosmo Clinic – Enhancing Your Natural Beauty</title>
        <meta name="description" content="Premium skincare & cosmetic clinic offering skin treatments, laser procedures, hair fall solutions, and anti-aging therapies. Book your consultation today." />
        <meta name="keywords" content="skincare clinic, dermatologist, cosmetic treatment, laser treatment, acne treatment, hair fall, anti-aging, Sharma Cosmo Clinic" />
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
        <ContactSection />
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
};

export default Index;
