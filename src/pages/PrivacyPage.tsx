import { useEffect } from "react";
import { motion } from "framer-motion";

const PrivacyPage = () => {
  useEffect(() => {
    document.title = "Политика конфиденциальности — PrimeDoor Service";
  }, []);

  return (
    <main className="pt-28 pb-24">
      <section className="px-6 md:px-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Юридическая информация
            </p>
            <h1 className="text-3xl md:text-5xl font-heading font-bold uppercase tracking-tight mb-12">
              Политика конфиденциальности
            </h1>

            <div className="space-y-8 text-sm text-foreground/80 leading-relaxed">
              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3">1. Общие положения</h2>
                <p>
                  Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки и защиты
                  персональных данных пользователей сайта PrimeDoor Service (далее — «Сайт»), принадлежащего
                  Индивидуальному предпринимателю Корженевскому Максиму Андреевичу (ИНН 971502093793, ОГРНИП 323774600734716),
                  далее — «Оператор».
                </p>
                <p className="mt-2">
                  Используя Сайт и предоставляя свои персональные данные, Пользователь выражает согласие с условиями
                  настоящей Политики.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3">2. Какие данные мы собираем</h2>
                <p>Оператор может собирать следующие персональные данные:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Фамилия, имя, отчество;</li>
                  <li>Номер телефона;</li>
                  <li>Адрес объекта (для выезда на замер или монтаж);</li>
                  <li>Описание задачи или проблемы;</li>
                  <li>Данные дополнительного контактного лица (ФИО и телефон);</li>
                  <li>Данные, автоматически передаваемые при посещении Сайта (IP-адрес, данные cookies, информация о браузере).</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3">3. Цели обработки данных</h2>
                <p>Персональные данные обрабатываются в следующих целях:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Обработка заявок на замер, монтаж и рекламацию;</li>
                  <li>Связь с Пользователем для уточнения деталей заявки;</li>
                  <li>Выполнение обязательств перед Пользователем;</li>
                  <li>Улучшение качества обслуживания и работы Сайта;</li>
                  <li>Соблюдение требований законодательства Российской Федерации.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3">4. Правовые основания обработки</h2>
                <p>
                  Обработка персональных данных осуществляется на основании:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных»;</li>
                  <li>Согласия Пользователя, выраженного при заполнении форм на Сайте;</li>
                  <li>Необходимости исполнения договора или принятия мер по запросу Пользователя.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3">5. Защита персональных данных</h2>
                <p>
                  Оператор принимает необходимые организационные и технические меры для защиты персональных данных
                  от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования,
                  распространения, а также от иных неправомерных действий третьих лиц.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3">6. Передача данных третьим лицам</h2>
                <p>
                  Оператор не передает персональные данные третьим лицам, за исключением случаев:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Наличия явного согласия Пользователя;</li>
                  <li>Требований законодательства Российской Федерации;</li>
                  <li>Передачи данных подрядчикам (монтажным бригадам, замерщикам) в объеме, необходимом для выполнения заявки.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3">7. Сроки хранения данных</h2>
                <p>
                  Персональные данные хранятся не дольше, чем это необходимо для достижения целей обработки.
                  После выполнения целей обработки данные подлежат уничтожению или обезличиванию.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3">8. Права пользователя</h2>
                <p>Пользователь имеет право:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Получить информацию об обработке своих персональных данных;</li>
                  <li>Требовать уточнения, блокирования или уничтожения своих данных;</li>
                  <li>Отозвать согласие на обработку персональных данных;</li>
                  <li>Обратиться с жалобой в Роскомнадзор.</li>
                </ul>
                <p className="mt-2">
                  Для реализации своих прав Пользователь может обратиться к Оператору по контактным данным, указанным ниже.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3">9. Файлы cookies</h2>
                <p>
                  Сайт может использовать файлы cookies для обеспечения корректной работы и улучшения
                  пользовательского опыта. Пользователь может отключить cookies в настройках своего браузера,
                  однако это может повлиять на функциональность Сайта.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground mb-3">10. Изменение Политики</h2>
                <p>
                  Оператор оставляет за собой право вносить изменения в настоящую Политику. Новая редакция
                  вступает в силу с момента размещения на Сайте. Продолжение использования Сайта после внесения
                  изменений означает согласие Пользователя с новой редакцией Политики.
                </p>
              </div>

              <div className="border-t border-border pt-8 mt-12">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Реквизиты оператора</h2>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Наименование:</span> ИП Корженевский Максим Андреевич</p>
                  <p><span className="text-muted-foreground">ИНН:</span> 971502093793</p>
                  <p><span className="text-muted-foreground">ОГРНИП:</span> 323774600734716</p>
                  <p><span className="text-muted-foreground">Банк:</span> АО «ТБанк»</p>
                  <p><span className="text-muted-foreground">Р/с:</span> 40802810000005508076</p>
                  <p><span className="text-muted-foreground">К/с:</span> 30101810145250000974</p>
                  <p><span className="text-muted-foreground">БИК:</span> 044525974</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground pt-4">
                Дата последнего обновления: 12 февраля 2026 г.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default PrivacyPage;
