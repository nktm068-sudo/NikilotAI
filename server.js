const express = require('express');
const axios = require('axios');
const { Octokit } = require('@octokit/rest');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Инициализируем Octokit с GitHub токеном
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!process.env.GITHUB_TOKEN) {
      return res.status(400).json({ 
        error: '❌ GitHub токен не установлен в .env файле!' 
      });
    }

    // Используем GitHub Copilot через модели
    // Примечание: GitHub Copilot API работает через разные endpoints
    // Здесь используется Copilot Chat через модели
    
    const response = await axios.post(
      'https://api.github.com/models/claude-3-5-sonnet-20241022/messages',
      {
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.content[0].text;

    res.json({ 
      reply: reply || '🤖 Хм, что-то пошло не так. Попробуй ещё раз!'
    });

  } catch (error) {
    console.error('❌ Ошибка API:', error.response?.data || error.message);
    
    res.status(500).json({ 
      error: `⚠️ Ошибка: ${error.response?.data?.message || error.message}` 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 NikilotAI запущен на http://localhost:${PORT}`);
  console.log(`📡 GitHub Copilot API активирован!`);
});
