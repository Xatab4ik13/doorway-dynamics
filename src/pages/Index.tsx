import HeroSection from "@/components/HeroSection";
import ProjectsGrid from "@/components/ProjectsGrid";
import StatsSection from "@/components/StatsSection";
import ServicesSection from "@/components/ServicesSection";
import ExcursionSection from "@/components/ExcursionSection";
import ContactForm from "@/components/ContactForm";

const Index = () => {
  return (
    <main>
      <HeroSection />
      <ProjectsGrid />
      <StatsSection />
      <ServicesSection />
      <ExcursionSection />
      <ContactForm />
    </main>
  );
};

export default Index;
