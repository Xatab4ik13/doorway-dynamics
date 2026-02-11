import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { articles } from "@/data/articles";

const NewsPage = () => {
  useEffect(() => {
    document.title = "Новости и статьи — PrimeDoor Service";
  }, []);

  return (
    <main className="pt-28 pb-24 px-6 md:px-10">
      <div className="max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-3xl md:text-5xl font-heading font-bold uppercase tracking-tight mb-4"
        >
          Новости и статьи
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-muted-foreground text-lg mb-16 max-w-2xl"
        >
          Полезные материалы об установке дверей, выборе фурнитуры и современных решениях для вашего дома
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.1 }}
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
                  <h2 className="text-lg md:text-xl font-heading font-bold leading-tight mb-3 group-hover:text-foreground/70 transition-colors duration-300">
                    {article.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.excerpt}
                  </p>
                  <span className="inline-block mt-4 text-xs tracking-[0.2em] uppercase text-foreground/60 border-b border-foreground/30 pb-1 group-hover:text-foreground group-hover:border-foreground transition-all duration-500">
                    Читать
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default NewsPage;
