import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { articles as localArticles, type Article } from "@/data/articles";
import { PlusCircle, Trash2, Edit, Eye, Loader2 } from "lucide-react";
import ArticleEditorModal from "@/components/dashboard/ArticleEditorModal";
import DeleteConfirmModal from "@/components/dashboard/DeleteConfirmModal";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface ApiArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  content: string;
  read_time: string;
  created_at: string;
  updated_at: string;
}

const toDisplayArticle = (a: ApiArticle): Article => ({
  id: a.id,
  title: a.title,
  slug: a.slug,
  excerpt: a.excerpt || "",
  image: a.image || "",
  content: a.content || "",
  date: new Date(a.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }),
  readTime: a.read_time || "5 мин",
});

const AdminNews = () => {
  const { user } = useAuth();
  const [newsList, setNewsList] = useState<Article[]>(localArticles);
  const [apiArticles, setApiArticles] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editArticle, setEditArticle] = useState<Article | undefined>();
  const [editApiId, setEditApiId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);

  useEffect(() => { document.title = "Новости — Админ-панель"; }, []);

  useEffect(() => {
    api<ApiArticle[]>("/api/articles")
      .then((data) => {
        setApiArticles(data);
        const apiDisplay = data.map(toDisplayArticle);
        // Merge: local articles + API articles (skip duplicates by slug)
        const localSlugs = new Set(localArticles.map(a => a.slug));
        const uniqueApi = apiDisplay.filter(a => !localSlugs.has(a.slug));
        setNewsList([...localArticles, ...uniqueApi]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isLocalArticle = (a: Article) => localArticles.some(la => la.id === a.id);

  const handleCreate = () => {
    setEditArticle(undefined);
    setEditApiId(null);
    setShowEditor(true);
  };

  const handleEdit = (a: Article) => {
    setEditArticle(a);
    const apiA = apiArticles.find(x => x.slug === a.slug);
    setEditApiId(apiA?.id || null);
    setShowEditor(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (editApiId) {
        // Update existing API article
        const updated = await api<ApiArticle>(`/api/articles/${editApiId}`, {
          method: "PUT",
          body: { title: data.title, slug: data.slug, excerpt: data.excerpt, content: data.content, read_time: data.readTime },
          auth: true,
        });
        setApiArticles(prev => prev.map(a => a.id === editApiId ? updated : a));
        setNewsList(prev => prev.map(a => a.slug === data.slug ? toDisplayArticle(updated) : a));
        toast.success("Статья обновлена");
      } else {
        // Create new API article
        const created = await api<ApiArticle>("/api/articles", {
          method: "POST",
          body: { title: data.title, slug: data.slug, excerpt: data.excerpt, content: data.content, read_time: data.readTime },
          auth: true,
        });
        setApiArticles(prev => [created, ...prev]);
        setNewsList(prev => [toDisplayArticle(created), ...prev]);
        toast.success("Статья опубликована");
      }
    } catch (err: any) {
      toast.error(err.message || "Ошибка сохранения");
    }
    setShowEditor(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (isLocalArticle(deleteTarget)) {
      toast.error("Встроенные статьи нельзя удалить");
      setDeleteTarget(null);
      return;
    }
    const apiA = apiArticles.find(x => x.slug === deleteTarget.slug);
    if (apiA) {
      try {
        await api(`/api/articles/${apiA.id}`, { method: "DELETE", auth: true });
        setApiArticles(prev => prev.filter(a => a.id !== apiA.id));
        setNewsList(prev => prev.filter(a => a.slug !== deleteTarget.slug));
        toast.success("Статья удалена");
      } catch (err: any) {
        toast.error(err.message || "Ошибка удаления");
      }
    }
    setDeleteTarget(null);
  };

  return (
    <DashboardLayout role="admin" userName={user?.name || "Админ"}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold">Новости</h1>
          <button onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <PlusCircle size={16} /> Создать статью
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>
        ) : (
          <div className="grid gap-4">
            {newsList.map((a) => (
              <Card key={a.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  {a.image ? (
                    <img src={a.image} alt={a.title} className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-14 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                      <Eye size={20} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold truncate">{a.title}</h3>
                      {isLocalArticle(a) && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground flex-shrink-0">встроенная</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{a.date} · {a.readTime}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">/news/{a.slug}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Link to={`/news/${a.slug}`} target="_blank" className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"><Eye size={16} /></Link>
                    {!isLocalArticle(a) && (
                      <>
                        <button onClick={() => handleEdit(a)} className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"><Edit size={16} /></button>
                        <button onClick={() => setDeleteTarget(a)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {newsList.length === 0 && (
              <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Нет статей. Создайте первую!</CardContent></Card>
            )}
          </div>
        )}
      </div>

      {showEditor && <ArticleEditorModal article={editArticle} onClose={() => setShowEditor(false)} onSave={handleSave} />}
      {deleteTarget && (
        <DeleteConfirmModal title="Удалить статью?" description={`Статья "${deleteTarget.title}" будет удалена.`}
          onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      )}
    </DashboardLayout>
  );
};

export default AdminNews;
