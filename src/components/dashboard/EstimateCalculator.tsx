import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Download, Plus, Search, Loader2 } from "lucide-react";
import { priceData, serviceTypeLabels, parsePrice, type PriceItem } from "@/data/priceData";
import logo from "@/assets/logo.png";
import { toast } from "sonner";
import api from "@/lib/api";
import type { UserRole } from "@/data/mockDashboard";
import { motion } from "framer-motion";

interface EstimateItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

interface EstimateCalculatorProps {
  role: UserRole;
  userName: string;
}

const hasVariants = (priceStr: string): boolean => priceStr.includes("/") && !priceStr.startsWith("+");
const parseVariants = (priceStr: string): string[] => priceStr.split("/").map((s) => s.trim());

const EstimateCalculator = ({ role, userName }: EstimateCalculatorProps) => {
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [city, setCity] = useState<"moscow" | "spb">("moscow");
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("interior");
  const [savedEstimates, setSavedEstimates] = useState<{ id: string; number: string; client: string; total: number; date: string }[]>([]);
  const [variantModal, setVariantModal] = useState<{ item: PriceItem; variants: string[] } | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => { document.title = "Калькулятор смет"; }, []);

  useEffect(() => {
    api<any[]>("/api/estimates", { auth: true })
      .then((data) => {
        setSavedEstimates(data.map((e: any) => ({
          id: e.id, number: e.number, client: e.client_name, total: e.total, date: e.created_at?.split("T")[0] || "",
        })));
      })
      .catch(() => {})
      .finally(() => setLoadingSaved(false));
  }, []);

  const currentPriceList = priceData[activeCategory] || [];
  const filteredPriceList = currentPriceList.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  // Add or increment quantity on double-click
  const addFromPrice = (item: PriceItem) => {
    const priceStr = item[city];
    const isReclamation = activeCategory === "reclamation";
    
    if (!isReclamation && hasVariants(priceStr)) {
      setVariantModal({ item, variants: parseVariants(priceStr) });
      return;
    }

    const priceValue = isReclamation ? 0 : parsePrice(priceStr);
    
    // Check if item already exists — increment quantity
    const existing = items.find(i => i.name === item.name && i.price === priceValue);
    if (existing) {
      setItems(prev => prev.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i));
      return;
    }
    
    setItems(prev => [...prev, {
      id: String(Date.now()) + Math.random(),
      name: item.name,
      quantity: 1,
      unit: item.unit,
      price: priceValue,
    }]);
  };

  const addWithVariant = (item: PriceItem, variant: string) => {
    const priceValue = parsePrice(variant);
    const name = `${item.name} (${variant.trim()}${priceValue > 0 ? " ₽" : ""})`;
    
    // Check existing
    const existing = items.find(i => i.name === name && i.price === priceValue);
    if (existing) {
      setItems(prev => prev.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i));
      setVariantModal(null);
      return;
    }
    
    setItems(prev => [...prev, {
      id: String(Date.now()) + Math.random(),
      name,
      quantity: 1,
      unit: item.unit,
      price: priceValue,
    }]);
    setVariantModal(null);
  };

  const addEmpty = () => {
    setItems(prev => [...prev, { id: String(Date.now()), name: "", quantity: 1, unit: "шт", price: 0 }]);
  };

  const updateItem = (id: string, field: keyof EstimateItem, value: any) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  const handleSave = async () => {
    if (!clientName) { toast.error("Укажите имя клиента"); return; }
    if (items.length === 0) { toast.error("Добавьте хотя бы одну позицию"); return; }
    try {
      const saved = await api<any>("/api/estimates", {
        method: "POST",
        body: { client_name: clientName, client_address: clientAddress, city, items, discount, total },
        auth: true,
      });
      setSavedEstimates(prev => [
        { id: saved.id, number: saved.number, client: saved.client_name, total: saved.total, date: saved.created_at?.split("T")[0] || "" },
        ...prev,
      ]);
      setIsSaved(true);
      toast.success("Смета сохранена");
    } catch (err: any) {
      toast.error(err.message || "Ошибка сохранения");
    }
  };

  const handleDownloadPdf = () => {
    if (!isSaved) { toast.error("Сначала сохраните смету"); return; }
    const printWindow = window.open("", "_blank");
    if (!printWindow) { toast.error("Разрешите всплывающие окна"); return; }
    printWindow.document.write(`
      <!DOCTYPE html><html><head><meta charset="utf-8"><title>Смета — ${clientName}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; }
        .meta { font-size: 12px; color: #666; text-align: right; }
        .client { margin-bottom: 20px; }
        .client p { margin: 2px 0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { text-align: left; padding: 8px; font-size: 12px; color: #666; border-bottom: 2px solid #e5e7eb; }
        td { padding: 8px; font-size: 13px; border-bottom: 1px solid #e5e7eb; }
        .total-row td { font-weight: bold; font-size: 16px; border-top: 2px solid #3b82f6; }
        .footer { margin-top: 30px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #999; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <div class="header">
        <div><h1>PrimeDoor Service</h1><p style="font-size:12px;color:#666;">Смета</p></div>
        <div class="meta"><p>${new Date().toLocaleDateString("ru-RU")}</p></div>
      </div>
      <div class="client"><p><strong>${clientName}</strong></p>${clientAddress ? `<p>${clientAddress}</p>` : ""}</div>
      <table>
        <thead><tr><th>№</th><th>Позиция</th><th>Кол.</th><th>Ед.</th><th>Цена</th><th style="text-align:right">Сумма</th></tr></thead>
        <tbody>
          ${items.map((it, idx) => `<tr><td>${idx + 1}</td><td>${it.name || "—"}</td><td>${it.quantity}</td><td>${it.unit}</td><td>${it.price.toLocaleString("ru")} ₽</td><td style="text-align:right">${(it.price * it.quantity).toLocaleString("ru")} ₽</td></tr>`).join("")}
          ${discount > 0 ? `<tr><td colspan="5">Скидка ${discount}%</td><td style="text-align:right">−${discountAmount.toLocaleString("ru")} ₽</td></tr>` : ""}
          <tr class="total-row"><td colspan="5">Итого</td><td style="text-align:right">${total.toLocaleString("ru")} ₽</td></tr>
        </tbody>
      </table>
      <div class="footer">
        <p>ИП Корженевский М.А. · ИНН 971502093793</p>
        <p>+7 (495) 000-00-00 · info@primedoor.ru</p>
      </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 hover:border-primary/40 transition-all";

  return (
    <DashboardLayout role={role} userName={userName}>
      <div className="space-y-5">
        <h1 className="text-2xl font-heading font-bold">Калькулятор смет</h1>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left: Price list */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Прайс-лист</CardTitle>
              <p className="text-xs text-muted-foreground">Нажмите на услугу для добавления. Повторное нажатие увеличит количество.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                {[{ value: "moscow" as const, label: "Москва" }, { value: "spb" as const, label: "СПб" }].map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCity(c.value)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                      city === c.value ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : "bg-accent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {Object.entries(serviceTypeLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => { setActiveCategory(key); setSearch(""); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      activeCategory === key ? "bg-primary text-primary-foreground shadow-sm" : "bg-accent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск в прайсе..."
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              {activeCategory === "reclamation" && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                  <p className="text-xs text-emerald-700 font-medium">Рекламация — бесплатная услуга</p>
                </div>
              )}

              <div className="max-h-[500px] overflow-auto space-y-1">
                {filteredPriceList.map((item, i) => {
                  const price = item[city];
                  const isReclamation = activeCategory === "reclamation";
                  const showPrice = isReclamation ? "Бесплатно" : price;
                  const existingItem = items.find(it => it.name === item.name);
                  return (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addFromPrice(item)}
                      className={`w-full text-left p-3 rounded-xl transition-all group ${
                        existingItem ? "bg-primary/5 border border-primary/20" : "hover:bg-accent border border-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs leading-tight flex-1">{item.name}</p>
                        {existingItem && (
                          <span className="shrink-0 bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                            {existingItem.quantity}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">{item.unit}</span>
                        <span className={`text-xs font-medium ${isReclamation ? "text-emerald-600" : "text-primary"}`}>
                          {showPrice}{!isReclamation && parsePrice(price) > 0 && !price.startsWith("+") ? " ₽" : ""}
                          {hasVariants(price) && !isReclamation && <span className="ml-1 text-[10px] text-muted-foreground">▾</span>}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
                {filteredPriceList.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">Ничего не найдено</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right: Estimate builder + saved */}
          <div className="space-y-5">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Данные клиента</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} placeholder="ФИО или название объекта" />
                <input type="text" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className={inputClass} placeholder="Адрес" />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Позиции ({items.length})</CardTitle>
                  <button onClick={addEmpty} className="flex items-center gap-1 px-3 py-1.5 bg-accent rounded-xl text-xs font-medium hover:bg-accent/80 transition-all">
                    <Plus size={12} /> Пустая
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="text-center text-muted-foreground text-xs py-8">
                    Выберите позиции из прайс-листа слева
                  </p>
                ) : (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl border border-border bg-accent/30 space-y-2"
                      >
                        <input type="text" value={item.name} onChange={(e) => updateItem(item.id, "name", e.target.value)}
                          placeholder="Название" className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" />
                        <div className="flex items-center gap-2">
                          <input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                            className="w-14 px-2 py-1.5 rounded-lg border border-border bg-background text-xs text-center focus:outline-none" />
                          <span className="text-[10px] text-muted-foreground">{item.unit}</span>
                          <span className="text-[10px] text-muted-foreground">×</span>
                          <input type="number" min={0} value={item.price} onChange={(e) => updateItem(item.id, "price", Number(e.target.value))}
                            className="w-20 px-2 py-1.5 rounded-lg border border-border bg-background text-xs text-center focus:outline-none" />
                          <span className="text-[10px] text-muted-foreground">₽</span>
                          <span className="text-xs font-semibold ml-auto text-primary">{(item.price * item.quantity).toLocaleString("ru")} ₽</span>
                          <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-lg hover:bg-destructive/5">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {items.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Подитог</span>
                      <span>{subtotal.toLocaleString("ru")} ₽</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Скидка</span>
                        <input type="number" min={0} max={100} value={discount}
                          onChange={(e) => setDiscount(Number(e.target.value))}
                          className="w-14 px-2 py-1 rounded-lg border border-border bg-background text-xs text-center" />
                        <span className="text-muted-foreground text-xs">%</span>
                      </div>
                      <span className="text-muted-foreground">−{discountAmount.toLocaleString("ru")} ₽</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-3 border-t border-border">
                      <span>Итого</span>
                      <span className="text-primary">{total.toLocaleString("ru")} ₽</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <button onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-md shadow-primary/25">
                Сохранить
              </button>
              <button onClick={handleDownloadPdf} disabled={!isSaved}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isSaved ? "bg-accent text-foreground hover:bg-accent/80" : "bg-accent/50 text-muted-foreground cursor-not-allowed"
                }`}>
                <Download size={16} /> PDF
              </button>
            </div>

            {savedEstimates.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Сохранённые</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {savedEstimates.map((est) => (
                      <div key={est.id} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                        <div>
                          <p className="text-xs font-mono text-primary">{est.number}</p>
                          <p className="text-sm font-medium">{est.client}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{est.total.toLocaleString("ru")} ₽</p>
                          <p className="text-[10px] text-muted-foreground">{est.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Variant modal */}
      {variantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setVariantModal(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card rounded-2xl shadow-2xl w-full max-w-sm"
          >
            <div className="p-5 space-y-4">
              <h3 className="text-sm font-heading font-bold">Выберите вариант</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{variantModal.item.name}</p>
              <div className="space-y-2">
                {variantModal.variants.map((v, i) => {
                  const price = parsePrice(v);
                  return (
                    <button key={i} onClick={() => addWithVariant(variantModal.item, v)}
                      className="w-full text-left p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Вариант {i + 1}</span>
                        <span className="text-sm font-medium text-primary">{price > 0 ? `${v.trim()} ₽` : v.trim()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setVariantModal(null)}
                className="w-full px-4 py-2.5 rounded-xl text-xs font-medium bg-accent text-foreground hover:bg-accent/80 transition-all">
                Отмена
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EstimateCalculator;
