// BMA (記憶考古学局) サーバーサイド・プロトコル v2.5
// 最新の思考型モデル「gemini-2.5-flash-preview-09-2025」に対応

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { prompt, systemInstruction } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'BMA API Key not configured.' });
    }

    // --- 修正ポイント：Previewモデルのため v1beta を使用 ---
    const model = "gemini-2.5-flash-preview-09-2025";
    const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    try {
        const response = await fetch(`${baseUrl}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: systemInstruction }] },
                // 2.5モデルの「思考能力」を最大限活かす設定
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.95,
                    maxOutputTokens: 8192
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('BMA Link Error:', data);
            return res.status(response.status).json({ error: data.error?.message || 'BMA Central Link Error' });
        }
        
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "応答を復元できませんでした。";
        res.status(200).json({ text: aiText });

    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ error: 'Mission Failed: Terminal Connection Lost' });
    }
}
