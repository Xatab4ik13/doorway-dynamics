import { motion } from "framer-motion";
import ContactFormComponent from "@/components/ContactForm";

const contacts = [
  {
    city: "Москва",
    phone: "+7 (495) 123-45-67",
    email: "moscow@primedoor.ru",
    address: "г. Москва, ул. Примерная, д. 1",
  },
  {
    city: "Санкт-Петербург",
    phone: "+7 (812) 123-45-67",
    email: "spb@primedoor.ru",
    address: "г. Санкт-Петербург, ул. Примерная, д. 2",
  },
];

const ContactsPage = () => {
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
                <h3 className="text-xl font-heading font-bold mb-8">{c.city}</h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <a href={`tel:${c.phone.replace(/\D/g, "")}`} className="block hover:text-foreground transition-colors">
                    {c.phone}
                  </a>
                  <a href={`mailto:${c.email}`} className="block hover:text-foreground transition-colors">
                    {c.email}
                  </a>
                  <p>{c.address}</p>
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
