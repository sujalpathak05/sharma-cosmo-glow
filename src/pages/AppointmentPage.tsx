import { lazy, Suspense, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import AppointmentSection from "@/components/AppointmentSection";
import HairTestModal from "@/components/HairTestModal";
import Navbar from "@/components/Navbar";
import { clinicContact } from "@/lib/contactDetails";

const Footer = lazy(() => import("@/components/Footer"));
const FloatingButtons = lazy(() => import("@/components/FloatingButtons"));

const AppointmentPage = () => {
  const [hairTestOpen, setHairTestOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

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
        <section className="bg-foreground section-padding py-8 text-primary-foreground sm:py-10">
          <div className="section-container flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                to="/"
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-primary-foreground/75 transition-colors hover:text-primary-foreground"
              >
                <ArrowLeft size={16} />
                Back to home
              </Link>
              <p className="font-body text-sm uppercase tracking-[0.15em] text-primary">Appointment Booking</p>
              <h1 className="mt-3 font-display text-3xl leading-tight text-primary-foreground sm:text-4xl">
                Book your consultation at Sharma Cosmo Clinic
              </h1>
            </div>

            <div className="grid gap-3 text-sm text-primary-foreground/82 sm:grid-cols-2 lg:w-[34rem]">
              <div className="rounded-2xl border border-primary-foreground/12 bg-white/8 px-4 py-3">
                <p className="font-semibold text-primary-foreground">Clinic Timing</p>
                <p className="mt-1">Mon - Sat, 11 AM - 3 PM and 5:30 PM - 8 PM</p>
              </div>
              <div className="rounded-2xl border border-primary-foreground/12 bg-white/8 px-4 py-3">
                <p className="font-semibold text-primary-foreground">Need Help?</p>
                <a href={`tel:${clinicContact.phoneHref}`} className="mt-1 inline-block hover:text-primary-foreground">
                  {clinicContact.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </section>

        <AppointmentSection />
      </main>

      <Suspense fallback={null}>
        <Footer />
        <FloatingButtons />
      </Suspense>
      <HairTestModal open={hairTestOpen} onOpenChange={setHairTestOpen} />
    </>
  );
};

export default AppointmentPage;
