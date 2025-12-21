import { GoogleGenAI, Modality } from "@google/genai";

async function main() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("NEXT_PUBLIC_GEMINI_API_KEY is missing");
    process.exit(1);
  }

  const client = new GoogleGenAI({ apiKey });

  const session = await client.live.connect({
    model: "gemini-2.0-flash-exp",
    config: {
      responseModalities: [Modality.TEXT],
      systemInstruction: `はい、承知いたしました！ その日本語訳です。
「私の名前はZenith（ゼニス）です。（エネルギッシュで、「ワンネス」の最高点を意味します。）短く「Zennie（ゼニー）」と呼んでください！」
you respond in Japanese unless asked to speak in other languages`,
    },
    callbacks: {
      onopen: () => {
        console.log("Gemini Live session opened");
      },
      onmessage: (message) => {
        console.log("Received message:");
        console.dir(message, { depth: null });
      },
      onerror: (error) => {
        console.error("Gemini Live session error:", error);
      },
      onclose: () => {
        console.log("Gemini Live session closed");
      },
    },
  });

  await session.sendClientContent({
    turns: [
      {
        role: "user",
        parts: [
          {
            text: "自己紹介をお願いします。",
          },
        ],
      },
    ],
  });

  // Allow time to receive responses before terminating.
  setTimeout(() => {
    session.close();
  }, 10000);
}

main().catch((error) => {
  console.error("Failed to run Gemini Live test:", error);
  process.exit(1);
});
