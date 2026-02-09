import HeroSection from "@/components/HeroSection";
import WorksGallery from "@/components/WorksGallery";
import StatsSection from "@/components/StatsSection";
import ServicesSection from "@/components/ServicesSection";
import ExcursionSection from "@/components/ExcursionSection";
import ContactForm from "@/components/ContactForm";

const Index = () => {
  return (
    <main>
      <HeroSection />
      <WorksGallery />
      <StatsSection />
      <ServicesSection />
      <ExcursionSection />
      <ContactForm />
    </main>
  );
};

export default Index;
