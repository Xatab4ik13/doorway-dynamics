// Унифицированные уведомления: Telegram + SMS Gateway (api.sms-gate.app).
// Драйвер задаётся через NOTIFY_DRIVER: 'telegram' | 'sms' | 'both' (по умолчанию 'both').

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SMS_GATEWAY_LOGIN = process.env.SMS_GATEWAY_LOGIN;
const SMS_GATEWAY_PASSWORD = process.env.SMS_GATEWAY_PASSWORD;
const SMS_GATEWAY_URL = process.env.SMS_GATEWAY_URL || 'https://api.sms-gate.app/3rdparty/v1/message';
const NOTIFY_DRIVER = (process.env.NOTIFY_DRIVER || 'both').toLowerCase();
const SMS_DIAGNOSTIC_DELAY_MS = Number(process.env.SMS_DIAGNOSTIC_DELAY_MS || 1500);

function smsGatewayHint(errorText = '') {
  if (/android\.permission\.SEND_SMS/i.test(errorText)) {
    return 'На телефоне установлена сборка/версия SMS Gateway без доступного разрешения SEND_SMS или Android не выдал его приложению. Нужен APK с GitHub Releases: capcom6/android-sms-gateway, не PWA/браузерная версия.';
  }
  return null;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readSmsGatewayStatus(messageId, auth) {
  const url = `${SMS_GATEWAY_URL.replace(/\/$/, '')}/${encodeURIComponent(messageId)}`;
  const res = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
  const bodyText = await res.text();
  let body;
  try {
    body = bodyText ? JSON.parse(bodyText) : null;
  } catch (_) {
    body = { raw: bodyText };
  }
  return { ok: res.ok, statusCode: res.status, body };
}

// Преобразовать HTML-сообщение Telegram в короткий plain-text для SMS
function htmlToSms(html) {
  if (!html) return '';
  let s = String(html);
  // Удалить ссылки <a href="...">текст</a> → текст (без URL — экономим символы)
  s = s.replace(/<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, url, txt) => {
    // Если внутри ссылки только "Войти в кабинет" / "Открыть в кабинете" — выкидываем совсем
    if (/войти|открыть|подробнее/i.test(txt)) return '';
    return txt;
  });
  // Убрать остальные HTML-теги
  s = s.replace(/<\/?[^>]+>/g, '');
  // Убрать эмодзи (вне ASCII/кириллицы/пунктуации) — они ломают SMS-сегменты
  s = s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{1F000}-\u{1F2FF}]/gu, '');
  // Схлопнуть лишние пробелы и переводы строк
  s = s.replace(/\n{2,}/g, '\n').replace(/[ \t]+/g, ' ').trim();
  return s;
}

async function sendTelegram(telegramId, htmlMessage) {
  if (!telegramId || !TELEGRAM_BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: telegramId, text: htmlMessage, parse_mode: 'HTML' }),
    });
  } catch (err) {
    console.error('Telegram notify error:', err.message);
  }
}

async function sendSms(phone, text, options = {}) {
  if (!phone || !text) return { skipped: true, reason: 'empty_phone_or_text' };
  if (!SMS_GATEWAY_LOGIN || !SMS_GATEWAY_PASSWORD) {
    console.warn('SMS Gateway credentials not set — skipping SMS');
    return { skipped: true, reason: 'missing_credentials' };
  }
  try {
    const auth = Buffer.from(`${SMS_GATEWAY_LOGIN}:${SMS_GATEWAY_PASSWORD}`).toString('base64');
    const res = await fetch(SMS_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        message: text,
        phoneNumbers: [phone],
      }),
    });
    const bodyText = await res.text();
    let body;
    try {
      body = bodyText ? JSON.parse(bodyText) : null;
    } catch (_) {
      body = { raw: bodyText };
    }
    if (!res.ok) {
      console.error('SMS Gateway error', res.status, body);
      return { ok: false, statusCode: res.status, body };
    }
    const result = { ok: true, statusCode: res.status, body };
    if (options.diagnose && body?.id) {
      await delay(SMS_DIAGNOSTIC_DELAY_MS);
      const status = await readSmsGatewayStatus(body.id, auth);
      const recipientError = status.body?.recipients?.find((r) => r.error)?.error;
      result.status = status;
      result.hint = smsGatewayHint(recipientError || status.body?.error || '');
    }
    return result;
  } catch (err) {
    console.error('SMS notify error:', err.message);
    return { ok: false, error: err.message };
  }
}

// Универсальная отправка одному пользователю.
// user: { telegram_id, phone }
async function notifyUser(user, htmlMessage) {
  if (!user) return;
  const useTg = NOTIFY_DRIVER === 'telegram' || NOTIFY_DRIVER === 'both';
  const useSms = NOTIFY_DRIVER === 'sms' || NOTIFY_DRIVER === 'both';
  const tasks = [];
  if (useTg && user.telegram_id) tasks.push(sendTelegram(user.telegram_id, htmlMessage));
  if (useSms && user.phone) tasks.push(sendSms(user.phone, htmlToSms(htmlMessage)));
  await Promise.all(tasks);
}

// Уведомить всех менеджеров и админов
async function notifyManagersAndAdmins(pool, htmlMessage) {
  try {
    const { rows } = await pool.query(
      "SELECT telegram_id, phone FROM users WHERE role IN ('manager', 'admin') AND active = true"
    );
    await Promise.all(rows.map((u) => notifyUser(u, htmlMessage)));
  } catch (err) {
    console.error('Notify managers error:', err.message);
  }
}

// Уведомить партнёра по id
async function notifyPartner(pool, partnerId, htmlMessage) {
  if (!partnerId) return;
  try {
    const { rows } = await pool.query(
      'SELECT telegram_id, phone FROM users WHERE id = $1 AND active = true',
      [partnerId]
    );
    if (rows[0]) await notifyUser(rows[0], htmlMessage);
  } catch (err) {
    console.error('Notify partner error:', err.message);
  }
}

// Уведомить пользователя по id (исполнитель и т.п.)
async function notifyUserById(pool, userId, htmlMessage) {
  if (!userId) return;
  try {
    const { rows } = await pool.query(
      'SELECT telegram_id, phone FROM users WHERE id = $1',
      [userId]
    );
    if (rows[0]) await notifyUser(rows[0], htmlMessage);
  } catch (err) {
    console.error('Notify user error:', err.message);
  }
}

module.exports = {
  sendTelegram,
  sendSms,
  notifyUser,
  notifyUserById,
  notifyManagersAndAdmins,
  notifyPartner,
  htmlToSms,
  NOTIFY_DRIVER,
};
