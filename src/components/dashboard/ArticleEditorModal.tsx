import { useState } from "react";
import { X, Image } from "lucide-react";

interface ArticleEditorModalProps {
  article?: { title: string; slug: string; excerpt: string; content: string; image: string; date: string; readTime: string };
  onClose: () => void;
  onSave: (data: any) => void;
}

const ArticleEditorModal = ({ article, onClose, onSave }: ArticleEditorModalProps) => {
  const [title, setTitle] = useState(article?.title || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [excerpt, setExcerpt] = useState(article?.excerpt || "");
  const [content, setContent] = useState(article?.content || "");
  const [readTime, setReadTime] = useState(article?.readTime || "5 мин");

  const generateSlug = (t: string) => {
    return t.toLowerCase()
      .replace(/[а-яё]/g, (c) => {
        const map: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i", й: "j", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya" };
        return map[c] || c;
      })
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (t: string) => {
    setTitle(t);
    if (!article) setSlug(generateSlug(t));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, slug, excerpt, content, readTime });
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-heading font-bold">{article ? "Редактировать статью" : "Новая статья"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Заголовок</label>
            <input type="text" required value={title} onChange={(e) => handleTitleChange(e.target.value)} className={inputClass} placeholder="Как выбрать входную дверь..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Slug (URL)</label>
              <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} placeholder="kak-vybrat-dver" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Время чтения</label>
              <input type="text" value={readTime} onChange={(e) => setReadTime(e.target.value)} className={inputClass} placeholder="5 мин" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Изображение</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Image size={32} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Нажмите для загрузки или перетащите файл</p>
              <p className="text-[10px] text-muted-foreground mt-1">Рекомендуемый размер: 1200×750 px</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Краткое описание</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className={inputClass} placeholder="Краткое описание для карточки..." />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Содержание (Markdown)</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} className={`${inputClass} font-mono text-xs`} placeholder="## Заголовок&#10;&#10;Текст статьи..." />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors">
              Отмена
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              {article ? "Сохранить" : "Опубликовать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticleEditorModal;
