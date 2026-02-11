import { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import WorksGallery from "@/components/WorksGallery";
import StatsSection from "@/components/StatsSection";
import ServicesSection from "@/components/ServicesSection";
import NewsSection from "@/components/NewsSection";
import ContactForm from "@/components/ContactForm";

const Index = () => {
  useEffect(() => {
    document.title = "PrimeDoor Service — Установка дверей в Москве и СПб";
  }, []);

  return (
    <main>
      <HeroSection />
      <WorksGallery />
      <StatsSection />
      <ServicesSection />
      <NewsSection />
      <ContactForm />
    </main>
  );
};

export default Index;
