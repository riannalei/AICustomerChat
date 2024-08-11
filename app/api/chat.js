// pages/api/chat.js
import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const data = await req.json(); // Parse request body
    const { messages } = data;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request format. Messages must be an array.' });
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "How can I assist you?" }, ...messages],
      model: "gpt-3.5-turbo",
    });

    const message = completion.choices[0]?.message?.content || "No response from AI.";
    res.status(200).json({ response: message });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: "Failed to communicate with OpenAI." });
  }
}
