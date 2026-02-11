import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { articles } from "@/data/articles";

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = articles.find((a) => a.slug === slug);

  useEffect(() => {
    if (article) {
      document.title = `${article.title} — PrimeDoor Service`;
    }
  }, [article]);

  if (!article) {
    return (
      <main className="pt-28 pb-24 px-6 md:px-10 text-center">
        <h1 className="text-2xl font-heading font-bold mb-4">Статья не найдена</h1>
        <Link to="/news" className="text-muted-foreground hover:text-foreground transition-colors">
          ← Вернуться к новостям
        </Link>
      </main>
    );
  }

  // Simple markdown-like rendering for headings, bold, lists
  const renderContent = (content: string) => {
    const lines = content.trim().split("\n");
    const elements: JSX.Element[] = [];

    lines.forEach((line, i) => {
      const trimmed = line.trimStart();

      if (trimmed.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="text-xl md:text-2xl font-heading font-bold mt-10 mb-4">
            {trimmed.slice(3)}
          </h2>
        );
      } else if (trimmed.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="text-lg md:text-xl font-heading font-semibold mt-8 mb-3">
            {trimmed.slice(4)}
          </h3>
        );
      } else if (trimmed.startsWith("- ")) {
        elements.push(
          <li key={i} className="text-foreground/80 ml-4 mb-1 list-disc">
            <span dangerouslySetInnerHTML={{ __html: formatBold(trimmed.slice(2)) }} />
          </li>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        const text = trimmed.replace(/^\d+\.\s/, "");
        elements.push(
          <li key={i} className="text-foreground/80 ml-4 mb-1 list-decimal">
            <span dangerouslySetInnerHTML={{ __html: formatBold(text) }} />
          </li>
        );
      } else if (trimmed === "") {
        // skip empty
      } else {
        elements.push(
          <p key={i} className="text-foreground/80 leading-relaxed mb-4">
            <span dangerouslySetInnerHTML={{ __html: formatBold(trimmed) }} />
          </p>
        );
      }
    });

    return elements;
  };

  const formatBold = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>');
  };

  return (
    <main className="pt-28 pb-24 px-6 md:px-10">
      <article className="max-w-3xl mx-auto" itemScope itemType="https://schema.org/Article">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Все статьи
          </Link>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 uppercase tracking-[0.15em]">
            <time itemProp="datePublished">{article.date}</time>
            <span>·</span>
            <span>{article.readTime} чтения</span>
          </div>

          <h1
            className="text-2xl md:text-4xl font-heading font-bold uppercase tracking-tight mb-8 leading-tight"
            itemProp="headline"
          >
            {article.title}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="rounded-2xl overflow-hidden mb-10"
        >
          <img
            src={article.image}
            alt={article.title}
            className="w-full aspect-[16/9] object-cover"
            itemProp="image"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="prose-custom"
          itemProp="articleBody"
        >
          {renderContent(article.content)}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 pt-8 border-t border-border"
        >
          <Link
            to="/request"
            className="inline-block text-xs uppercase tracking-[0.15em] font-medium px-6 py-3 bg-foreground text-background hover:bg-foreground/80 transition-colors duration-300"
          >
            Оставить заявку на замер
          </Link>
        </motion.div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": article.title,
            "description": article.excerpt,
            "image": article.image,
            "datePublished": "2025-02-10",
            "author": { "@type": "Organization", "name": "PrimeDoor Service" },
            "publisher": { "@type": "Organization", "name": "PrimeDoor Service" },
          })
        }} />
      </article>
    </main>
  );
};

export default ArticlePage;
