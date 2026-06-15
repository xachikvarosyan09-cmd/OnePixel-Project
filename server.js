const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// === ТВОЙ ТОКЕН ОТ @BotFather ===
const bot = new Telegraf('7683433339:AAGnhRGiD55vXP3MphNtvv2yPNt7BJWV8js');

app.use(cors());
app.use(express.json());

// 1. Учим сервер показывать твой сайт
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'OnePixelPrice.html'));
});

// === ССЫЛКА НА ТВОЙ САЙТ НА RENDER ===
const WEB_APP_URL = 'https://onepixel-project.onrender.com';

// Временное хранилище языка для пользователей
const userLang = {};

// Словари с текстами
const texts = {
    ru: {
        welcome: 'Привет! Добро пожаловать в OnePixelPrice 👇\nНажми кнопку ниже, чтобы открыть карту и купить свой пиксель!',
        btnText: '🌍 Открыть карту'
    },
    en: {
        welcome: 'Hello! Welcome to OnePixelPrice 👇\nClick the button below to open the map and buy your pixel!',
        btnText: '🌍 Open map'
    }
};

// 2. При старте просим выбрать язык
bot.start((ctx) => {
    ctx.reply(
        'Выберите язык / Choose your language:',
        Markup.inlineKeyboard([
            Markup.button.callback('🇷🇺 Русский', 'lang_ru'),
            Markup.button.callback('🇬🇧 English', 'lang_en')
        ])
    );
});

// 3. Обработка нажатия на "Русский"
bot.action('lang_ru', async (ctx) => {
    const userId = ctx.from.id;
    userLang[userId] = 'ru'; // Запоминаем выбор пользователя

    await ctx.deleteMessage(); // Удаляем сообщение с выбором языка
    await ctx.reply(
        texts.ru.welcome,
        Markup.inlineKeyboard([
            Markup.button.webApp(texts.ru.btnText, WEB_APP_URL)
        ])
    );
});

// 4. Обработка нажатия на "English"
bot.action('lang_en', async (ctx) => {
    const userId = ctx.from.id;
    userLang[userId] = 'en'; // Запоминаем выбор пользователя

    await ctx.deleteMessage(); // Удаляем сообщение с выбором языка
    await ctx.reply(
        texts.en.welcome,
        Markup.inlineKeyboard([
            Markup.button.webApp(texts.en.btnText, WEB_APP_URL)
        ])
    );
});

// Запуск бота и сервера
bot.launch().then(() => console.log('Telegram Bot successfully started!'));
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));