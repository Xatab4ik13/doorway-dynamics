import { useState, useRef } from "react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

interface EstimateItem {
  id: number;
  name: string;
  price: number;
  priceAlt?: number;
  priceLabel?: string;
  priceLabelAlt?: string;
  quantity: number;
  selectedVariant: "main" | "alt";
}

const priceListMoscow: Omit<EstimateItem, "quantity" | "selectedVariant">[] = [
  { id: 1, name: "Стандартный монтаж двери INVISIBLE (выезд на одну дверь)", price: 7500 },
  { id: 2, name: "Стандартный монтаж 1-й двери (шпон, плёнка, массив, эмаль, глянец)", price: 6500 },
  { id: 3, name: "Стандартный монтаж от 2-х дверей (шпон, плёнка, массив, эмаль, глянец)", price: 4500 },
  { id: 4, name: "Стандартный монтаж дверей ProfilDoors с коробом Моноблок", price: 6500 },
  { id: 5, name: "Стандартный монтаж двери компланар REVERS", price: 6500 },
  { id: 6, name: "Установка двери Книжка / Компакт", price: 6500 },
  { id: 7, name: "Установка двери INVISIBLE AVERS / REVERSE", price: 6000 },
  { id: 8, name: "Установка декоративных реек (за 1 м²)", price: 2000, priceAlt: 2750, priceLabel: "Рейки", priceLabelAlt: "Стеновые панели" },
  { id: 9, name: "Установка КАССЕТОНА без обрамления", price: 8500, priceAlt: 10000, priceLabel: "Под одно полотно", priceLabelAlt: "Под два полотна" },
  { id: 10, name: "Установка ПЕРЕГОРОДОК (2-х створчатой до 2100 мм)", price: 15000 },
  { id: 11, name: "Установка межкомнатной складной гармошки (за кв. метр)", price: 5500 },
  { id: 12, name: "Выезд бригады на установку трека под дверь купе Invisible", price: 18000 },
  { id: 13, name: "Установка двери КУПЕ 1 ст. (без отделки проёма)", price: 7000 },
  { id: 14, name: "Установка двери КУПЕ 2 ст. (без отделки проёма)", price: 13000 },
  { id: 15, name: "Установка синхронного механизма", price: 2000 },
  { id: 17, name: "Установка ДОБОРА до 10 см", price: 1300 },
  { id: 18, name: "Установка ДОБОРА от 10 до 20 см", price: 1800 },
  { id: 19, name: "Установка ДОБОРА от 20 до 50 см", price: 3000, priceAlt: 4000, priceLabel: "20–30 см", priceLabelAlt: "30–50 см" },
  { id: 20, name: "Установка декоративных элементов / Капитель (на одну сторону)", price: 350, priceAlt: 700, priceLabel: "Элемент", priceLabelAlt: "Капитель" },
  { id: 21, name: "Корректировка полотна по высоте (подрезка, одна сторона)", price: 1500 },
  { id: 22, name: "Корректировка полотна по высоте (подрезка, две стороны)", price: 2500 },
  { id: 24, name: "Обрамление проёма в арку (портал), добор до 20 см", price: 2500 },
  { id: 25, name: "Обрамление проёма в арку (портал), добор 20–30 см", price: 3000 },
  { id: 26, name: "Обрамление проёма в арку (портал), добор 30–50 см", price: 3500 },
  { id: 27, name: "Расширение проёма (одна сторона)", price: 1500 },
  { id: 28, name: "Сужение проёма брусом (одна сторона, без материала)", price: 750 },
  { id: 29, name: "Подрезка плинтуса (1 шт.)", price: 200 },
  { id: 30, name: "Установка плинтуса (1 м.п.)", price: 650 },
  { id: 31, name: "Врезка замка", price: 750 },
  { id: 32, name: "Установка порога деревянного", price: 500, priceAlt: 1500, priceLabel: "Деревянный", priceLabelAlt: "Автопорог" },
  { id: 34, name: "Установка ограничителя / доводчика", price: 500, priceAlt: 1000, priceLabel: "Ограничитель", priceLabelAlt: "Доводчик" },
  { id: 35, name: "Установка фиксатора / Цилиндра", price: 500 },
  { id: 36, name: "Врезка скрытой петли (1 шт.)", price: 750 },
  { id: 37, name: "Врезка замка / скрытой петли в алюминий", price: 1500 },
  { id: 39, name: "Врезка 3-й дополнительной петли (карточной)", price: 350 },
  { id: 40, name: "Демонтаж дверного блока", price: 750, priceAlt: 1000, priceLabel: "Без сохранения", priceLabelAlt: "С сохранением" },
  { id: 42, name: "Расходные материалы (1 комплект)", price: 750 },
  { id: 43, name: "Монтаж ручек Luxury (комплект)", price: 1500 },
  { id: 44, name: "Выезд за МКАД (1 км)", price: 50 },
  { id: 46, name: "Повторный выезд по просьбе клиента", price: 2500 },
];

