import Groq from "groq-sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message tidak boleh kosong" });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: message }],
      temperature: 0.7,
      max_tokens: 512,
    });

    res.status(200).json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error("Groq API error:", err);
    res.status(500).json({ error: "Error koneksi ke API Groq." });
  }
}
