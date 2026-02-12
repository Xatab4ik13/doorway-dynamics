import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Download, Plus } from "lucide-react";
import logo from "@/assets/logo.png";
import { toast } from "sonner";

interface EstimateItem {
  id: string;
  category: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

const categories = ["Двери", "Фурнитура", "Работы", "Доп. материалы"];

const priceList = [
  { category: "Двери", name: "Дверь межкомнатная экошпон", price: 8500, unit: "шт." },
  { category: "Двери", name: "Дверь межкомнатная массив", price: 22000, unit: "шт." },
  { category: "Двери", name: "Дверь входная металлическая", price: 35000, unit: "шт." },
  { category: "Двери", name: "Дверь скрытого монтажа", price: 28000, unit: "шт." },
  { category: "Фурнитура", name: "Ручка дверная", price: 1200, unit: "шт." },
  { category: "Фурнитура", name: "Петли скрытые (пара)", price: 3500, unit: "пара" },
  { category: "Фурнитура", name: "Замок магнитный", price: 2800, unit: "шт." },
  { category: "Фурнитура", name: "Доводчик", price: 4500, unit: "шт." },
  { category: "Работы", name: "Установка межкомнатной двери", price: 4000, unit: "шт." },
  { category: "Работы", name: "Установка входной двери", price: 6000, unit: "шт." },
  { category: "Работы", name: "Демонтаж старой двери", price: 1500, unit: "шт." },
  { category: "Работы", name: "Замер", price: 0, unit: "шт." },
  { category: "Доп. материалы", name: "Наличники (комплект)", price: 1800, unit: "комп." },
  { category: "Доп. материалы", name: "Доборы", price: 2200, unit: "комп." },
  { category: "Доп. материалы", name: "Порог", price: 800, unit: "шт." },
];

const AdminEstimates = () => {
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [savedEstimates, setSavedEstimates] = useState<{ id: string; client: string; total: number; date: string }[]>([]);

  useEffect(() => { document.title = "Сметы — Админ-панель"; }, []);

  const addItem = (preset?: typeof priceList[0]) => {
    const newItem: EstimateItem = {
      id: String(Date.now()),
      category: preset?.category || "Двери",
      name: preset?.name || "",
      quantity: 1,
      unit: preset?.unit || "шт.",
      price: preset?.price || 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof EstimateItem, value: any) => {
    setItems(items.map((i) => i.id === id ? { ...i, [field]: value } : i));
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  const handleSave = () => {
    if (!clientName) { toast.error("Укажите имя клиента"); return; }
    if (items.length === 0) { toast.error("Добавьте хотя бы одну позицию"); return; }
    setSavedEstimates([
      { id: `EST-${String(savedEstimates.length + 1).padStart(3, "0")}`, client: clientName, total, date: new Date().toISOString().split("T")[0] },
      ...savedEstimates,
    ]);
    toast.success("Смета сохранена");
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <DashboardLayout role="admin" userName="Корженевский М.А.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold">Конструктор смет</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Builder */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Данные клиента</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} placeholder="ФИО клиента или название объекта" />
                <input type="text" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className={inputClass} placeholder="Адрес" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Позиции</CardTitle>
                  <div className="flex gap-2">
                    <select
                      onChange={(e) => {
                        const item = priceList.find((p) => p.name === e.target.value);
                        if (item) addItem(item);
                        e.target.value = "";
                      }}
                      className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">+ Из прайса</option>
                      {categories.map((cat) => (
                        <optgroup key={cat} label={cat}>
                          {priceList.filter((p) => p.category === cat).map((p) => (
                            <option key={p.name} value={p.name}>{p.name} — {p.price.toLocaleString("ru")} ₽</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <button onClick={() => addItem()} className="flex items-center gap-1 px-3 py-1.5 bg-accent rounded-lg text-xs font-medium hover:bg-accent/80 transition-colors">
                      <Plus size={14} /> Пустая строка
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">Добавьте позиции из прайс-листа или вручную</p>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1fr_60px_60px_90px_32px] gap-2 text-xs text-muted-foreground pb-1">
                      <span>Наименование</span><span>Кол-во</span><span>Ед.</span><span className="text-right">Цена</span><span></span>
                    </div>
                    {items.map((item) => (
                      <div key={item.id} className="grid grid-cols-[1fr_60px_60px_90px_32px] gap-2 items-center">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, "name", e.target.value)}
                          className="px-2 py-1.5 rounded border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                          className="px-2 py-1.5 rounded border border-border bg-background text-sm text-center focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                          className="px-2 py-1.5 rounded border border-border bg-background text-xs text-center focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <input
                          type="number"
                          min={0}
                          value={item.price}
                          onChange={(e) => updateItem(item.id, "price", Number(e.target.value))}
                          className="px-2 py-1.5 rounded border border-border bg-background text-sm text-right focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Подитог</span>
                      <span className="font-medium">{subtotal.toLocaleString("ru")} ₽</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Скидка</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={discount}
                          onChange={(e) => setDiscount(Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded border border-border bg-background text-sm text-center focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      <span className="text-muted-foreground">−{discountAmount.toLocaleString("ru")} ₽</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                      <span>Итого</span>
                      <span>{total.toLocaleString("ru")} ₽</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Сохранить смету
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-accent text-foreground rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors">
                <Download size={16} /> Скачать PDF
              </button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Превью</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-background rounded-lg p-4 border border-border text-xs space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <img src={logo} alt="PrimeDoor" className="h-6" />
                    <div className="text-right text-[10px] text-muted-foreground">
                      <p>PrimeDoor Service</p>
                      <p>{new Date().toLocaleDateString("ru-RU")}</p>
                    </div>
                  </div>

                  {clientName && <p className="font-semibold">{clientName}</p>}
                  {clientAddress && <p className="text-muted-foreground">{clientAddress}</p>}

                  {items.length > 0 && (
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="text-left pb-1">Позиция</th>
                          <th className="text-center pb-1">Кол.</th>
                          <th className="text-right pb-1">Сумма</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((i) => (
                          <tr key={i.id} className="border-b border-border/50">
                            <td className="py-1">{i.name || "—"}</td>
                            <td className="text-center py-1">{i.quantity}</td>
                            <td className="text-right py-1">{(i.price * i.quantity).toLocaleString("ru")} ₽</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {items.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      {discount > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Скидка {discount}%</span>
                          <span>−{discountAmount.toLocaleString("ru")} ₽</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-sm mt-1">
                        <span>Итого</span>
                        <span>{total.toLocaleString("ru")} ₽</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-border text-[9px] text-muted-foreground">
                    <p>ИП Корженевский М.А. · ИНН 971502093793</p>
                    <p>+7 (495) 000-00-00 · info@primedoor.ru</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Saved estimates */}
            {savedEstimates.length > 0 && (
              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Сохранённые</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {savedEstimates.map((est) => (
                      <div key={est.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-xs font-mono text-muted-foreground">{est.id}</p>
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
    </DashboardLayout>
  );
};

export default AdminEstimates;
