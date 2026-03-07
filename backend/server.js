// Deploy test v3
require('dotenv').config();
// const nodemailer = require('nodemailer'); // TODO: enable when SMTP ports are unblocked
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const webpush = require('web-push');
const multer = require('multer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// === Нормализация телефона ===
function normalizePhone(phone) {
  if (!phone) return phone;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return phone;
  const d = digits.startsWith('7') ? digits : digits.startsWith('8') ? '7' + digits.slice(1) : '7' + digits;
  return '+7' + d.slice(1, 11);
}

// === Telegram уведомления ===
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SITE_URL = 'https://primedoor.ru';

async function sendTelegram(telegramId, message) {
  if (!telegramId || !TELEGRAM_BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: telegramId, text: message, parse_mode: 'HTML' }),
    });
  } catch (err) {
    console.error('Telegram notify error:', err.message);
  }
}

// Уведомить всех менеджеров и админов
async function notifyManagersAndAdmins(pool, message) {
  try {
    const { rows } = await pool.query(
      "SELECT telegram_id FROM users WHERE role IN ('manager', 'admin') AND active = true AND telegram_id IS NOT NULL"
    );
    for (const row of rows) {
      await sendTelegram(row.telegram_id, message);
    }
  } catch (err) {
    console.error('Notify managers error:', err.message);
  }
}

// Уведомить партнёра заявки
async function notifyPartner(pool, partnerId, message) {
  if (!partnerId) return;
  try {
    const { rows } = await pool.query(
      'SELECT telegram_id FROM users WHERE id = $1 AND active = true AND telegram_id IS NOT NULL',
      [partnerId]
    );
    if (rows[0]) await sendTelegram(rows[0].telegram_id, message);
  } catch (err) {
    console.error('Notify partner error:', err.message);
  }
}

const statusLabels = {
  new: 'Новая',
  pending: 'В ожидании',
  measurer_assigned: 'Замерщик назначен',
  installer_assigned: 'Монтажник назначен',
  date_agreed: 'Дата согласована',
  installation_rescheduled: 'Монтаж перенесён',
  measurement_done: 'Замер выполнен',
  closed: 'Закрыта',
  cancelled: 'Отменена',
};

const roleLabels = {
  admin: 'Администратор',
  manager: 'Менеджер',
  measurer: 'Замерщик',
  installer: 'Монтажник',
  partner: 'Партнёр',
};

const typeLabels = {
  measurement: 'Замер',
  installation: 'Монтаж',
  reclamation: 'Рекламация',
};

// === Status flow validation ===
const statusFlows = {
  measurement: ['new', 'pending', 'measurer_assigned', 'date_agreed', 'measurement_done', 'closed', 'cancelled'],
  installation: ['new', 'pending', 'installer_assigned', 'date_agreed', 'installation_rescheduled', 'closed', 'cancelled'],
  reclamation: ['new', 'pending', 'date_agreed', 'closed', 'cancelled'],
};

function isValidTransition(type, fromStatus, toStatus, role) {
  // Admin/manager can set pending from any non-closed status
  if (['admin', 'manager'].includes(role) && toStatus === 'pending' && fromStatus !== 'closed') {
    return true;
  }
  const flow = statusFlows[type] || statusFlows.measurement;
  if (toStatus === 'cancelled') return true;
  const fromIdx = flow.indexOf(fromStatus);
  const toIdx = flow.indexOf(toStatus);
  if (fromIdx === -1 || toIdx === -1) return false;
  if (fromStatus === 'installation_rescheduled' && toStatus === 'date_agreed') return true;
  return toIdx >= fromIdx;
}

// Generate random 4-digit PIN
function generatePin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['https://primedoor.ru', 'https://www.primedoor.ru', 'https://crm.primedoor.ru', 'https://id-preview--f5673e60-b138-4f14-a569-af8be198fbe7.lovable.app'],
  credentials: true,
}));
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
let hasClosedAtColumn = false;

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'ru-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет токена' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Невалидный токен' });
  }
};

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', s3: process.env.S3_ENDPOINT });
  } catch (err) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});

// === Upload / Delete files ===
app.post('/api/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Файл не передан' });
    const ext = req.file.originalname.split('.').pop();
    const folder = req.body.folder || 'uploads';
    const key = folder + '/' + crypto.randomUUID() + '.' + ext;
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read',
    }));
    const url = process.env.S3_ENDPOINT + '/' + process.env.S3_BUCKET + '/' + key;
    res.json({ url, key });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Ошибка загрузки' });
  }
});

