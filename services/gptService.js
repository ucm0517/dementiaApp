// services/gptService.js
require('dotenv').config();
const apiKey = process.env.OPENAI_API_KEY;


export const fetchGPTResponse = async (messages) => {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
      }),
    });
  
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '응답을 받아오지 못했습니다.';
  };