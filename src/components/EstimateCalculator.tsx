import { useState, useRef } from "react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

export interface EstimateItem {
  id: number;
  name: string;
  price: number;
  priceAlt?: number;
  priceLabel?: string;
  priceLabelAlt?: string;
  quantity: number;
  selectedVariant: "main" | "alt";
}

export type PriceListItem = Omit<EstimateItem, "quantity" | "selectedVariant">;

interface EstimateCalculatorProps {
  title: string;
  description: string;
  priceList: PriceListItem[];
  noteText: string;
  printTitle: string;
}

const EstimateCalculator = ({ title, description, priceList, noteText, printTitle }: EstimateCalculatorProps) => {
  const [items, setItems] = useState<EstimateItem[]>(
    priceList.map((item) => ({ ...item, quantity: 0, selectedVariant: "main" }))
  );
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
      )
    );
  };

  const setQuantity = (id: number, value: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, value) } : item
      )
    );
  };

  const toggleVariant = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, selectedVariant: item.selectedVariant === "main" ? "alt" : "main" }
          : item
      )
    );
  };

  const getItemPrice = (item: EstimateItem) => {
    return item.selectedVariant === "alt" && item.priceAlt ? item.priceAlt : item.price;
  };

  const selectedItems = items.filter((item) => item.quantity > 0);
  const total = selectedItems.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${printTitle}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; color: #111; padding: 40px; font-size: 13px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #111; padding-bottom: 20px; }
          .logo { height: 50px; }
          .company-info { text-align: right; font-size: 12px; line-height: 1.6; }
          h1 { font-size: 20px; margin-bottom: 8px; }
          .client-info { margin-bottom: 24px; font-size: 13px; line-height: 1.8; }
          .client-info span { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
          th { background: #f5f5f5; font-weight: 600; font-size: 12px; text-transform: uppercase; }
          td { font-size: 13px; }
          .num { text-align: center; width: 40px; }
          .price, .qty, .total-col { text-align: right; white-space: nowrap; }
          .total-row td { font-weight: bold; font-size: 15px; border-top: 2px solid #111; }
          .footer { margin-top: 40px; font-size: 12px; line-height: 1.8; }
          .signature-line { margin-top: 30px; display: flex; justify-content: space-between; }
          .signature-line div { border-top: 1px solid #111; padding-top: 4px; width: 45%; text-align: center; font-size: 11px; }
          .note { margin-top: 20px; padding: 12px; background: #f9f9f9; border-left: 3px solid #111; font-size: 11px; line-height: 1.6; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <img src="${logo}" class="logo" alt="Логотип" onerror="this.style.display='none'" />
          </div>
          <div class="company-info">
            <strong>Сервисная служба</strong><br/>
            Тел: +7 (926) 166-30-62<br/>
            Режим работы: 9:00–21:00
          </div>
        </div>
        <h1>${printTitle}</h1>
        <div class="client-info">
          ${clientName ? `<div><span>Заказчик:</span> ${clientName}</div>` : ""}
          ${clientAddress ? `<div><span>Адрес:</span> ${clientAddress}</div>` : ""}
          ${clientPhone ? `<div><span>Телефон:</span> ${clientPhone}</div>` : ""}
          <div><span>Дата:</span> ${new Date().toLocaleDateString("ru-RU")}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th class="num">№</th>
              <th>Наименование услуги</th>
              <th class="price">Цена</th>
              <th class="qty">Кол-во</th>
              <th class="total-col">Сумма</th>
            </tr>
          </thead>
          <tbody>
            ${selectedItems.map((item, i) => `
              <tr>
                <td class="num">${i + 1}</td>
                <td>${item.name}${item.selectedVariant === "alt" && item.priceLabelAlt ? ` (${item.priceLabelAlt})` : item.priceLabel && item.priceAlt ? ` (${item.priceLabel})` : ""}</td>
                <td class="price">${getItemPrice(item).toLocaleString("ru-RU")} ₽</td>
                <td class="qty">${item.quantity}</td>
                <td class="total-col">${(getItemPrice(item) * item.quantity).toLocaleString("ru-RU")} ₽</td>
              </tr>
            `).join("")}
            <tr class="total-row">
              <td colspan="4">ИТОГО</td>
              <td class="total-col">${total.toLocaleString("ru-RU")} ₽</td>
            </tr>
          </tbody>
        </table>
        <div class="note">
          <strong>Примечание:</strong> ${noteText}
        </div>
        <div class="footer">
          <div class="signature-line">
            <div>Смету составил (мастер)</div>
            <div>Заказчик (подпись)</div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const inputClass =
    "w-full bg-transparent border-b border-foreground/20 py-3 text-[15px] text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-foreground/60 transition-colors duration-500";

  return (
    <main className="pt-24 pb-24">
      <div className="px-6 md:px-10">
        <div className="max-w-7xl mx-auto text-[15px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16 md:mb-24"
          >
            <p className="section-label mb-6">Услуги</p>
            <h1 className="heading-xl">{title}</h1>
            <p className="body-text mt-6 max-w-2xl">{description}</p>
          </motion.div>

          {/* Client info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="heading-md mb-8">Данные заказчика</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
              <input type="text" placeholder="ФИО заказчика" value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} />
              <input type="text" placeholder="Адрес объекта" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className={inputClass} />
              <input type="tel" placeholder="Телефон" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className={inputClass} />
            </div>
          </motion.div>

          {/* Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="heading-md mb-8">Калькулятор сметы</h2>
            <div className="space-y-1">
              {/* Header */}
              <div className="hidden md:grid grid-cols-[1fr_180px_160px_120px] gap-4 py-3 px-4 text-xs uppercase tracking-[0.15em] text-foreground/70 border-b border-foreground/20 font-semibold">
                <span>Услуга</span>
                <span className="text-right">Цена</span>
                <span className="text-center">Кол-во</span>
                <span className="text-right">Сумма</span>
              </div>

              {items.map((item, i) => {
                const price = getItemPrice(item);
                const itemTotal = price * item.quantity;
                const isActive = item.quantity > 0;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.02 }}
                    className={`grid grid-cols-1 md:grid-cols-[1fr_180px_160px_120px] gap-2 md:gap-4 py-4 px-4 rounded-lg border transition-all duration-500 ${
                      isActive
                        ? "border-foreground/30 bg-foreground/[0.08]"
                        : "border-foreground/[0.06] hover:border-foreground/15 hover:bg-foreground/[0.03]"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className={`text-[15px] transition-colors duration-300 ${isActive ? "text-foreground font-medium" : "text-foreground/70"}`}>
                        {item.name}
                      </span>
                      {item.priceAlt && item.priceLabel && item.priceLabelAlt && (
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => item.selectedVariant !== "main" && toggleVariant(item.id)}
                            className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border transition-all duration-300 ${
                              item.selectedVariant === "main"
                                ? "border-foreground/40 text-foreground"
                                : "border-border text-muted-foreground hover:border-foreground/20"
                            }`}
                          >
                            {item.priceLabel}
                          </button>
                          <button
                            onClick={() => item.selectedVariant !== "alt" && toggleVariant(item.id)}
                            className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border transition-all duration-300 ${
                              item.selectedVariant === "alt"
                                ? "border-foreground/40 text-foreground"
                                : "border-border text-muted-foreground hover:border-foreground/20"
                            }`}
                          >
                            {item.priceLabelAlt}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center md:justify-end">
                      <span className="text-[15px] text-foreground/50 md:hidden mr-2">Цена:</span>
                      <span className={`text-[15px] font-semibold tabular-nums ${isActive ? "text-foreground" : "text-foreground/60"}`}>
                        {price.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>

                    <div className="flex items-center justify-start md:justify-center gap-3">
                      <span className="text-[15px] text-foreground/50 md:hidden mr-2">Кол-во:</span>
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-9 h-9 flex items-center justify-center border border-foreground/20 rounded text-foreground/60 hover:text-foreground hover:border-foreground/40 hover:bg-foreground/10 transition-all duration-300 text-lg"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={item.quantity}
                        onChange={(e) => setQuantity(item.id, parseInt(e.target.value) || 0)}
                        className="w-12 text-center bg-transparent text-[15px] font-semibold text-foreground focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-9 h-9 flex items-center justify-center border border-foreground/20 rounded text-foreground/60 hover:text-foreground hover:border-foreground/40 hover:bg-foreground/10 transition-all duration-300 text-lg"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center md:justify-end">
                      <span className="text-[15px] text-foreground/50 md:hidden mr-2">Сумма:</span>
                      <span className={`text-[15px] font-semibold tabular-nums transition-all duration-300 ${isActive ? "text-foreground" : "text-foreground/20"}`}>
                        {itemTotal.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Total + Print */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 pt-8 border-t border-foreground/20"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <p className="section-label mb-2">Итого к оплате</p>
                  <p className="stat-number text-foreground">{total.toLocaleString("ru-RU")} ₽</p>
                  {selectedItems.length > 0 && (
                    <p className="text-sm text-foreground/60 mt-2">
                      {selectedItems.length} {selectedItems.length === 1 ? "позиция" : selectedItems.length < 5 ? "позиции" : "позиций"} в смете
                    </p>
                  )}
                </div>
                <button
                  onClick={handlePrint}
                  disabled={selectedItems.length === 0}
                  className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Распечатать смету
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 p-6 border border-border rounded-lg"
          >
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Примечание:</strong> {noteText}
            </p>
          </motion.div>

          <div ref={printRef} className="hidden" />
        </div>
      </div>
    </main>
  );
};

export default EstimateCalculator;
