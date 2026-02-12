import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { articles, type Article } from "@/data/articles";
import { PlusCircle, Trash2, Edit, Eye } from "lucide-react";
import ArticleEditorModal from "@/components/dashboard/ArticleEditorModal";
import DeleteConfirmModal from "@/components/dashboard/DeleteConfirmModal";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const AdminNews = () => {
  const [newsList, setNewsList] = useState(articles);
  const [showEditor, setShowEditor] = useState(false);
  const [editArticle, setEditArticle] = useState<Article | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);

  useEffect(() => { document.title = "Новости — Админ-панель"; }, []);

  const handleCreate = () => {
    setEditArticle(undefined);
    setShowEditor(true);
  };

  const handleEdit = (a: Article) => {
    setEditArticle(a);
    setShowEditor(true);
  };

  const handleSave = (data: any) => {
    if (editArticle) {
      setNewsList(newsList.map((a) => a.id === editArticle.id ? { ...a, ...data } : a));
      toast.success("Статья обновлена");
    } else {
      const newArticle: Article = {
        id: String(Date.now()),
        ...data,
        image: "",
        date: new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }),
      };
      setNewsList([newArticle, ...newsList]);
      toast.success("Статья опубликована");
    }
    setShowEditor(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setNewsList(newsList.filter((a) => a.id !== deleteTarget.id));
    toast.success("Статья удалена");
    setDeleteTarget(null);
  };

  return (
    <DashboardLayout role="admin" userName="Корженевский М.А.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold">Новости</h1>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <PlusCircle size={16} /> Создать статью
          </button>
        </div>

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
                  <h3 className="text-sm font-semibold truncate">{a.title}</h3>
                  <p className="text-xs text-muted-foreground">{a.date} · {a.readTime}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">/news/{a.slug}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Link
                    to={`/news/${a.slug}`}
                    target="_blank"
                    className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Eye size={16} />
                  </Link>
                  <button
                    onClick={() => handleEdit(a)}
                    className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(a)}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
          {newsList.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground text-sm">
                Нет статей. Создайте первую!
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {showEditor && (
        <ArticleEditorModal
          article={editArticle}
          onClose={() => setShowEditor(false)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          title="Удалить статью?"
          description={`Статья "${deleteTarget.title}" будет удалена.`}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminNews;
