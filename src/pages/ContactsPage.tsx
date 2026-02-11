import { useEffect } from "react";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import ContactFormComponent from "@/components/ContactForm";

const contacts = [
  {
    city: "Москва",
    departments: [
      {
        name: "Отдел по межкомнатным дверям",
        phones: ["+7 926 166 30 62", "+7 926 166 35 02"],
      },
      {
        name: "Отдел по входным дверям",
        phones: ["+7 925 570 06 09"],
      },
    ],
  },
  {
    city: "Санкт-Петербург",
    departments: [
      {
        name: "Отдел по межкомнатным дверям",
        phones: ["+7 993 266 35 04"],
      },
    ],
  },
];

const ContactsPage = () => {
  useEffect(() => {
    document.title = "Контакты — PrimeDoor Service";
  }, []);

  return (
    <main className="pt-24 pb-0">
      <div className="px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20 md:mb-32"
          >
            <p className="section-label mb-6">Контакты</p>
            <h1 className="heading-xl">Свяжитесь с нами</h1>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {contacts.map((c, i) => (
              <motion.div
                key={c.city}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="border border-border p-8 md:p-12"
              >
                <h3 className="text-2xl md:text-3xl font-heading font-bold mb-12 tracking-tight">{c.city}</h3>
                <div className="space-y-10">
                  {c.departments.map((dept) => (
                    <div key={dept.name}>
                      <p className="section-label mb-5">{dept.name}</p>
                      <div className="space-y-4">
                        {dept.phones.map((phone) => (
                          <a
                            key={phone}
                            href={`tel:${phone.replace(/\s/g, "")}`}
                            className="flex items-center gap-4 group"
                          >
                            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-foreground group-hover:border-foreground transition-all duration-500">
                              <Phone className="w-4 h-4 text-muted-foreground group-hover:text-background transition-colors duration-500" strokeWidth={1.5} />
                            </div>
                            <span className="text-lg md:text-xl font-medium text-foreground/80 group-hover:text-foreground transition-colors duration-300 tracking-wide">
                              {phone}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <ContactFormComponent />
    </main>
  );
};

export default ContactsPage;
