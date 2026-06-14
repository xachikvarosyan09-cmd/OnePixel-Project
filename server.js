const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Твой токен бота из скриншота
const bot = new Telegraf('7683433330:AAFv3M1RYugHxpR3FKGGJVE2vih2mTk37y4');

// ========================================================
// НАСТРОЙКА КРИПТО-ПЛАТЕЖЕЙ
// ========================================================
// Сюда вставишь токен, который выдаст @CryptoPayTestBot или @CryptoBot
const CRYPTO_BOT_TOKEN = 'ТВОЙ_ТОКЕН_ОТ_КРИПТОБОТА'; 
// Ссылка для ТЕСТОВОГО бота. Когда перейдешь на реальный баланс, замени testnet-pay на pay
const CRYPTO_API_URL = 'https://testnet-pay.cryptobot.app/api/createInvoice'; 

app.use(cors());
app.use(express.json());

// 1. Учим сервер показывать твой сайт
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'OnePixelPrice.html'));
});

// Ссылка на твой текущий рабочий сайт на Render
const WEB_APP_URL = 'https://onepixel-project.onrender.com';

// ========================================================
// ЭНДПОИНТ ДЛЯ СОЗДАНИЯ ОПЛАТЫ (Сюда будет стучаться фронтенд)
// ========================================================
app.post('/api/create-payment', async (req, res) => {
    try {
        const { width, height } = req.body; // Получаем размеры выделенного баннера

        if (!width || !height) {
            return res.status(400).json({ success: false, error: 'Неверные размеры баннера' });
        }

        // Считаем стоимость. Например: 1 блок (10х10 пикселей) стоит 0.01 USDT
        const blocksCount = (width / 10) * (height / 10);
        const totalPrice = (blocksCount * 0.01).toFixed(2); // Округляем до 2 знаков для крипты

        // Запрос к CryptoBot API на создание счета
        const cryptoResponse = await fetch(CRYPTO_API_URL, {
            method: 'POST',
            headers: {
                'Crypto-Pay-API-Token': CRYPTO_BOT_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                asset: 'USDT', // Валюта оплаты (USDT, TON, BTC, NOT)
                amount: totalPrice, // Итоговая сумма
                description: `Покупка пиксельного места ${width}x${height}`,
                max_payments: 1
            })
        });

        const paymentData = await cryptoResponse.json();

        if (paymentData.ok) {
            // Возвращаем фронтенду прямую ссылку на оплату в телеге
            res.json({ success: true, payUrl: paymentData.result.bot_invoice_url });
        } else {
            console.error('Ошибка платежки CryptoBot:', paymentData);
            res.status(500).json({ success: false, error: 'CryptoBot не создал счет' });
        }

    } catch (error) {
        console.error('Критическая ошибка сервера:', error);
        res.status(500).json({ success: false, error: 'Ошибка на стороне сервера' });
    }
});

// 2. Бот отправляет сообщение с кнопкой Web App
bot.start((ctx) => {
    ctx.reply(
        'Привет! Добро пожаловать в OnePixelPrice 🎨 \n\nЖми кнопку ниже, чтобы открыть карту и купить свой пиксель!',
        Markup.inlineKeyboard([
            Markup.button.webApp("Открыть карту", WEB_APP_URL)
        ])
    );
});

bot.launch().then(() => console.log('Telegram Bot successfully started!'));
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));