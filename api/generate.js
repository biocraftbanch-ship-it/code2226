// BMA (記憶考古学局) サーバーサイド・プロトコル v3.0
// 2025年12月リリースの最新モデル「gemini-3-flash」に対応

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { prompt, systemInstruction } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'BMA API Key not configured.' });
    }

    // --- 修正ポイント：最新の Gemini 3 Flash モデルを指定 ---
    const model = "gemini-3-flash";
    const baseUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`;

    try {
        const response = await fetch(`${baseUrl}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: systemInstruction }] },
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.95,
                    maxOutputTokens: 8192
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('BMA Central Link Error:', data);
            return res.status(response.status).json({ error: data.error?.message || 'BMA Central Link Error' });
        }
        
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "応答を復元できませんでした。";
        res.status(200).json({ text: aiText });

    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ error: 'Mission Failed: Terminal Connection Lost' });
    }
}
