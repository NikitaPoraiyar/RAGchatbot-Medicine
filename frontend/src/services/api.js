export async function sendChatMessage(messages) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const res = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error: ${res.status} ${text}`);
    }

    return res.json();
}
