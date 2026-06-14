const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const bot = new Telegraf('7683433339:AAEv3Mi8YugHxp8JFK6GJVE2vih2oTk3Zy4');

app.use(cors());
app.use(express.json());

// 1. Учим сервер показывать твой сайт
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'OnePixelPrice.html'));
});

// === СЮДА МЫ ВСТАВИМ ССЫЛКУ ИЗ ИНТЕРНЕТА ===
const WEB_APP_URL = 'https://cute-rabbits-battle.loca.lt';

// 2. Бот отправляет сообщение с кнопкой Web App
bot.start((ctx) => {
    ctx.reply(
        'Привет! Добро пожаловать в OnePixelPrice 🎨\n\nЖми кнопку ниже, чтобы открыть карту и купить свой пиксель!',
        Markup.inlineKeyboard([
            Markup.button.webApp('🌌 Открыть карту', WEB_APP_URL)
        ])
    );
});

bot.launch().then(() => console.log('Telegram Bot successfully started!'));
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));