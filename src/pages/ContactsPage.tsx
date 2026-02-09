import { motion } from "framer-motion";
import RequestForm from "@/components/RequestForm";

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
    <main className="pt-32 pb-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-sm font-semibold tracking-[0.3em] uppercase text-primary mb-4 block">
            Контакты
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold">
            Свяжитесь <span className="text-gold-gradient">с нами</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {contacts.map((c) => (
            <motion.div
              key={c.city}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-card border border-border/50 rounded-sm p-8"
            >
              <h3 className="text-xl font-heading font-bold text-primary mb-6">{c.city}</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
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

        <RequestForm />
      </div>
    </main>
  );
};

export default ContactsPage;
