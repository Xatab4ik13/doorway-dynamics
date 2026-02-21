import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash2, Eye, Handshake } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface PartnerForm {
  id: number;
  name: string;
  store_name: string;
  store_address: string;
  phone: string;
  email: string;
  status: string;
  notes: string | null;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Завершена",
  rejected: "Отклонена",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  done: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const AdminPartners = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState<PartnerForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PartnerForm | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchForms = async () => {
    try {
      const data = await api<PartnerForm[]>("/api/partner-forms", { auth: true });
      setForms(data);
    } catch (err: any) {
      toast.error(err.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchForms(); }, []);

  const handleOpen = (form: PartnerForm) => {
    setSelected(form);
    setEditNotes(form.notes || "");
    setEditStatus(form.status);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api(`/api/partner-forms/${selected.id}`, {
        method: "PATCH",
        auth: true,
        body: { status: editStatus, notes: editNotes },
      });
      toast.success("Сохранено");
      setSelected(null);
      fetchForms();
    } catch (err: any) {
      toast.error(err.message || "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить заявку?")) return;
    try {
      await api(`/api/partner-forms/${id}`, { method: "DELETE", auth: true });
      toast.success("Удалено");
      setForms((prev) => prev.filter((f) => f.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Ошибка");
    }
  };

  return (
    <DashboardLayout role="admin" userName={user?.name}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Handshake size={24} className="text-primary" />
          <h1 className="text-2xl font-bold">Заявки на партнёрство</h1>
          <Badge variant="secondary" className="ml-2">{forms.length}</Badge>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" size={32} />
          </div>
        ) : forms.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Заявок пока нет
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>ФИО</TableHead>
                  <TableHead>Магазин</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-[100px]">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {format(new Date(form.created_at), "dd.MM.yyyy HH:mm", { locale: ru })}
                    </TableCell>
                    <TableCell className="font-medium">{form.name}</TableCell>
                    <TableCell>{form.store_name}</TableCell>
                    <TableCell>
                      <a href={`tel:${form.phone}`} className="text-primary hover:underline">
                        {form.phone}
                      </a>
                    </TableCell>
                    <TableCell>
                      <a href={`mailto:${form.email}`} className="text-primary hover:underline text-sm">
                        {form.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[form.status] || "bg-muted text-muted-foreground"}`}>
                        {statusLabels[form.status] || form.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpen(form)}>
                          <Eye size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(form.id)} className="text-destructive hover:text-destructive">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Заявка на партнёрство</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">ФИО</span>
                  <p className="font-medium">{selected.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Магазин</span>
                  <p className="font-medium">{selected.store_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Адрес</span>
                  <p className="font-medium">{selected.store_address}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Телефон</span>
                  <p className="font-medium">
                    <a href={`tel:${selected.phone}`} className="text-primary hover:underline">{selected.phone}</a>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email</span>
                  <p className="font-medium">
                    <a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Дата</span>
                  <p className="font-medium">{format(new Date(selected.created_at), "dd.MM.yyyy HH:mm", { locale: ru })}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Статус</label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Новая</SelectItem>
                    <SelectItem value="in_progress">В работе</SelectItem>
                    <SelectItem value="done">Завершена</SelectItem>
                    <SelectItem value="rejected">Отклонена</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Заметки</label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Добавить заметку..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelected(null)}>Отмена</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 size={16} className="animate-spin mr-2" />}
                  Сохранить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminPartners;
