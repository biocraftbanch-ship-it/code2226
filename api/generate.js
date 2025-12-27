// api/generate.js (最終安定版)
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { prompt, systemInstruction } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // ここでモデル名を "gemini-1.5-flash" に固定し、URLを v1beta に戻します
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    try {
        const response = await fetch(`${baseUrl}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: systemInstruction }] }
            })
        });

        const data = await response.json();
        if (!response.ok) return res.status(response.status).json({ error: data.error?.message });
        
        res.status(200).json({ text: data.candidates?.[0]?.content?.parts?.[0]?.text });
    } catch (error) {
        res.status(500).json({ error: 'BMA Server Error' });
    }
}
