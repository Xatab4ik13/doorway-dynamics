import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { articles } from "@/data/articles";

const NewsSection = () => {
  return (
    <section className="py-24 md:py-40 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12 md:mb-16 flex items-end justify-between"
        >
          <span className="text-lg md:text-2xl lg:text-3xl font-medium uppercase tracking-[0.3em] text-foreground">
            Новости
          </span>
          <Link
            to="/news"
            className="hidden md:inline-block text-xs uppercase tracking-[0.2em] text-muted-foreground border-b border-muted-foreground/30 pb-1 hover:text-foreground hover:border-foreground transition-all duration-300"
          >
            Все статьи
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.slice(0, 2).map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
            >
              <Link
                to={`/news/${article.slug}`}
                className="group block overflow-hidden rounded-2xl bg-card border border-border hover:border-foreground/20 transition-colors duration-500"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 uppercase tracking-[0.15em]">
                    <span>{article.date}</span>
                    <span>·</span>
                    <span>{article.readTime} чтения</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-heading font-bold leading-tight mb-3 group-hover:text-foreground/70 transition-colors duration-300">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="md:hidden mt-8 text-center">
          <Link
            to="/news"
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground border-b border-muted-foreground/30 pb-1 hover:text-foreground hover:border-foreground transition-all duration-300"
          >
            Все статьи
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