app.delete('/api/files', auth, async (req, res) => {
  try {
    const key = req.query.key;
    if (!key) return res.status(400).json({ error: 'Key не указан' });
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
    res.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

// === Auth ===

// Admin login (email + password)
app.post('/api/auth/admin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND role = 'admin' AND active = true",
      [email]
    );
    if (rows.length === 0) return res.status(403).json({ error: 'Неверные данные' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(403).json({ error: 'Неверный пароль' });
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Admin auth error:', err);
    res.status(500).json({ error: 'Ошибка авторизации' });
  }
});

// === Rate limiting for registration ===
const registerAttempts = new Map();
setInterval(() => registerAttempts.clear(), 15 * 60 * 1000);

// Registration (public) — phone + PIN + name + role
app.post('/api/auth/register', async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const attempts = registerAttempts.get(ip) || 0;
  if (attempts >= 5) {
    return res.status(429).json({ error: 'Слишком много попыток. Попробуйте через 15 минут.' });
  }
  registerAttempts.set(ip, attempts + 1);

  const { name, phone: rawPhone, pin, role, telegram_id } = req.body;
  const phone = normalizePhone(rawPhone);
  if (!name || !phone || !pin || !role || !telegram_id) {
    return res.status(400).json({ error: 'Заполните все обязательные поля' });
  }
  if (!/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: 'ПИН-код должен быть 4 цифры' });
  }
  if (!/^\d+$/.test(telegram_id)) {
    return res.status(400).json({ error: 'Telegram ID должен содержать только цифры' });
  }
  if (!['manager', 'measurer', 'installer', 'partner'].includes(role)) {
    return res.status(400).json({ error: 'Недопустимая роль' });
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Аккаунт с таким номером уже существует' });
    }
    const { rows } = await pool.query(
      'INSERT INTO users (name, phone, pin, role, telegram_id, active) VALUES ($1, $2, $3, $4, $5, false) RETURNING id, name, role, active',
      [name, phone, pin, role, telegram_id]
    );
    // Notify admins about new registration
    await notifyManagersAndAdmins(pool,
      `👤 <b>Новая регистрация</b>\n\nИмя: ${name}\nТелефон: ${phone}\nРоль: ${roleLabels[role] || role}\n\nАккаунт ожидает активации.\n\n👉 <a href="${SITE_URL}/admin/accounts">Открыть аккаунты</a>`
    );
    res.json({ success: true, message: 'Регистрация отправлена на одобрение администратору', user: rows[0] });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

// Login by phone + PIN (with device token support)
app.post('/api/auth/pin', async (req, res) => {
  const { phone: rawPhone, pin, device_token } = req.body;
  const phone = normalizePhone(rawPhone);
  if (!phone) return res.status(400).json({ error: 'Введите телефон' });
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (rows.length === 0) return res.status(403).json({ error: 'Аккаунт не найден' });
    const user = rows[0];
    if (!user.active) return res.status(403).json({ error: 'Аккаунт ожидает активации администратором' });

    // Check device token (skip PIN if trusted device)
    if (device_token) {
      try {
        const decoded = jwt.verify(device_token, process.env.JWT_SECRET);
        if (decoded.phone === phone && decoded.type === 'device') {
          const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
          );
          const newDeviceToken = jwt.sign(
            { phone, type: 'device' },
            process.env.JWT_SECRET,
            { expiresIn: '365d' }
          );
          return res.json({ token, user: { id: user.id, name: user.name, role: user.role }, device_token: newDeviceToken });
        }
      } catch {
        // Invalid device token, fall through to PIN
      }
    }

    if (!pin) return res.status(400).json({ error: 'Введите ПИН-код' });
    if (user.pin !== pin) return res.status(403).json({ error: 'Неверный ПИН-код' });

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    const newDeviceToken = jwt.sign(
      { phone, type: 'device' },
      process.env.JWT_SECRET,
      { expiresIn: '365d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, role: user.role }, device_token: newDeviceToken });
  } catch (err) {
    console.error('PIN auth error:', err);
    res.status(500).json({ error: 'Ошибка авторизации' });
  }
});

// Telegram auth sessions (kept for bot notifications)
const telegramSessions = new Map();

app.post('/api/auth/telegram/session', (req, res) => {
  const code = crypto.randomUUID().slice(0, 8);
  telegramSessions.set(code, { status: 'pending', createdAt: Date.now() });
  setTimeout(() => telegramSessions.delete(code), 5 * 60 * 1000);
  res.json({ code });
});

app.post('/api/auth/telegram/confirm', async (req, res) => {
  const { code, telegramId } = req.body;
  const session = telegramSessions.get(code);
  if (!session) return res.status(404).json({ error: 'Сессия не найдена' });
  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE telegram_id = $1 AND active = true',
      [telegramId]
    );
    if (rows.length === 0) return res.status(403).json({ error: 'Пользователь не найден' });
    const user = rows[0];
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    telegramSessions.set(code, {
      status: 'confirmed',
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Confirm error:', err);
    res.status(500).json({ error: 'Ошибка' });
  }
});

app.get('/api/auth/telegram/check/:code', (req, res) => {
  const session = telegramSessions.get(req.params.code);
  if (!session) return res.json({ status: 'expired' });
  if (session.status === 'confirmed') {
    telegramSessions.delete(req.params.code);
    return res.json({ status: 'confirmed', token: session.token, user: session.user });
  }
  res.json({ status: 'pending' });
});

// === Users ===

app.get('/api/users', auth, async (req, res) => {
  if (!['admin', 'manager'].includes(req.user.role)) return res.status(403).json({ error: 'Доступ запрещён' });
  try {
    const { rows } = await pool.query(
      'SELECT id, name, role, telegram_id, phone, email, notes, pin, active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Ошибка загрузки' });
  }
});

