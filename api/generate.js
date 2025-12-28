// BMA (記憶考古学局) サーバーサイド・プロトコル v3.1 Stable
// 安定稼働用：最新のGemini 3 Flash自動更新モデルを使用

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { prompt, systemInstruction } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'BMA API Key not configured.' });
    }

    // --- 修正ポイント：安定運用のため "preview" を外し、自動更新エイリアスを指定 ---
    // これにより、将来バージョンが上がってもコード修正なしで使い続けられます
    const model = "gemini-3-flash";
    
    // 安定版であっても最新機能へのアクセスには v1beta が推奨されるケースが多いです
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
                    maxOutputTokens: 16384, 
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('BMA Link Error:', data);
            return res.status(response.status).json({ 
                error: data.error?.message || 'BMA Central Link Error: Protocol Mismatch' 
            });
        }
        
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "応答データを受信できませんでした。";
        res.status(200).json({ text: aiText });

    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ error: 'Mission Failed: Connection Lost' });
    }
}
