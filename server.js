const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
console.log("🔐 GROQ_API_KEY =", process.env.GROQ_API_KEY ? 'ĐÃ TÌM THẤY' : 'CHƯA CÓ!');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

app.get('/', (req, res) => {
    res.send('✅ IG2FA backend (Groq) is running!');
});

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    console.log('📥 Nhận message:', userMessage);

    try {
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                messages: [
                    { role: 'system', content: 'Bạn là AI bảo mật IG2FA, dí dỏm, hacker style, bí ẩn.' },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.9
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const reply = response.data.choices[0].message.content;
        console.log('📤 AI trả lời:', reply);
        res.json({ reply });
    } catch (err) {
        console.error('❌ Lỗi khi gọi Groq API:', err.response ? err.response.data : err.message);
        res.status(500).json({ reply: '⚠️ Lỗi server. Hãy thử lại sau!' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server đang chạy tại cổng ${port}`));
