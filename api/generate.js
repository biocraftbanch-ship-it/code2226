export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt, systemInstruction } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'BMA API Key not configured.' });
    }

    // --- 修正ポイント：v1beta から v1 へ変更 ---
    const baseUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

    try {
        const response = await fetch(`${baseUrl}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: systemInstruction }] }
            })
        });

        // Googleからのレスポンスを詳しくチェック
        const data = await response.json();

        if (!response.ok) {
            console.error('Google API Debug:', data);
            return res.status(response.status).json({ error: data.error?.message || 'BMA Central Link Error' });
        }
        
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "応答を復元できませんでした。";
        res.status(200).json({ text: aiText });

    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ error: 'Mission Failed: Terminal Connection Lost' });
    }
}
