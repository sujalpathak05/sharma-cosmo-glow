import { Suspense, lazy, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import HairTestModal from "@/components/HairTestModal";
import Navbar from "@/components/Navbar";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { sectionPaths, sectionRoutes } from "@/lib/siteRoutes";
import Index from "./pages/Index.tsx";

const Admin = lazy(() => import("./pages/Admin.tsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const AppointmentSection = lazy(() => import("@/components/AppointmentSection"));
const BlogDetail = lazy(() => import("./pages/BlogDetail.tsx"));
const Footer = lazy(() => import("@/components/Footer"));
const FloatingButtons = lazy(() => import("@/components/FloatingButtons"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const routeFallback = <div className="min-h-screen bg-background" />;
const homeSectionPaths = sectionPaths.filter((path) => path !== sectionRoutes.appointment);

const AppointmentRoute = () => {
  const [hairTestOpen, setHairTestOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Book Appointment | Sharma Cosmo Clinic Noida</title>
        <meta
          name="description"
          content="Book an appointment at Sharma Cosmo Clinic Noida for skin, hair, PRP, laser, chemical peel, psoriasis, alopecia, vitiligo, and anti-aging consultations."
        />
        <link rel="canonical" href="https://sharmacosmoclinic.com/appointment" />
        <meta property="og:title" content="Book Appointment | Sharma Cosmo Clinic Noida" />
        <meta
          property="og:description"
          content="Schedule your consultation with Sharma Cosmo Clinic for doctor-led skin, hair, laser, PRP, and aesthetic care in Noida."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sharmacosmoclinic.com/appointment" />
      </Helmet>

      <Navbar onHairTestOpen={() => setHairTestOpen(true)} />
      <main className="min-h-screen bg-rose-soft pt-20">
        <AppointmentSection />
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <FloatingButtons />
      <HairTestModal open={hairTestOpen} onOpenChange={setHairTestOpen} />
    </>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={routeFallback}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path={sectionRoutes.appointment} element={<AppointmentRoute />} />
              {homeSectionPaths.map((path) => (
                <Route key={path} path={path} element={<Index />} />
              ))}
              <Route path="/blogs/:slug" element={<BlogDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
