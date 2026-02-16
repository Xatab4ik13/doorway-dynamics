require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { Pool } = require('pg');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const API_URL = 'http://localhost:3001';

bot.onText(/\/start(.*)/, async (msg, match) => {
  const telegramId = String(msg.from.id);
  const param = (match[1] || '').trim();

  // Команда /start myid — просто показать ID
  if (param === 'myid') {
    bot.sendMessage(msg.chat.id,
      `🆔 Ваш Telegram ID:\n\n<code>${telegramId}</code>\n\nСообщите его администратору для получения доступа к системе.`,
      { parse_mode: 'HTML' }
    );
    return;
  }

  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE telegram_id = $1 AND active = true',
      [telegramId]
    );

    if (rows.length === 0) {
      bot.sendMessage(msg.chat.id,
        '❌ Ваш Telegram ID (' + telegramId + ') не найден в системе.\n\nОбратитесь к администратору для получения доступа.'
      );
      return;
    }

    const user = rows[0];

    if (param) {
      // Confirm session via API
      const res = await fetch(API_URL + '/api/auth/telegram/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: param, telegramId }),
      });

      if (res.ok) {
        bot.sendMessage(msg.chat.id,
          '✅ Добро пожаловать, ' + user.name + '!\n\nВы авторизованы. Вернитесь на сайт — вход выполнен автоматически.'
        );
      } else {
        bot.sendMessage(msg.chat.id,
          '⚠️ Сессия истекла. Попробуйте нажать "Войти через Telegram" на сайте ещё раз.'
        );
      }
    } else {
      bot.sendMessage(msg.chat.id,
        '✅ Привет, ' + user.name + '!\n\nДля входа нажмите "Войти через Telegram" на сайте primedoor.ru'
      );
    }
  } catch (err) {
    console.error('Bot error:', err);
    bot.sendMessage(msg.chat.id, '⚠️ Произошла ошибка. Попробуйте позже.');
  }
});

bot.on('message', (msg) => {
  if (msg.text && !msg.text.startsWith('/')) {
    bot.sendMessage(msg.chat.id, 'Для входа в систему нажмите "Войти через Telegram" на сайте primedoor.ru');
  }
});

console.log('🤖 PrimeDoor Telegram Bot started');