const InteriorDoorsPage = () => {
  const [items, setItems] = useState<EstimateItem[]>(
    priceListMoscow.map((item) => ({ ...item, quantity: 0, selectedVariant: "main" }))
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
    const printContent = printRef.current;
    if (!printContent) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Смета — Установка межкомнатных дверей</title>
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
        <h1>Смета на работы по установке межкомнатных дверей</h1>
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
          <strong>Примечание:</strong> Стандартная установка двери включает в себя монтаж новой дверной коробки в подготовленный проём, врезку двух карточных петель, монтаж наличника на обе стороны, установку ручки. Мастер производит установку из материала, предоставленного заказчиком.
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
    "w-full bg-transparent border-b border-border py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors duration-500";

  return (
    <main className="pt-24 pb-24">
      <div className="px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16 md:mb-24"
          >
            <p className="section-label mb-6">Услуги</p>
            <h1 className="heading-xl">
              Установка межкомнатных дверей
            </h1>
            <p className="body-text mt-6 max-w-2xl">
              Рассчитайте стоимость работ с помощью интерактивного калькулятора. 
              Выберите нужные услуги, укажите количество — и получите готовую смету для печати.
            </p>
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
              <input
                type="text"
                placeholder="ФИО заказчика"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Адрес объекта"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className={inputClass}
              />
              <input
                type="tel"
                placeholder="Телефон"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className={inputClass}
              />
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
              <div className="hidden md:grid grid-cols-[1fr_180px_160px_120px] gap-4 py-3 px-4 text-xs uppercase tracking-[0.15em] text-muted-foreground border-b border-border">
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
                        ? "border-foreground/20 bg-foreground/[0.03]"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    {/* Name + variant toggle */}
                    <div className="flex flex-col gap-1">
                      <span className={`text-sm transition-colors duration-300 ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
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

                    {/* Price */}
                    <div className="flex items-center md:justify-end">
                      <span className="text-sm text-muted-foreground md:hidden mr-2">Цена:</span>
                      <span className={`text-sm font-medium tabular-nums ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {price.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-start md:justify-center gap-3">
                      <span className="text-sm text-muted-foreground md:hidden mr-2">Кол-во:</span>
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center border border-border rounded text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-300"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={item.quantity}
                        onChange={(e) => setQuantity(item.id, parseInt(e.target.value) || 0)}
                        className="w-12 text-center bg-transparent text-sm text-foreground focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center border border-border rounded text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-300"
                      >
                        +
                      </button>
                    </div>

                    {/* Item total */}
                    <div className="flex items-center md:justify-end">
                      <span className="text-sm text-muted-foreground md:hidden mr-2">Сумма:</span>
                      <span className={`text-sm font-medium tabular-nums transition-all duration-300 ${
                        isActive ? "text-foreground" : "text-muted-foreground/30"
                      }`}>
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
              className="mt-12 pt-8 border-t border-border"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <p className="section-label mb-2">Итого к оплате</p>
                  <p className="stat-number">{total.toLocaleString("ru-RU")} ₽</p>
                  {selectedItems.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
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
              <strong className="text-foreground">Примечание:</strong> Стандартная установка двери включает в себя монтаж новой дверной коробки 
              в подготовленный проём, врезку двух карточных петель, монтаж наличника на обе стороны, установку ручки. 
              Мастер производит установку из материала, предоставленного заказчиком. Окончательная сумма заказа 
              определяется по согласованию с мастером на месте.
            </p>
          </motion.div>

          <div ref={printRef} className="hidden" />
        </div>
      </div>
    </main>
  );
};

export default InteriorDoorsPage;
