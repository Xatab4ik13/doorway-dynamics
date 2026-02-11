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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-border">
            {contacts.map((c, i) => (
              <motion.div
                key={c.city}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`py-12 md:py-16 ${i === 0 ? "md:border-r md:border-border md:pr-16" : "md:pl-16"}`}
              >
                <h3 className="text-xl font-heading font-bold mb-10">{c.city}</h3>
                <div className="space-y-8">
                  {c.departments.map((dept) => (
                    <div key={dept.name}>
                      <p className="section-label mb-4">{dept.name}</p>
                      <div className="space-y-3">
                        {dept.phones.map((phone) => (
                          <a
                            key={phone}
                            href={`tel:${phone.replace(/\s/g, "")}`}
                            className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 group"
                          >
                            <Phone className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300" strokeWidth={1.5} />
                            {phone}
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