app.post('/api/users', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
  const { name, role, telegramId, phone, email, notes, pin } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (name, role, telegram_id, phone, email, notes, pin, active) VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING *',
      [name, role, telegramId, phone || null, email || null, notes || null, pin || null]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Ошибка создания' });
  }
});

app.put('/api/users/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
  try {
    const { id } = req.params;
    const { name, phone, email, notes, telegram_id, pin, active, role } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;
    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(phone || null); }
    if (email !== undefined) { fields.push(`email = $${idx++}`); values.push(email || null); }
    if (notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(notes || null); }
    if (telegram_id !== undefined) { fields.push(`telegram_id = $${idx++}`); values.push(telegram_id || null); }
    if (pin !== undefined) { fields.push(`pin = $${idx++}`); values.push(pin || null); }
    if (active !== undefined) { fields.push(`active = $${idx++}`); values.push(active); }
    if (role !== undefined) { fields.push(`role = $${idx++}`); values.push(role); }
    if (fields.length === 0) return res.status(400).json({ error: 'Нет данных' });
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (!rows.length) return res.status(404).json({ error: 'Не найден' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Ошибка обновления' });
  }
});

app.delete('/api/users/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
  try {
    const check = await pool.query('SELECT role FROM users WHERE id = $1', [req.params.id]);
    if (check.rows[0]?.role === 'admin') {
      return res.status(403).json({ error: 'Нельзя удалить администратора' });
    }
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

// Public upload for reclamation only (no auth)
app.post('/api/upload/reclamation', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Файл не передан' });
    if (req.file.size > 10 * 1024 * 1024) return res.status(400).json({ error: 'Максимум 10 МБ' });
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(req.file.mimetype)) return res.status(400).json({ error: 'Допустимы: JPG, PNG, WEBP, PDF' });
    const ext = req.file.originalname.split('.').pop();
    const key = 'reclamations/' + crypto.randomUUID() + '.' + ext;
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read',
    }));
    const url = process.env.S3_ENDPOINT + '/' + process.env.S3_BUCKET + '/' + key;
    res.json({ url, key });
  } catch (err) {
    console.error('Public reclamation upload error:', err);
    res.status(500).json({ error: 'Ошибка загрузки' });
  }
});


// === Requests ===

