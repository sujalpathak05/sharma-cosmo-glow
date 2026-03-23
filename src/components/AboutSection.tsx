import doctorImage from "@/assets/doctor-profile.jpg";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Award, GraduationCap, Heart } from "lucide-react";

const AboutSection = () => {
  const sectionRef = useScrollReveal<HTMLElement>();

  return (
    <section id="about" ref={sectionRef} className="reveal py-24 lg:py-32 bg-cream section-padding">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/10">
              <img
                src={doctorImage}
                alt="Dr. Sharma - Lead Dermatologist"
                className="w-full aspect-[4/5] object-cover"
                loading="lazy"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-4 sm:right-6 bg-card rounded-xl p-5 shadow-xl shadow-black/8">
              <p className="font-display text-3xl font-bold text-primary">12+</p>
              <p className="font-body text-sm text-muted-foreground">Years of<br/>Excellence</p>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="font-body text-sm uppercase tracking-[0.15em] text-primary mb-4">About Us</p>
            <h2 className="heading-display text-3xl sm:text-4xl lg:text-[2.75rem] mb-6">
              Trusted Skin & Cosmetology Care
            </h2>
            <p className="text-body text-base mb-8 max-w-lg">
              Sharma Cosmo Clinic is a premier skincare and cosmetic center dedicated to helping you 
              look and feel your absolute best. With over a decade of expertise, we combine advanced 
              medical technology with personalized care to deliver exceptional results.
            </p>

            <div className="space-y-5 mb-10">
              {[
                { icon: GraduationCap, title: "MBBS, MD Dermatology", desc: "Board-certified dermatologist with advanced training in cosmetic procedures" },
                { icon: Award, title: "Award-Winning Practice", desc: "Recognized for clinical excellence and patient satisfaction" },
                { icon: Heart, title: "Patient-First Approach", desc: "Personalized treatment plans tailored to your unique skin needs" },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-rose-soft flex items-center justify-center">
                    <item.icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-body font-semibold text-foreground text-sm">{item.title}</p>
                    <p className="font-body text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <a href="#appointment" className="btn-primary inline-block">
              Meet Our Doctor
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
