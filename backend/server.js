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
  client_refused: 'Отказ клиента',
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
  if (['admin', 'manager'].includes(role)) {
    return true;
  }

  if (role === 'measurer' && type === 'measurement' && ['pending', 'client_refused'].includes(toStatus) && !['closed', 'cancelled'].includes(fromStatus)) {
    return true;
  }

  // Admin/manager can set pending from any non-closed status
  if (['admin', 'manager'].includes(role) && toStatus === 'pending' && fromStatus !== 'closed') {
    return true;
  }
  // Admin/manager/measurer can set client_refused from any status
  if (['admin', 'manager', 'measurer'].includes(role) && toStatus === 'client_refused') {
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
const REPORT_TIMEZONE = 'Europe/Moscow';

function dateFilterExpr(column) {
  return `timezone('${REPORT_TIMEZONE}', ${column})::date`;
}

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'ru-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

const MAX_UPLOAD_SIZE = 80 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE },
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

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: `Файл слишком большой. Максимум ${Math.round(MAX_UPLOAD_SIZE / (1024 * 1024))} МБ` });
    }
    return res.status(400).json({ error: 'Ошибка загрузки файла' });
  }

  return next(err);
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
      [name, role, telegramId, normalizePhone(phone) || null, email || null, notes || null, pin || null]
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
    if (phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(normalizePhone(phone) || null); }
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
      date_from, date_to, quick, source_filter
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
      // Smart phone search: normalize 8xxx to +7xxx for phone matching
      const searchNorm = search.replace(/\s/g, '');
      const phoneVariants = [];
      if (/^8\d{10}$/.test(searchNorm)) {
        phoneVariants.push('+7' + searchNorm.slice(1));
        phoneVariants.push(searchNorm);
      } else if (/^\+?7\d{10}$/.test(searchNorm)) {
        phoneVariants.push(searchNorm.startsWith('+') ? searchNorm : '+' + searchNorm);
        phoneVariants.push('8' + searchNorm.replace(/^\+?7/, ''));
      }
      
      if (phoneVariants.length > 0) {
        conds.push(`(client_name ILIKE $${idx} OR number ILIKE $${idx} OR client_address ILIKE $${idx} OR city ILIKE $${idx} OR client_phone ILIKE $${idx} OR client_phone ILIKE $${idx+1})`);
        params.push(`%${search}%`); idx++;
        params.push(`%${phoneVariants[0]}%`); idx++;
      } else {
        conds.push(`(client_name ILIKE $${idx} OR number ILIKE $${idx} OR client_address ILIKE $${idx} OR client_phone ILIKE $${idx} OR city ILIKE $${idx})`);
        params.push(`%${search}%`); idx++;
      }
    }
    if (status && status !== 'all') { conds.push(`status = $${idx++}`); params.push(status); }
    if (type && type !== 'all') { conds.push(`type = $${idx++}`); params.push(type); }
    if (measurer_id && measurer_id !== 'all') { conds.push(`measurer_id = $${idx++}`); params.push(measurer_id); }
    if (installer_id && installer_id !== 'all') { conds.push(`installer_id = $${idx++}`); params.push(installer_id); }
    if (city && city !== 'all') { conds.push(`city = $${idx++}`); params.push(city); }
    if (partner_id && partner_id !== 'all') { conds.push(`partner_id = $${idx++}`); params.push(partner_id); }
    if (source_filter && source_filter !== 'all') {
      if (source_filter === 'doorium') { conds.push(`external_system = 'doorium'`); }
      else if (source_filter === 'partner') { conds.push(`partner_id IS NOT NULL AND (external_system IS NULL OR external_system != 'doorium')`); }
      else if (source_filter === 'site') { conds.push(`partner_id IS NULL AND (external_system IS NULL OR external_system != 'doorium')`); }
    }
    const requestedDateField = req.query.date_field === 'closed_at' ? 'closed_at' : 'created_at';
    if (requestedDateField === 'closed_at') {
      conds.push(`status = 'closed'`);
    }
    const dateColExpr = requestedDateField === 'closed_at'
      ? dateFilterExpr('closed_at')
      : dateFilterExpr('created_at');
    if (date_from) { conds.push(`${dateColExpr} >= $${idx++}::date`); params.push(date_from); }
    if (date_to) { conds.push(`${dateColExpr} <= $${idx++}::date`); params.push(date_to); }

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

    let requestsData = dataRes.rows;
    const partnerIds = [...new Set(requestsData.map((row) => row.partner_id).filter(Boolean))];
    if (partnerIds.length > 0) {
      const partnerRes = await pool.query(
        'SELECT id, name, phone FROM users WHERE id = ANY($1::uuid[])',
        [partnerIds]
      );
      const partnersById = new Map(partnerRes.rows.map((partner) => [partner.id, partner]));
      requestsData = requestsData.map((row) => {
        if (!row.partner_id) return row;
        const partner = partnersById.get(row.partner_id);
        return partner
          ? { ...row, partner_name: partner.name, partner_phone: partner.phone || null }
          : row;
      });
    }

    res.json({
      data: requestsData,
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
      title: `Новая заявка ${req_data.number}`,
      body: `${req_data.client_name} — ${req_data.client_address}`,
      url: `/admin/requests?search=${encodeURIComponent(req_data.number)}`,
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
      title: `Новая заявка ${req_data.number}`,
      body: `${req_data.client_name} — ${req_data.client_address}`,
      url: `/admin/requests?search=${encodeURIComponent(req_data.number)}`,
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

    if (role === 'measurer' && request.type === 'measurement' && updates.status && ['pending', 'client_refused'].includes(updates.status)) {
      const trimmedComment = typeof updates.status_comment === 'string' ? updates.status_comment.trim() : '';
      if (!trimmedComment) {
        return res.status(400).json({ error: 'Для этого статуса нужен комментарий' });
      }
      updates.status_comment = trimmedComment;
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
      // If admin explicitly sent closed_at, respect it; otherwise auto-set on close
      const hasExplicitClosedAt = Object.prototype.hasOwnProperty.call(req.body, 'closed_at');
      if (updates.status === 'closed' && request.status !== 'closed' && !hasExplicitClosedAt) {
        updates.closed_at = new Date().toISOString();
      }
      // Если заявку переоткрывают — сбрасываем closed_at
      if (updates.status && updates.status !== 'closed' && request.status === 'closed' && !hasExplicitClosedAt) {
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
        url: `/measurer?highlight=${updated.id}`,
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
          url: `/measurer`,
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
        url: `/installer?highlight=${updated.id}`,
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
          url: `/installer`,
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
        url: `/admin/requests?search=${encodeURIComponent(updated.number)}`,
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
        url: `/admin/requests?search=${encodeURIComponent(updated.number)}`,
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
          title: 'Заявка отменена',
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
        title: `Статус заявки ${updated.number}`,
        body: `Новый статус: ${statusLabels[updates.status] || updates.status}`,
        url: `/partner?search=${encodeURIComponent(updated.number)}`,
      });
    }

    // === AUTO-SYNC: push changes to Doorium if this request is linked ===
    if (updated.external_id && updated.external_system === 'doorium' && DOORIUM_API_URL && DOORIUM_API_KEY) {
      try {
        const syncPayload = {
          source_id: updated.id,
          source_number: updated.number,
          status: statusToDoorium[updated.status] || updated.status,
          agreed_date: updated.agreed_date || null,
          amount: updated.amount || null,
          status_comment: updated.status_comment || null,
          notes: updated.notes || null,
          work_description: updated.work_description || null,
          client_name: updated.client_name || null,
          client_phone: updated.client_phone || null,
          client_address: updated.client_address || null,
          city: updated.city || null,
          extra_name: updated.extra_name || null,
          extra_phone: updated.extra_phone || null,
          interior_doors: updated.interior_doors ?? null,
          entrance_doors: updated.entrance_doors ?? null,
          partitions: updated.partitions ?? null,
          photos: updated.photos || null,
        };
        const syncRes = await fetch(`${DOORIUM_API_URL}/api/bridge/update/${updated.external_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Bridge-Key': DOORIUM_API_KEY,
          },
          body: JSON.stringify(syncPayload),
        });
        if (!syncRes.ok) {
          const errBody = await syncRes.text();
          console.error(`Bridge auto-sync failed [${syncRes.status}]:`, errBody);
        } else {
          console.log(`Bridge auto-sync OK for request ${updated.number} → Doorium ${updated.external_id}`);
        }
      } catch (syncErr) {
        console.error('Bridge auto-sync error:', syncErr.message);
      }
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

// === Startup check: ensure closed_at column exists ===
(async () => {
  try {
    await pool.query(`ALTER TABLE requests ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ`);
    hasClosedAtColumn = true;
    console.log('Startup check: closed_at column ready');
  } catch (err) {
    hasClosedAtColumn = false;
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

// === Bridge (Doorium integration) ===

const DOORIUM_API_URL = process.env.DOORIUM_API_URL;
const DOORIUM_API_KEY = process.env.DOORIUM_API_KEY;
const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY;

// Auto-create external_id / external_system columns
(async () => {
  try {
    await pool.query(`
      ALTER TABLE requests ADD COLUMN IF NOT EXISTS external_id TEXT;
      ALTER TABLE requests ADD COLUMN IF NOT EXISTS external_system TEXT;
    `);
    console.log('Bridge: external_id/external_system columns ready');
  } catch (err) {
    console.error('Bridge columns error:', err.message);
  }
})();

// Status mapping: PrimeDoor → Doorium
const statusToDoorium = {
  new: 'new',
  pending: 'pending',
  measurer_assigned: 'measurer_assigned',
  installer_assigned: 'installer_assigned',
  date_agreed: 'date_agreed',
  installation_rescheduled: 'installation_rescheduled',
  measurement_done: 'measurement_done',
  closed: 'closed',
  cancelled: 'cancelled',
  client_refused: 'client_refused',
};

// Status mapping: Doorium → PrimeDoor
const statusFromDoorium = {};
Object.entries(statusToDoorium).forEach(([k, v]) => { statusFromDoorium[v] = k; });

// Bridge auth middleware (for incoming requests from Doorium)
const bridgeAuth = (req, res, next) => {
  const key = req.headers['x-bridge-key'] || req.headers['x-api-key'];
  if (!BRIDGE_API_KEY || key !== BRIDGE_API_KEY) {
    return res.status(401).json({ error: 'Invalid bridge key' });
  }
  next();
};

// Send request to Doorium (admin clicks "В Doorium")
app.post('/api/bridge/send/:id', auth, async (req, res) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Нет доступа' });
  }
  if (!DOORIUM_API_URL || !DOORIUM_API_KEY) {
    return res.status(500).json({ error: 'Doorium не настроен (DOORIUM_API_URL / DOORIUM_API_KEY)' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM requests WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Заявка не найдена' });
    const r = rows[0];
    if (r.external_id) return res.status(400).json({ error: 'Заявка уже передана в Doorium' });

    const payload = {
      source_system: 'primedoor',
      source_id: r.id,
      source_number: r.number,
      type: r.type,
      status: statusToDoorium[r.status] || r.status,
      client_name: r.client_name,
      client_phone: r.client_phone,
      client_address: r.client_address,
      city: r.city,
      extra_name: r.extra_name,
      extra_phone: r.extra_phone,
      work_description: r.work_description,
      notes: r.notes,
      agreed_date: r.agreed_date,
      interior_doors: r.interior_doors,
      entrance_doors: r.entrance_doors,
      partitions: r.partitions,
      amount: r.amount,
      photos: r.photos,
    };

    const response = await fetch(`${DOORIUM_API_URL}/api/bridge/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Bridge-Key': DOORIUM_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `Doorium returned ${response.status}`);

    // Save external_id
    await pool.query(
      'UPDATE requests SET external_id = $1, external_system = $2, updated_at = NOW() WHERE id = $3',
      [result.id || result.external_id, 'doorium', r.id]
    );

    const updated = await pool.query('SELECT * FROM requests WHERE id = $1', [r.id]);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Bridge send error:', err);
    res.status(500).json({ error: err.message || 'Ошибка отправки в Doorium' });
  }
});

// Sync status from Doorium (admin clicks "Синхр.")
app.post('/api/bridge/sync/:id', auth, async (req, res) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Нет доступа' });
  }
  if (!DOORIUM_API_URL || !DOORIUM_API_KEY) {
    return res.status(500).json({ error: 'Doorium не настроен' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM requests WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Заявка не найдена' });
    const r = rows[0];
    if (!r.external_id || r.external_system !== 'doorium') {
      return res.status(400).json({ error: 'Заявка не связана с Doorium' });
    }

    // Fetch status from Doorium
    const response = await fetch(`${DOORIUM_API_URL}/api/bridge/status/${r.external_id}`, {
      headers: { 'X-Bridge-Key': DOORIUM_API_KEY },
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `Doorium returned ${response.status}`);

    const updates = [];
    const params = [];
    let idx = 1;

    // Map status
    if (result.status) {
      const mapped = statusFromDoorium[result.status] || result.status;
      updates.push(`status = $${idx++}`);
      params.push(mapped);
    }
    // Map agreed_date
    if (result.agreed_date !== undefined) {
      updates.push(`agreed_date = $${idx++}`);
      params.push(result.agreed_date);
    }
    // Map amount
    if (result.amount !== undefined) {
      updates.push(`amount = $${idx++}`);
      params.push(result.amount);
    }
    // Map status_comment
    if (result.status_comment) {
      updates.push(`status_comment = $${idx++}`);
      params.push(result.status_comment);
    }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      params.push(r.id);
      await pool.query(`UPDATE requests SET ${updates.join(', ')} WHERE id = $${idx}`, params);
    }

    const updated = await pool.query('SELECT * FROM requests WHERE id = $1', [r.id]);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Bridge sync error:', err);
    res.status(500).json({ error: err.message || 'Ошибка синхронизации' });
  }
});

// Receive request from Doorium (Doorium pushes to us)
app.post('/api/bridge/receive', bridgeAuth, async (req, res) => {
  try {
    const {
      source_system, source_id, source_number,
      type, status, client_name, client_phone: rawPhone,
      client_address, city, extra_name, extra_phone: rawExtraPhone,
      work_description, notes, agreed_date,
      interior_doors, entrance_doors, partitions, amount, photos,
    } = req.body;

    if (!client_name || !rawPhone) {
      return res.status(400).json({ error: 'client_name and client_phone required' });
    }

    const client_phone = normalizePhone(rawPhone) || rawPhone;
    const extra_phone = rawExtraPhone ? (normalizePhone(rawExtraPhone) || rawExtraPhone) : null;

    // Check if already received (by source_id + source_system)
    if (source_id && source_system) {
      const existing = await pool.query(
        'SELECT id FROM requests WHERE external_id = $1 AND external_system = $2',
        [source_id, source_system]
      );
      if (existing.rows.length > 0) {
        // Update existing request instead of creating duplicate
        const existingId = existing.rows[0].id;
        const mappedStatus = statusFromDoorium[status] || status || 'new';
        await pool.query(
          `UPDATE requests SET status = $1, agreed_date = $2, amount = $3, 
           status_comment = $4, notes = $5, updated_at = NOW() WHERE id = $6`,
          [mappedStatus, agreed_date || null, amount || null, null, notes || null, existingId]
        );
        const updated = await pool.query('SELECT * FROM requests WHERE id = $1', [existingId]);
        return res.json({ id: existingId, number: updated.rows[0].number, updated: true });
      }
    }

    // Generate new request number
    const countResult = await pool.query(
      "SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 5) AS INTEGER)), 0) AS count FROM requests"
    );
    const number = 'REQ-' + String(parseInt(countResult.rows[0].count) + 1).padStart(3, '0');
    const mappedStatus = statusFromDoorium[status] || status || 'new';

    // Auto-assign partner: look for Doorium's default partner by phone
    let autoPartnerId = null;
    const DOORIUM_PARTNER_PHONE = '+79168191996';
    try {
      const partnerRes = await pool.query(
        "SELECT id FROM users WHERE phone = $1 AND role = 'partner' AND active = true LIMIT 1",
        [DOORIUM_PARTNER_PHONE]
      );
      if (partnerRes.rows.length > 0) {
        autoPartnerId = partnerRes.rows[0].id;
      }
    } catch (err) {
      console.error('Auto-assign partner lookup error:', err.message);
    }

    const { rows } = await pool.query(
      `INSERT INTO requests (number, client_name, client_phone, client_address, city, type, 
       work_description, extra_name, extra_phone, source, photos, status, notes,
       agreed_date, interior_doors, entrance_doors, partitions, amount,
       external_id, external_system, partner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) RETURNING *`,
      [
        number, client_name, client_phone, client_address || null, city || null,
        type || 'installation', work_description || null, extra_name || null, extra_phone,
        autoPartnerId ? 'partner' : 'site', photos ? JSON.stringify(photos) : '[]', mappedStatus, notes || null,
        agreed_date || null, interior_doors || null, entrance_doors || null, partitions || null,
        amount || null, source_id || null, source_system || null, autoPartnerId,
      ]
    );

    // Notify managers about incoming bridge request
    const sysLabel = source_system ? ` из ${source_system.charAt(0).toUpperCase() + source_system.slice(1)}` : '';
    await notifyManagersAndAdmins(pool,
      `🔗 <b>Входящая заявка${sysLabel}</b>\n\n№ ${number}\nКлиент: ${client_name}\nТелефон: ${client_phone}\nАдрес: ${client_address || '—'}\n\n👉 <a href="${SITE_URL}/admin/requests">Открыть заявки</a>`
    );

    res.json({ id: rows[0].id, number: rows[0].number, created: true });
  } catch (err) {
    console.error('Bridge receive error:', err);
    res.status(500).json({ error: err.message || 'Ошибка приёма заявки' });
  }
});

// Return status of a request to external system (Doorium calls this to sync)
app.get('/api/bridge/status/:externalId', bridgeAuth, async (req, res) => {
  try {
    // externalId here is OUR request id (we are the source)
    const { rows } = await pool.query('SELECT * FROM requests WHERE id = $1', [req.params.externalId]);
    if (!rows.length) {
      // Try by external_id
      const alt = await pool.query('SELECT * FROM requests WHERE external_id = $1', [req.params.externalId]);
      if (!alt.rows.length) return res.status(404).json({ error: 'Request not found' });
      const r = alt.rows[0];
      return res.json({
        status: statusToDoorium[r.status] || r.status,
        agreed_date: r.agreed_date,
        amount: r.amount,
        status_comment: r.status_comment,
      });
    }
    const r = rows[0];
    res.json({
      status: statusToDoorium[r.status] || r.status,
      agreed_date: r.agreed_date,
      amount: r.amount,
      status_comment: r.status_comment,
    });
  } catch (err) {
    console.error('Bridge status error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Receive updates from Doorium for a linked request (auto-sync from their side)
app.put('/api/bridge/update/:id', bridgeAuth, async (req, res) => {
  try {
    const externalId = req.params.id;
    const { status, agreed_date, amount, status_comment, notes, work_description, source_id, source_number,
            client_name, client_phone, client_address, city, extra_name, extra_phone,
            interior_doors, entrance_doors, partitions, photos } = req.body;

    // Find our request by external_id (their id) or by our id (if they sent source_id)
    let row;
    const byExt = await pool.query('SELECT * FROM requests WHERE external_id = $1', [externalId]);
    if (byExt.rows.length) {
      row = byExt.rows[0];
    } else {
      // Maybe externalId is our own id (we are the source)
      const byId = await pool.query('SELECT * FROM requests WHERE id = $1 AND external_system IS NOT NULL', [externalId]);
      if (byId.rows.length) row = byId.rows[0];
    }

    if (!row) return res.status(404).json({ error: 'Request not found' });

    const updates = {};
    if (status) {
      const mapped = statusFromDoorium[status] || status;
      if (mapped !== row.status) updates.status = mapped;
    }
    if (agreed_date !== undefined && agreed_date !== row.agreed_date) updates.agreed_date = agreed_date;
    if (amount !== undefined && amount !== row.amount) updates.amount = amount;
    if (status_comment !== undefined) updates.status_comment = status_comment;
    if (notes !== undefined) updates.notes = notes;
    if (work_description !== undefined) updates.work_description = work_description;
    if (client_name !== undefined && client_name !== row.client_name) updates.client_name = client_name;
    if (client_phone !== undefined && client_phone !== row.client_phone) updates.client_phone = client_phone;
    if (client_address !== undefined && client_address !== row.client_address) updates.client_address = client_address;
    if (city !== undefined && city !== row.city) updates.city = city;
    if (extra_name !== undefined) updates.extra_name = extra_name;
    if (extra_phone !== undefined) updates.extra_phone = extra_phone;
    if (interior_doors !== undefined) updates.interior_doors = interior_doors;
    if (entrance_doors !== undefined) updates.entrance_doors = entrance_doors;
    if (partitions !== undefined) updates.partitions = partitions;
    if (photos !== undefined) updates.photos = photos;

    // Auto-set closed_at
    if (updates.status === 'closed' && row.status !== 'closed') {
      updates.closed_at = new Date().toISOString();
    }
    if (updates.status && updates.status !== 'closed' && row.status === 'closed') {
      updates.closed_at = null;
    }

    if (Object.keys(updates).length === 0) {
      return res.json({ message: 'No changes', id: row.id });
    }

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
    fields.push(`updated_at = NOW()`);
    values.push(row.id);

    const result = await pool.query(
      `UPDATE requests SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    console.log(`Bridge update received for ${row.number}: ${JSON.stringify(updates)}`);
    res.json({ id: result.rows[0].id, number: result.rows[0].number, updated: true });
  } catch (err) {
    console.error('Bridge update error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log('PrimeDoor API running on port ' + PORT);
});