app.get('/api/requests', auth, async (req, res) => {
  try {
    const {
      page = 1, limit = 30,
      search, status, type, city,
      measurer_id, installer_id, partner_id,
      date_from, date_to, quick
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conds = [];
    const params = [];
    let idx = 1;

    if (req.user.role === 'partner') {
      conds.push(`partner_id = $${idx++}`); params.push(req.user.id);
    } else if (req.user.role === 'measurer') {
      conds.push(`measurer_id = $${idx++}`); params.push(req.user.id);
    } else if (req.user.role === 'installer') {
      conds.push(`(installer_id = $${idx} OR installer_2_id = $${idx} OR installer_3_id = $${idx} OR installer_4_id = $${idx})`); params.push(req.user.id); idx++;
    }

    const baseConds = [...conds];
    const baseParams = [...params];

    if (search) {
      conds.push(`(client_name ILIKE $${idx} OR number ILIKE $${idx} OR client_address ILIKE $${idx} OR client_phone ILIKE $${idx} OR city ILIKE $${idx})`);
      params.push(`%${search}%`); idx++;
    }
    if (status && status !== 'all') { conds.push(`status = $${idx++}`); params.push(status); }
    if (type && type !== 'all') { conds.push(`type = $${idx++}`); params.push(type); }
    if (measurer_id && measurer_id !== 'all') { conds.push(`measurer_id = $${idx++}`); params.push(measurer_id); }
    if (installer_id && installer_id !== 'all') { conds.push(`installer_id = $${idx++}`); params.push(installer_id); }
    if (city && city !== 'all') { conds.push(`city = $${idx++}`); params.push(city); }
    if (partner_id && partner_id !== 'all') { conds.push(`partner_id = $${idx++}`); params.push(partner_id); }
    const requestedDateField = req.query.date_field === 'closed_at' ? 'closed_at' : 'created_at';
    if (requestedDateField === 'closed_at') {
      conds.push(`status = 'closed'`);
    }
    const dateCol = requestedDateField === 'closed_at'
      ? (hasClosedAtColumn ? 'closed_at' : 'updated_at')
      : 'created_at';
    if (date_from) { conds.push(`${dateCol} >= $${idx++}`); params.push(date_from); }
    if (date_to) { conds.push(`${dateCol} <= $${idx++}::date + interval '1 day'`); params.push(date_to); }

    if (quick === 'new') conds.push(`status = 'new'`);
    else if (quick === 'in_progress') conds.push(`status NOT IN ('new','closed','cancelled')`);
    else if (quick === 'pending') conds.push(`status = 'pending'`);
    else if (quick === 'reclamation') conds.push(`type = 'reclamation'`);

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    const baseWhere = baseConds.length ? 'WHERE ' + baseConds.join(' AND ') : '';

    const [dataRes, countRes, countsRes] = await Promise.all([
      pool.query(`SELECT * FROM requests ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx+1}`, [...params, parseInt(limit), offset]),
      pool.query(`SELECT COUNT(*)::int as total FROM requests ${where}`, params),
      pool.query(`SELECT COUNT(*)::int as "all", COUNT(*) FILTER (WHERE status='new')::int as "new", COUNT(*) FILTER (WHERE status='pending')::int as "pending", COUNT(*) FILTER (WHERE status NOT IN ('new','closed','cancelled'))::int as "in_progress", COUNT(*) FILTER (WHERE type='reclamation')::int as "reclamation" FROM requests ${baseWhere}`, baseParams)
    ]);

    res.json({
      data: dataRes.rows,
      total: countRes.rows[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      counts: countsRes.rows[0]
    });
  } catch (err) {
    console.error('Get requests error:', err);
    res.status(500).json({ error: 'Ошибка загрузки заявок' });
  }
});
// Публичная заявка с сайта
app.post('/api/requests/public', async (req, res) => {
  try {
    const { client_name, client_phone: rawPhone, client_address, city, type, work_description, extra_name, extra_phone: rawExtraPhone, source, photos } = req.body;
    const client_phone = normalizePhone(rawPhone) || rawPhone;
    const extra_phone = rawExtraPhone ? (normalizePhone(rawExtraPhone) || rawExtraPhone) : undefined;
    if (!client_name || !client_phone || !client_address) {
      return res.status(400).json({ error: 'Заполните обязательные поля' });
    }
    const countResult = await pool.query("SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 5) AS INTEGER)), 0) AS count FROM requests");
    const number = 'REQ-' + String(parseInt(countResult.rows[0].count) + 1).padStart(3, '0');

    const { rows } = await pool.query(
      `INSERT INTO requests (number, client_name, client_phone, client_address, city, type, work_description, extra_name, extra_phone, source, photos, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, 'new') RETURNING *`,
      [number, client_name, client_phone, client_address, city || null, type || 'measurement', work_description || null, extra_name || null, extra_phone || null, source || 'site', photos ? JSON.stringify(photos) : '[]']
    );

    const req_data = rows[0];
    // Уведомление менеджерам и админам о новой заявке
    const tgMsg = `📋 <b>Новая заявка ${req_data.number}</b>\n\nКлиент: ${req_data.client_name}\nТелефон: ${req_data.client_phone}\nАдрес: ${req_data.client_address}\nТип: ${typeLabels[req_data.type] || req_data.type}\nИсточник: Сайт\n\n👉 <a href="${SITE_URL}/login">Открыть в кабинете</a>`;
    await notifyManagersAndAdmins(pool, tgMsg);
    // Push
    await sendPushToRoles(['admin', 'manager'], {
      title: `📋 Новая заявка ${req_data.number}`,
      body: `${req_data.client_name} — ${req_data.client_address}`,
      url: '/admin/requests',
    });

    res.json(req_data);
  } catch (err) {
    console.error('Public request error:', err);
    res.status(500).json({ error: 'Ошибка создания заявки' });
  }
});

// Создать заявку (из кабинета)
app.post('/api/requests', auth, async (req, res) => {
  try {
    const { client_name, client_phone: rawPhone, client_address, city, type, work_description, source, comment, extra_name, extra_phone: rawExtraPhone, photos, interior_doors, entrance_doors, partitions } = req.body;
    const client_phone = normalizePhone(rawPhone) || rawPhone;
    const extra_phone = rawExtraPhone ? (normalizePhone(rawExtraPhone) || rawExtraPhone) : null;
    const countResult = await pool.query("SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 5) AS INTEGER)), 0) AS count FROM requests");
    const number = 'REQ-' + String(parseInt(countResult.rows[0].count) + 1).padStart(3, '0');

    // Determine partner_id: for partners, use their own id; for admin/manager creating on behalf, use provided partner_id
    const partnerId = req.user.role === 'partner' ? req.user.id : (req.body.partner_id || null);

    const { rows } = await pool.query(
      `INSERT INTO requests (number, partner_id, client_name, client_phone, client_address, city, type, work_description, source, notes, extra_name, extra_phone, photos, interior_doors, entrance_doors, partitions, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14, $15, $16, 'new') RETURNING *`,
      [number, partnerId, client_name, client_phone, client_address, city || null, type || 'measurement', work_description || null, source || 'site', comment || null, extra_name || null, extra_phone || null, photos ? JSON.stringify(photos) : '[]', interior_doors || null, entrance_doors || null, partitions || null]
    );

    const req_data = rows[0];
    const sourceName = req.user.role === 'partner' ? `Партнёр (${req.user.name})` : req.user.name;
    // Уведомление менеджерам и админам
    await notifyManagersAndAdmins(pool,
      `📋 <b>Новая заявка ${req_data.number}</b>\n\nКлиент: ${req_data.client_name}\nТелефон: ${req_data.client_phone}\nАдрес: ${req_data.client_address}\nТип: ${typeLabels[req_data.type] || req_data.type}\nИсточник: ${sourceName}\n\n👉 <a href="${SITE_URL}/login">Открыть в кабинете</a>`
    );
    // Push
    await sendPushToRoles(['admin', 'manager'], {
      title: `📋 Новая заявка ${req_data.number}`,
      body: `${req_data.client_name} — ${req_data.client_address}`,
      url: '/admin/requests',
    });

    res.json(req_data);
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ error: 'Ошибка создания заявки' });
  }
});

