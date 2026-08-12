import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2, Send, X, Check } from "lucide-react";
import { formatDateTime } from "@/lib/formatDate";

export interface RequestComment {
  id: string;
  request_id: string;
  author_id?: string | null;
  author_name?: string | null;
  author_role?: string | null;
  stage: "measurement" | "installation" | "general";
  text: string;
  created_at: string;
  updated_at?: string | null;
}

const roleLabels: Record<string, string> = {
  admin: "Администратор",
  manager: "Менеджер",
  measurer: "Замерщик",
  installer: "Монтажник",
  partner: "Партнёр",
  system: "Импорт",
};

interface Props {
  requestId: string;
  /** id текущего пользователя — для прав на правку своих комментариев */
  currentUserId?: string;
  /** роль текущего пользователя */
  currentUserRole?: string;
  /** какая колонка активна по умолчанию (тип заявки) */
  defaultStage?: "measurement" | "installation" | "general";
}

const STAGES: { key: "measurement" | "installation"; label: string }[] = [
  { key: "measurement", label: "Замер" },
  { key: "installation", label: "Монтаж" },
];

const RequestComments = ({ requestId, currentUserId, currentUserRole, defaultStage = "general" }: Props) => {
  const [comments, setComments] = useState<RequestComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const isModerator = currentUserRole === "admin" || currentUserRole === "manager";

  const load = useCallback(async () => {
    try {
      const data = await api<RequestComment[]>(`/api/requests/${requestId}/comments`, { auth: true });
      setComments(data);
    } catch {
      // молча: у роли может не быть доступа
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => { load(); }, [load]);

  const canModify = (c: RequestComment) => isModerator || (!!c.author_id && c.author_id === currentUserId);

  const handleAdd = async (stage: "measurement" | "installation") => {
    const text = (drafts[stage] || "").trim();
    if (!text) return;
    setSending(stage);
    try {
      const created = await api<RequestComment>(`/api/requests/${requestId}/comments`, {
        method: "POST",
        body: { text, stage },
        auth: true,
      });
      setComments((prev) => [...prev, created]);
      setDrafts((prev) => ({ ...prev, [stage]: "" }));
    } catch (err: any) {
      toast.error(err.message || "Не удалось добавить комментарий");
    } finally {
      setSending(null);
    }
  };

  const handleSaveEdit = async (id: string) => {
    const text = editText.trim();
    if (!text) return;
    try {
      const updated = await api<RequestComment>(`/api/comments/${id}`, { method: "PUT", body: { text }, auth: true });
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message || "Не удалось изменить комментарий");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api(`/api/comments/${id}`, { method: "DELETE", auth: true });
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Не удалось удалить комментарий");
    }
  };

  const renderColumn = (stage: "measurement" | "installation", label: string) => {
    const list = comments.filter((c) =>
      c.stage === stage || (stage === defaultStage && c.stage === "general")
    );
    return (
      <div key={stage} className="flex flex-col rounded-xl border border-border bg-background/60 overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-accent/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        </div>
        <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
          {list.length === 0 && <p className="text-xs text-muted-foreground">Комментариев нет</p>}
          {list.map((c) => (
            <div key={c.id} className="rounded-lg bg-accent/40 px-3 py-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] text-muted-foreground">
                  {c.author_name || "Без имени"}
                  {c.author_role ? ` · ${roleLabels[c.author_role] || c.author_role}` : ""}
                  {" · "}
                  {formatDateTime(c.created_at)}
                  {c.updated_at ? " (изменён)" : ""}
                </p>
                {canModify(c) && editingId !== c.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { setEditingId(c.id); setEditText(c.text); }}
                      className="p-1 rounded hover:bg-background text-muted-foreground"
                      title="Изменить"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1 rounded hover:bg-background text-destructive"
                      title="Удалить"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
              {editingId === c.id ? (
                <div className="mt-1.5 space-y-1.5">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="flex gap-1.5">
                    <button onClick={() => handleSaveEdit(c.id)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary text-primary-foreground text-xs">
                      <Check size={12} /> Сохранить
                    </button>
                    <button onClick={() => setEditingId(null)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent text-xs">
                      <X size={12} /> Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap mt-0.5">{c.text}</p>
              )}
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-border space-y-2">
          <textarea
            value={drafts[stage] || ""}
            onChange={(e) => setDrafts((prev) => ({ ...prev, [stage]: e.target.value }))}
            rows={2}
            placeholder={`Комментарий к ${label.toLowerCase()}у...`}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={() => handleAdd(stage)}
            disabled={sending === stage || !(drafts[stage] || "").trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50"
          >
            {sending === stage ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            Добавить
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="animate-spin text-muted-foreground" size={20} />
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {STAGES.map((s) => renderColumn(s.key, s.label))}
    </div>
  );
};

export default RequestComments;
