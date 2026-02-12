import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Download, Plus, Search, Settings } from "lucide-react";
import { priceData, serviceTypeLabels, parsePrice, type PriceItem } from "@/data/priceData";
import logo from "@/assets/logo.png";
import { toast } from "sonner";

interface EstimateItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

const hasVariants = (priceStr: string): boolean => priceStr.includes("/") && !priceStr.startsWith("+");
const parseVariants = (priceStr: string): string[] => priceStr.split("/").map((s) => s.trim());

const AdminEstimates = () => {
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [city, setCity] = useState<"moscow" | "spb">("moscow");
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("interior");
  const [savedEstimates, setSavedEstimates] = useState<{ id: string; client: string; total: number; date: string }[]>([]);
  const [editingPrice, setEditingPrice] = useState(false);
  const [variantModal, setVariantModal] = useState<{ item: PriceItem; variants: string[] } | null>(null);

  useEffect(() => { document.title = "Сметы — Админ-панель"; }, []);

  const currentPriceList = priceData[activeCategory] || [];
  const filteredPriceList = currentPriceList.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addFromPrice = (item: PriceItem) => {
    const priceStr = item[city];
    if (hasVariants(priceStr)) {
      setVariantModal({ item, variants: parseVariants(priceStr) });
      return;
    }
    const priceValue = parsePrice(priceStr);
    setItems((prev) => [...prev, {
      id: String(Date.now()) + Math.random(),
      name: item.name,
      quantity: 1,
      unit: item.unit,
      price: priceValue,
    }]);
  };

  const addWithVariant = (item: PriceItem, variant: string) => {
    const priceValue = parsePrice(variant);
    setItems((prev) => [...prev, {
      id: String(Date.now()) + Math.random(),
      name: `${item.name} (${variant.trim()}${priceValue > 0 ? " ₽" : ""})`,
      quantity: 1,
      unit: item.unit,
      price: priceValue,
    }]);
    setVariantModal(null);
  };

  const addEmpty = () => {
    setItems((prev) => [...prev, { id: String(Date.now()), name: "", quantity: 1, unit: "шт", price: 0 }]);
  };

  const updateItem = (id: string, field: keyof EstimateItem, value: any) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, [field]: value } : i));
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  const handleSave = () => {
    if (!clientName) { toast.error("Укажите имя клиента"); return; }
    if (items.length === 0) { toast.error("Добавьте хотя бы одну позицию"); return; }
    setSavedEstimates((prev) => [
      { id: `EST-${String(prev.length + 1).padStart(3, "0")}`, client: clientName, total, date: new Date().toISOString().split("T")[0] },
      ...prev,
    ]);
    toast.success("Смета сохранена");
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <DashboardLayout role="admin" userName="Корженевский М.А.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold">Конструктор смет</h1>
          <button
            onClick={() => { setEditingPrice(!editingPrice); toast.info(editingPrice ? "Режим редактирования прайса закрыт" : "Редактирование прайс-листа будет доступно после подключения бэкенда"); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent text-foreground rounded-lg text-xs font-medium hover:bg-accent/80 transition-colors"
          >
            <Settings size={14} /> Управление прайсом
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Price list */}
          <div className="xl:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Прайс-лист (актуальный с сайта)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  {[{ value: "moscow" as const, label: "Москва" }, { value: "spb" as const, label: "Санкт-Петербург" }].map((c) => (
                    <button key={c.value} onClick={() => setCity(c.value)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${city === c.value ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground"}`}
                    >{c.label}</button>
                  ))}
                </div>
                <div className="flex gap-1 flex-wrap">
                  {Object.entries(serviceTypeLabels).map(([key, label]) => (
                    <button key={key} onClick={() => { setActiveCategory(key); setSearch(""); }}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${activeCategory === key ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground"}`}
                    >{label}</button>
                  ))}
                </div>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск..."
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                {activeCategory === "reclamation" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <p className="text-xs text-green-700 font-medium">Рекламация — бесплатная услуга</p>
                  </div>
                )}
                <div className="max-h-[400px] overflow-auto space-y-1">
                  {filteredPriceList.map((item, i) => {
                    const price = item[city];
                    const isReclamation = activeCategory === "reclamation";
                    return (
                      <button key={i} onClick={() => {
                        if (isReclamation) {
                          setItems((prev) => [...prev, { id: String(Date.now()) + Math.random(), name: item.name, quantity: 1, unit: item.unit, price: 0 }]);
                        } else {
                          addFromPrice(item);
                        }
                      }} className="w-full text-left p-2 rounded-lg hover:bg-accent transition-colors">
                        <p className="text-xs leading-tight">{item.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground">{item.unit}</span>
                          <span className={`text-xs font-medium ${isReclamation ? "text-green-600" : "text-primary"}`}>
                            {isReclamation ? "Бесплатно" : price}{!isReclamation && parsePrice(price) > 0 && !price.startsWith("+") ? " ₽" : ""}
                            {hasVariants(price) && !isReclamation && <span className="ml-1 text-[10px] text-muted-foreground">▾</span>}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Builder */}
          <div className="xl:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Данные клиента</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} placeholder="ФИО или объект" />
                <input type="text" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className={inputClass} placeholder="Адрес" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Позиции ({items.length})</CardTitle>
                  <button onClick={addEmpty} className="flex items-center gap-1 px-2 py-1 bg-accent rounded text-xs font-medium hover:bg-accent/80 transition-colors">
                    <Plus size={12} /> Пустая
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="text-center text-muted-foreground text-xs py-6">Выберите из прайса слева</p>
                ) : (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="p-2 rounded-lg border border-border space-y-1.5">
                        <input type="text" value={item.name} onChange={(e) => updateItem(item.id, "name", e.target.value)} placeholder="Название позиции"
                          className="w-full px-2 py-1 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
                        <div className="flex items-center gap-2">
                          <input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                            className="w-14 px-2 py-1 rounded border border-border bg-background text-xs text-center focus:outline-none" title="Количество" />
                          <span className="text-[10px] text-muted-foreground">{item.unit}</span>
                          <span className="text-[10px] text-muted-foreground">×</span>
                          <input type="number" min={0} value={item.price} onChange={(e) => updateItem(item.id, "price", Number(e.target.value))}
                            className="w-20 px-2 py-1 rounded border border-border bg-background text-xs text-center focus:outline-none" title="Цена за единицу" />
                          <span className="text-[10px] text-muted-foreground">₽</span>
                          <span className="text-xs font-medium ml-auto">{(item.price * item.quantity).toLocaleString("ru")} ₽</span>
                          <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {items.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Подитог</span><span>{subtotal.toLocaleString("ru")} ₽</span></div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Скидка</span>
                        <input type="number" min={0} max={100} value={discount} onChange={(e) => setDiscount(Number(e.target.value))}
                          className="w-14 px-2 py-1 rounded border border-border bg-background text-xs text-center" />
                        <span className="text-muted-foreground text-xs">%</span>
                      </div>
                      <span className="text-muted-foreground">−{discountAmount.toLocaleString("ru")} ₽</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-border"><span>Итого</span><span>{total.toLocaleString("ru")} ₽</span></div>
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Сохранить</button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-accent text-foreground rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors"><Download size={16} /> PDF</button>
            </div>
          </div>

          {/* Preview */}
          <div className="xl:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Превью</CardTitle></CardHeader>
              <CardContent>
                <div className="bg-background rounded-lg p-4 border border-border text-xs space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <img src={logo} alt="PrimeDoor" className="h-6" />
                    <div className="text-right text-[10px] text-muted-foreground"><p>PrimeDoor Service</p><p>{new Date().toLocaleDateString("ru-RU")}</p></div>
                  </div>
                  {clientName && <p className="font-semibold">{clientName}</p>}
                  {clientAddress && <p className="text-muted-foreground">{clientAddress}</p>}
                  {items.length > 0 && (
                    <table className="w-full text-[10px]">
                      <thead><tr className="border-b border-border text-muted-foreground"><th className="text-left pb-1">Позиция</th><th className="text-center pb-1">Кол.</th><th className="text-right pb-1">Сумма</th></tr></thead>
                      <tbody>{items.map((i) => (<tr key={i.id} className="border-b border-border/50"><td className="py-1">{i.name || "—"}</td><td className="text-center py-1">{i.quantity}</td><td className="text-right py-1">{(i.price * i.quantity).toLocaleString("ru")} ₽</td></tr>))}</tbody>
                    </table>
                  )}
                  {items.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      {discount > 0 && <div className="flex justify-between text-muted-foreground"><span>Скидка {discount}%</span><span>−{discountAmount.toLocaleString("ru")} ₽</span></div>}
                      <div className="flex justify-between font-bold text-sm mt-1"><span>Итого</span><span>{total.toLocaleString("ru")} ₽</span></div>
                    </div>
                  )}
                  <div className="pt-3 border-t border-border text-[9px] text-muted-foreground"><p>ИП Корженевский М.А. · ИНН 971502093793</p><p>+7 (495) 000-00-00 · info@primedoor.ru</p></div>
                </div>
              </CardContent>
            </Card>
            {savedEstimates.length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Сохранённые</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {savedEstimates.map((est) => (
                      <div key={est.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div><p className="text-xs font-mono text-muted-foreground">{est.id}</p><p className="text-sm font-medium">{est.client}</p></div>
                        <div className="text-right"><p className="text-sm font-bold">{est.total.toLocaleString("ru")} ₽</p><p className="text-[10px] text-muted-foreground">{est.date}</p></div>
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
          <div className="absolute inset-0 bg-black/40" onClick={() => setVariantModal(null)} />
          <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-5 space-y-4">
              <h3 className="text-sm font-heading font-bold">Выберите вариант</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{variantModal.item.name}</p>
              <div className="space-y-2">
                {variantModal.variants.map((v, i) => (
                  <button key={i} onClick={() => addWithVariant(variantModal.item, v)}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Вариант {i + 1}</span>
                      <span className="text-sm font-medium text-primary">{parsePrice(v) > 0 ? `${v.trim()} ₽` : v.trim()}</span>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setVariantModal(null)} className="w-full px-4 py-2 rounded-lg text-xs font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminEstimates;