// Обновить заявку (с валидацией и уведомлениями)
app.put('/api/requests/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const role = req.user.role;

    // Загружаем текущую заявку
    const current = await pool.query('SELECT * FROM requests WHERE id = $1', [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Заявка не найдена' });
    const request = current.rows[0];

    // Partners can edit their own requests (client info fields only)
    if (role === 'partner') {
      if (request.partner_id !== req.user.id) {
        return res.status(403).json({ error: 'Нет доступа к этой заявке' });
      }
      const partnerAllowed = ['client_name', 'client_phone', 'client_address', 'city', 'extra_name', 'extra_phone', 'work_description', 'interior_doors', 'entrance_doors', 'partitions', 'photos'];
      const forbidden = Object.keys(updates).filter(k => !partnerAllowed.includes(k));
      if (forbidden.length > 0) {
        return res.status(403).json({ error: `Партнёрам недоступно изменение: ${forbidden.join(', ')}` });
      }
    }

    // Ограничение: исполнители могут менять только agreed_date, status_comment, photos
    const executorAllowed = ['agreed_date', 'status_comment', 'photos', 'status', 'notes', 'amount', 'accepted_at'];
    if (['measurer', 'installer'].includes(role)) {
      const forbidden = Object.keys(updates).filter(k => !executorAllowed.includes(k));
      if (forbidden.length > 0) {
        return res.status(403).json({ error: `Вам недоступно изменение: ${forbidden.join(', ')}` });
      }
    }

    // Admin and manager can edit ALL fields without restriction

    // Автоматизация: назначение исполнителя → смена статуса
    if (updates.measurer_id && !request.measurer_id && ['new', 'pending'].includes(request.status)) {
      updates.status = 'measurer_assigned';
    }
    if (updates.installer_id && !request.installer_id && ['new', 'pending'].includes(request.status)) {
      updates.status = 'installer_assigned';
    }

    // Автоматизация: установка даты → date_agreed
    if (updates.agreed_date && ['measurer_assigned', 'new', 'pending'].includes(request.status)) {
      updates.status = 'date_agreed';
    }

    // Автоматизация: перенос даты монтажа → installation_rescheduled
    // Только если пользователь НЕ менял статус вручную (т.е. статус в payload совпадает с текущим)
    const userExplicitlyChangedStatus = updates.status && updates.status !== request.status;
    if (updates.agreed_date && !userExplicitlyChangedStatus && ["date_agreed", "installation_rescheduled"].includes(request.status) && request.type === "installation" && ["installer", "admin", "manager"].includes(role)) {
      updates.status = "installation_rescheduled";
    }

    // Замерщик может переносить дату замера
    if (updates.agreed_date && role === 'measurer' && request.agreed_date && request.type === 'measurement' && request.status === 'date_agreed') {
      // Allow measurer to reschedule measurement date - keep status as date_agreed
      updates.status = 'date_agreed';
    }

    // Валидация перехода статуса
    if (updates.status && updates.status !== request.status) {
      if (['admin', 'manager'].includes(role) || ['measurer', 'installer'].includes(role)) {
        if (!isValidTransition(request.type, request.status, updates.status, role)) {
          return res.status(400).json({
            error: `Невозможен переход из "${statusLabels[request.status]}" в "${statusLabels[updates.status]}" для типа "${typeLabels[request.type]}"`
          });
        }
      }
    }

    // Normalize phone if being updated
    if (updates.client_phone) {
      updates.client_phone = normalizePhone(updates.client_phone) || updates.client_phone;
    }
    if (updates.extra_phone) {
      updates.extra_phone = normalizePhone(updates.extra_phone) || updates.extra_phone;
    }

    // Автоматизация: закрытие → проставляем closed_at (если колонка доступна)
    if (hasClosedAtColumn) {
      if (updates.status === 'closed' && request.status !== 'closed') {
        updates.closed_at = new Date().toISOString();
      }
      // Если заявку переоткрывают — сбрасываем closed_at
      if (updates.status && updates.status !== 'closed' && request.status === 'closed') {
        updates.closed_at = null;
      }
    } else if (Object.prototype.hasOwnProperty.call(updates, 'closed_at')) {
      delete updates.closed_at;
    }

    // Собираем UPDATE запрос
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'photos') {
        fields.push(`${key} = $${idx}::jsonb`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = $${idx}`);
        values.push(value);
      }
      idx++;
    }
    if (fields.length === 0) return res.status(400).json({ error: 'Нет данных для обновления' });

    values.push(id);
    const result = await pool.query(
      `UPDATE requests SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    const updated = result.rows[0];

    // === УВЕДОМЛЕНИЯ ===

    // 1. Назначение замерщика
    if (updates.measurer_id && updates.measurer_id !== request.measurer_id) {
      const executor = await pool.query('SELECT telegram_id, name FROM users WHERE id = $1', [updates.measurer_id]);
      if (executor.rows[0]?.telegram_id) {
        await sendTelegram(executor.rows[0].telegram_id,
          `🔔 <b>Новая заявка на замер</b>\n\nКлиент: ${updated.client_name}\nТелефон: ${updated.client_phone}\nАдрес: ${updated.client_address}\n\nПерейдите в личный кабинет, чтобы согласовать дату замера с клиентом.\n\n👉 <a href="${SITE_URL}/login">Войти в кабинет</a>`
        );
      }
      // Push to measurer
      await sendPushToUser(updates.measurer_id, {
        title: 'Новая заявка на замер',
        body: `${updated.client_name} — ${updated.client_address}`,
        url: '/measurer',
      });
      // Если был предыдущий замерщик — уведомить о снятии
      if (request.measurer_id && request.measurer_id !== updates.measurer_id) {
        const prev = await pool.query('SELECT telegram_id FROM users WHERE id = $1', [request.measurer_id]);
        if (prev.rows[0]?.telegram_id) {
          await sendTelegram(prev.rows[0].telegram_id,
            `ℹ️ <b>Вы сняты с заявки</b>\n\nЗаявка ${updated.number} передана другому исполнителю.`
          );
        }
        await sendPushToUser(request.measurer_id, {
          title: 'Вы сняты с заявки',
          body: `Заявка ${updated.number} передана другому исполнителю.`,
          url: '/measurer',
        });
      }
    }

    // 2. Назначение монтажника
    if (updates.installer_id && updates.installer_id !== request.installer_id) {
      const executor = await pool.query('SELECT telegram_id, name FROM users WHERE id = $1', [updates.installer_id]);
      const dateStr = updated.agreed_date ? new Date(updated.agreed_date).toLocaleDateString('ru-RU') : 'не назначена';
      if (executor.rows[0]?.telegram_id) {
        await sendTelegram(executor.rows[0].telegram_id,
          `🔔 <b>Новый монтаж</b>\n\nКлиент: ${updated.client_name}\nТелефон: ${updated.client_phone}\nАдрес: ${updated.client_address}\nДата: ${dateStr}\n\nПодробнее — в личном кабинете.\n\n👉 <a href="${SITE_URL}/login">Войти в кабинет</a>`
        );
      }
      // Push to installer
      await sendPushToUser(updates.installer_id, {
        title: 'Новый монтаж',
        body: `${updated.client_name} — ${updated.client_address}, дата: ${dateStr}`,
        url: '/installer',
      });
      // Если был предыдущий монтажник — уведомить о снятии
      if (request.installer_id && request.installer_id !== updates.installer_id) {
        const prev = await pool.query('SELECT telegram_id FROM users WHERE id = $1', [request.installer_id]);
        if (prev.rows[0]?.telegram_id) {
          await sendTelegram(prev.rows[0].telegram_id,
            `ℹ️ <b>Вы сняты с заявки</b>\n\nЗаявка ${updated.number} передана другому исполнителю.`
          );
        }
        await sendPushToUser(request.installer_id, {
          title: 'Вы сняты с заявки',
          body: `Заявка ${updated.number} передана другому исполнителю.`,
          url: '/installer',
        });
      }
    }

    // 3. Дата согласована/перенесена → менеджерам
    if (updates.agreed_date && updates.agreed_date !== request.agreed_date) {
      const action = request.agreed_date ? 'перенесена' : 'согласована';
      const comment = updates.status_comment ? `\nКомментарий: ${updates.status_comment}` : '';
      await notifyManagersAndAdmins(pool,
        `📅 <b>Дата ${action}</b>\n\nЗаявка: ${updated.number}\nНовая дата: ${new Date(updates.agreed_date).toLocaleDateString('ru-RU')}${comment}\n\n👉 <a href="${SITE_URL}/login">Открыть в кабинете</a>`
      );
      await sendPushToRoles(['admin', 'manager'], {
        title: `Дата ${action}`,
        body: `Заявка ${updated.number} — ${new Date(updates.agreed_date).toLocaleDateString('ru-RU')}`,
        url: '/admin/requests',
      });
    }

    // 4. Работа завершена (measurement_done или closed) → менеджерам
    if (updates.status && ['measurement_done', 'closed'].includes(updates.status) && request.status !== updates.status) {
      await notifyManagersAndAdmins(pool,
        `✅ <b>Работа завершена</b>\n\nЗаявка: ${updated.number}\nТип: ${typeLabels[updated.type] || updated.type}\nСтатус: ${statusLabels[updates.status]}\n\n👉 <a href="${SITE_URL}/login">Открыть в кабинете</a>`
      );
      await sendPushToRoles(['admin', 'manager'], {
        title: 'Работа завершена',
        body: `Заявка ${updated.number} — ${statusLabels[updates.status]}`,
        url: '/admin/requests',
      });
    }

    // 5. Заявка отменена → уведомить исполнителей
    if (updates.status === 'cancelled' && request.status !== 'cancelled') {
      const executorIds = [updated.measurer_id, updated.installer_id].filter(Boolean);
      for (const execId of executorIds) {
        const exec = await pool.query('SELECT telegram_id FROM users WHERE id = $1', [execId]);
        if (exec.rows[0]?.telegram_id) {
          await sendTelegram(exec.rows[0].telegram_id,
            `❌ <b>Заявка отменена</b>\n\nЗаявка ${updated.number} была отменена.`
          );
        }
        await sendPushToUser(execId, {
          title: '❌ Заявка отменена',
          body: `Заявка ${updated.number} была отменена.`,
        });
      }
    }

    // 6. Смена статуса → партнёру
    if (updates.status && updates.status !== request.status && updated.partner_id) {
      await notifyPartner(pool, updated.partner_id,
        `📌 <b>Статус заявки ${updated.number} изменён</b>\n\nНовый статус: ${statusLabels[updates.status] || updates.status}\n\n👉 <a href="${SITE_URL}/login">Подробнее в кабинете</a>`
      );
      await sendPushToUser(updated.partner_id, {
        title: `📌 Статус заявки ${updated.number}`,
        body: `Новый статус: ${statusLabels[updates.status] || updates.status}`,
        url: '/partner',
      });
    }

    res.json(updated);
  } catch (err) {
    console.error('Update request error:', err);
    res.status(500).json({ error: 'Ошибка обновления заявки' });
  }
});

// === Articles ===
app.get('/api/articles', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM articles ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Get articles error:', err);
    res.status(500).json({ error: 'Ошибка загрузки статей' });
  }
});

