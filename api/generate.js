// BMA (記憶考古学局) サーバーサイド・プロトコル
// このファイルはVercelなどのサーバー上で実行され、APIキーを秘匿します。

export default async function handler(req, res) {
    // POSTメソッド以外は受け付けない（セキュリティ対策）
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt, systemInstruction } = req.body;
    
    // Vercelの設定画面で登録した「GEMINI_API_KEY」を読み込む
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'BMA API Key not configured in environment.' });
    }

    // Google Gemini API のエンドポイント
    // モデルは高速で安定している 1.5-flash を使用します
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    try {
        const response = await fetch(`${baseUrl}?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: prompt }] 
                }],
                systemInstruction: { 
                    parts: [{ text: systemInstruction }] 
                },
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Error:', errorData);
            return res.status(response.status).json({ error: 'BMA Central Link Error' });
        }

        const data = await response.json();
        
        // AIの回答テキストを抽出
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "応答を復元できませんでした。";

        // フロントエンドに結果を返す
        res.status(200).json({ text: aiText });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Mission Failed: Terminal Connection Lost' });
    }
}