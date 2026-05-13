const ENDPOINT = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
const API_KEY = import.meta.env.VITE_AZURE_OPENAI_KEY;
const DEPLOYMENT = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT || "gpt-5.2-chat";
const API_VERSION = import.meta.env.VITE_AZURE_OPENAI_API_VERSION || "2024-12-01-preview";

export async function askAI(messages, systemPrompt) {
  const body = {
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })),
    ],
    max_completion_tokens: 512,
  };

  // In production, call Azure OpenAI directly; in dev, use Vite proxy
  const isDev = import.meta.env.DEV;
  const url = isDev
    ? `/api/openai?api-version=${API_VERSION}`
    : `${ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=${API_VERSION}`;

  const headers = { "Content-Type": "application/json" };
  if (!isDev) {
    headers["api-key"] = API_KEY;
  }

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    console.error("Network error calling AI:", networkErr);
    throw new Error("AI network error");
  }

  if (!res.ok) {
    const err = await res.text();
    console.error("Azure OpenAI error:", res.status, err);
    throw new Error("AI request failed");
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
}