app.post('/api/articles', auth, async (req, res) => {
  try {
    const { title, slug, excerpt, image, content, read_time } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO articles (title, slug, excerpt, image, content, read_time)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, slug, excerpt || '', image || '', content || '', read_time || '5 мин']
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Create article error:', err);
    res.status(500).json({ error: 'Ошибка создания статьи' });
  }
});

app.put('/api/articles/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
    fields.push(`updated_at = NOW()`);
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE articles SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Статья не найдена' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Update article error:', err);
    res.status(500).json({ error: 'Ошибка обновления' });
  }
});

app.delete('/api/articles/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM articles WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete article error:', err);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

// === Estimates ===
app.get('/api/estimates', auth, async (req, res) => {
  try {
    let query = 'SELECT * FROM estimates';
    const params = [];
    if (req.user.role === 'measurer' || req.user.role === 'installer') {
      query += ' WHERE created_by = $1';
      params.push(req.user.id);
    }
    query += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Get estimates error:', err);
    res.status(500).json({ error: 'Ошибка загрузки смет' });
  }
});

app.post('/api/estimates', auth, async (req, res) => {
  try {
    const { client_name, client_address, city, items, discount, total, request_id } = req.body;
    const countResult = await pool.query('SELECT COUNT(*) FROM estimates');
    const number = 'EST-' + String(parseInt(countResult.rows[0].count) + 1).padStart(3, '0');
    const { rows } = await pool.query(
      `INSERT INTO estimates (number, client_name, client_address, city, items, discount, total, created_by, request_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [number, client_name, client_address || null, city || null, JSON.stringify(items || []), discount || 0, total || 0, req.user.id, request_id || null]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Create estimate error:', err);
    res.status(500).json({ error: 'Ошибка сохранения сметы' });
  }
});

app.delete('/api/estimates/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM estimates WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete estimate error:', err);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});


// DELETE request (admin only)
app.delete("/api/requests/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Только администратор может удалять заявки" });
    }
    const { id } = req.params;
    const result = await pool.query("DELETE FROM requests WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Заявка не найдена" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Delete request error:", err);
    res.status(500).json({ error: "Ошибка удаления заявки" });
  }
});

// === Startup check: closed_at column ===
(async () => {
  try {
    const { rows } = await pool.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'requests'
          AND column_name = 'closed_at'
      ) AS exists
    `);

    hasClosedAtColumn = !!rows[0]?.exists;

    if (hasClosedAtColumn) {
      await pool.query(`UPDATE requests SET closed_at = COALESCE(updated_at, created_at) WHERE status = 'closed' AND closed_at IS NULL`);
      console.log('Startup check: closed_at column ready');
    } else {
      console.warn('Startup check: closed_at column is missing. Date filter uses updated_at for closed requests.');
    }
  } catch (err) {
    console.error('Startup check closed_at error:', err.message);
  }
})();

