import { Groq } from 'groq-sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt kosong' });

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Streaming response ke client
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant (Bahasa Indonesia).' },
        { role: 'user', content: prompt }
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: true,
      reasoning_effort: 'medium'
    });

    for await (const chunk of chatCompletion) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) res.write(`data: ${content}\n\n`);
    }

    res.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error', details: String(e) });
  }
}
