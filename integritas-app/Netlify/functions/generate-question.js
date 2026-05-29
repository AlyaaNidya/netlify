import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { role, aspect } = JSON.parse(event.body);
    const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Anda adalah seorang HR Professional dan Psikolog. Buat 1 pertanyaan wawancara kerja tingkat lanjut untuk posisi "${role}" guna menilai aspek psikologis "${aspect}" mereka. Pertanyaan harus situasional (behavioral event interview). Jawab dengan pertanyaannya saja, tanpa teks pengantar apapun.`;

    const result = await model.generateContent(prompt);
    const question = result.response.text().trim();

    return { statusCode: 200, body: JSON.stringify({ question }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: "Gagal memproses AI" }) };
  }
};