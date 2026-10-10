const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 1. Endpoint Utama untuk Mengecek Status Server Etheria
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Selamat datang di Backend Etheria AI Engine! 🚀'
    });
});

// 2. Endpoint Webhook untuk Menerima & Membalas Chat Pelanggan
app.post('/api/v1/chat', async (req, res) => {
    try {
        const { customerPhone, messageText, businessContext } = req.body;

        if (!messageText) {
            return res.status(400).json({ error: 'Pesan dari pelanggan tidak boleh kosong!' });
        }

        // Konteks dasar atau persona bot untuk bisnis klien
        const systemPrompt = businessContext || 
            'Anda adalah AI Customer Service profesional untuk Etheria. Jawab dengan ramah, singkat, dan membantu.';

        // Panggil OpenAI API (Otak AI Etheria)
        const aiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: messageText }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const replyText = aiResponse.data.choices[0].message.content;

        // Kirim balik jawaban AI ke sistem pemanggil
        res.status(200).json({
            status: 'success',
            customerPhone: customerPhone,
            reply: replyText
        });

    } catch (error) {
        console.error('Error pada AI Engine:', error.response?.data || error.message);
        res.status(500).json({ error: 'Terjadi kesalahan pada server Etheria.' });
    }
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server Etheria sedang berjalan di port ${PORT}`);
});
