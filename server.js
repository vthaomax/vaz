const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

const allowedOrigins = ['https://taikhoanfb.shop', 'https://cloneig.shop'];
const API_KEY = process.env.API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('❌ Not allowed by CORS'));
        }
    }
}));

app.use(bodyParser.json());

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 phút
    max: 20,
    message: { reply: '⚠️ Quá nhiều yêu cầu. Hãy thử lại sau 1 phút.' }
});
app.use('/chat', limiter);

app.use('/chat', (req, res, next) => {
    const key = req.headers['x-api-key'];
    const token = req.headers['authorization'];

    if (key !== API_KEY) {
        return res.status(401).json({ reply: '❌ Invalid API Key' });
    }

    if (!token) {
        return res.status(401).json({ reply: '❌ Token missing' });
    }

    try {
        jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ reply: '❌ Invalid Token' });
    }
});

app.get('/', (req, res) => {
    res.send('✅ IG2FA is running with full security!');
});

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    console.log('📥 Nhận message:', userMessage);

    if (!userMessage || typeof userMessage !== 'string') {
        return res.status(400).json({ reply: '⚠️ Nội dung không hợp lệ.' });
    }

    try {
        const response = await axios.post(
            OPENROUTER_URL,
            {
                model: 'openai/gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'Bạn là AI bảo mật IG2FA, dí dỏm, hacker style, bí ẩn.' },
                    { role: 'user', content: userMessage }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            }
        );
        const reply = response.data.choices[0].message.content;
        console.log('📤 AI trả lời:', reply);
        res.json({ reply });
    } catch (err) {
        if (err.response) {
            console.error('❌ Lỗi từ OpenAI API:', err.response.data);
        } else if (err.request) {
            console.error('❌ Không nhận được phản hồi từ OpenAI.');
        } else {
            console.error('❌ Lỗi không xác định:', err.message);
        }
        res.status(500).json({ reply: '⚠️ Lỗi server. Hãy thử lại sau!' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server đang chạy tại cổng ${port}`));
