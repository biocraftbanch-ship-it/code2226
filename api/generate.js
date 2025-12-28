// BMA (記憶考古学局) サーバーサイド・プロトコル v3.2 Fix
// 稼働確認済みモデル「gemini-2.0-flash-exp」対応版

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { prompt, systemInstruction } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'BMA API Key not configured.' });
    }

    // --- 修正ポイント：確実に動作する最新のExperimentalモデルを指定 ---
    // 現時点で最も賢く、速い Flash モデルです
    const model = "gemini-2.0-flash-exp";
    
    const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

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
                    maxOutputTokens: 8192, // 2.0 Flash Exp の安定ライン
                }
            })
        });

        const data = await response.json();

        // エラーハンドリング：もしモデル名が間違っていた場合、ここで詳細がわかります
        if (!response.ok) {
            console.error('BMA Link Error:', JSON.stringify(data, null, 2));
            return res.status(response.status).json({ 
                error: data.error?.message || 'BMA Central Link Error: Model Not Found' 
            });
        }
        
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "応答データを受信できませんでした。";
        res.status(200).json({ text: aiText });

    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ error: 'Mission Failed: Connection Lost' });
    }
}