// === Partner form ===
// Auto-create partner_forms table
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS partner_forms (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        store_name TEXT NOT NULL,
        store_address TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        status TEXT DEFAULT 'new',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  } catch (err) {
    console.error('partner_forms table creation error:', err.message);
  }
})();

const partnerFormAttempts = new Map();
setInterval(() => partnerFormAttempts.clear(), 15 * 60 * 1000);

app.post('/api/partner-form', async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const attempts = partnerFormAttempts.get(ip) || 0;
  if (attempts >= 5) {
    return res.status(429).json({ error: 'Слишком много попыток. Попробуйте через 15 минут.' });
  }
  partnerFormAttempts.set(ip, attempts + 1);

  const { name, store_name, store_address, phone, email } = req.body;
  if (!name || !store_name || !store_address || !phone || !email) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  try {
    await pool.query(
      'INSERT INTO partner_forms (name, store_name, store_address, phone, email) VALUES ($1, $2, $3, $4, $5)',
      [name, store_name, store_address, phone, email]
    );

    await notifyManagersAndAdmins(pool,
      `🤝 <b>Заявка на партнёрство</b>\n\nФИО: ${name}\nМагазин: ${store_name}\nАдрес: ${store_address}\nТелефон: ${phone}\nПочта: ${email}`
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Partner form error:', err);
    res.status(500).json({ error: 'Ошибка отправки. Попробуйте позже.' });
  }
});

