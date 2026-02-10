import { useEffect } from "react";
import ContactFormComponent from "@/components/ContactForm";

const RequestPage = () => {
  useEffect(() => {
    document.title = "Заявка на замер — PrimeDoor Service";
  }, []);

  return (
    <main className="pt-24 pb-0">
      <ContactFormComponent />
    </main>
  );
};

export default RequestPage;