// GET partner forms (admin only)
app.get('/api/partner-forms', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
  try {
    const { rows } = await pool.query('SELECT * FROM partner_forms ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Get partner forms error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// UPDATE partner form status/notes (admin only)
app.patch('/api/partner-forms/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
  const { status, notes } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE partner_forms SET status = COALESCE($1, status), notes = COALESCE($2, notes) WHERE id = $3 RETURNING *',
      [status, notes, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Не найдено' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Update partner form error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Approve partner form and create account
app.post('/api/partner-forms/:id/approve', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
  try {
    // Get the partner form
    const formResult = await pool.query('SELECT * FROM partner_forms WHERE id = $1', [req.params.id]);
    if (!formResult.rows.length) return res.status(404).json({ error: 'Заявка не найдена' });
    const form = formResult.rows[0];

    // Check if phone already exists
    const normalizedPhone = normalizePhone(form.phone);
    const existing = await pool.query('SELECT id FROM users WHERE phone = $1', [normalizedPhone]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Аккаунт с таким номером уже существует' });
    }

    // Generate PIN
    const pin = generatePin();

    // Create user account
    const { rows } = await pool.query(
      'INSERT INTO users (name, phone, email, role, pin, active, notes) VALUES ($1, $2, $3, $4, $5, true, $6) RETURNING *',
      [form.name, normalizedPhone, form.email || null, 'partner', pin, `Магазин: ${form.store_name}, Адрес: ${form.store_address}`]
    );

    // Update partner form status
    await pool.query(
      'UPDATE partner_forms SET status = $1, notes = COALESCE(notes, \'\') || $2 WHERE id = $3',
      ['done', `\nАккаунт создан. ПИН: ${pin}`, req.params.id]
    );

    // Notify partner via Telegram if they have telegram_id (they won't at this point, but send SMS/manual notification)
    // For now, return the PIN so admin can communicate it
    res.json({ 
      success: true, 
      user: rows[0], 
      pin,
      message: `Аккаунт партнёра создан. ПИН-код: ${pin}` 
    });
  } catch (err) {
    console.error('Approve partner error:', err);
    res.status(500).json({ error: 'Ошибка создания аккаунта' });
  }
});

// DELETE partner form (admin only)
app.delete('/api/partner-forms/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
  try {
    await pool.query('DELETE FROM partner_forms WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete partner form error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// === Web Push Notifications ===

// Configure VAPID
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:info@primedoor.ru',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Auto-create push_subscriptions table
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        endpoint TEXT UNIQUE NOT NULL,
        keys_p256dh TEXT NOT NULL,
        keys_auth TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('push_subscriptions table ready');
  } catch (err) {
    console.error('Failed to create push_subscriptions table:', err.message);
  }
})();

// Subscribe to push
app.post('/api/push/subscribe', auth, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription?.endpoint || !subscription?.keys) {
      return res.status(400).json({ error: 'Invalid subscription' });
    }
    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, keys_p256dh, keys_auth)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (endpoint) DO UPDATE SET user_id = $1, keys_p256dh = $3, keys_auth = $4`,
      [req.user.id, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Push subscribe error:', err);
    res.status(500).json({ error: 'Ошибка сохранения подписки' });
  }
});

// Unsubscribe from push
app.post('/api/push/unsubscribe', auth, async (req, res) => {
  try {
    const { endpoint } = req.body;
    await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
    res.json({ success: true });
  } catch (err) {
    console.error('Push unsubscribe error:', err);
    res.status(500).json({ error: 'Ошибка удаления подписки' });
  }
});

// Helper: send push to users by role(s)
async function sendPushToRoles(roles, payload) {
  if (!process.env.VAPID_PUBLIC_KEY) return;
  try {
    const placeholders = roles.map((_, i) => `$${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `SELECT ps.endpoint, ps.keys_p256dh, ps.keys_auth
       FROM push_subscriptions ps
       JOIN users u ON u.id = ps.user_id
       WHERE u.role IN (${placeholders}) AND u.active = true`,
      roles
    );
    for (const row of rows) {
      try {
        await webpush.sendNotification(
          { endpoint: row.endpoint, keys: { p256dh: row.keys_p256dh, auth: row.keys_auth } },
          JSON.stringify(payload)
        );
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [row.endpoint]);
        }
      }
    }
  } catch (err) {
    console.error('sendPushToRoles error:', err.message);
  }
}

// Helper: send push to specific user
async function sendPushToUser(userId, payload) {
  if (!process.env.VAPID_PUBLIC_KEY) return;
  try {
    const { rows } = await pool.query(
      'SELECT endpoint, keys_p256dh, keys_auth FROM push_subscriptions WHERE user_id = $1',
      [userId]
    );
    for (const row of rows) {
      try {
        await webpush.sendNotification(
          { endpoint: row.endpoint, keys: { p256dh: row.keys_p256dh, auth: row.keys_auth } },
          JSON.stringify(payload)
        );
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [row.endpoint]);
        }
      }
    }
  } catch (err) {
    console.error('sendPushToUser error:', err.message);
  }
}

app.listen(PORT, () => {
  console.log('PrimeDoor API running on port ' + PORT);
});
