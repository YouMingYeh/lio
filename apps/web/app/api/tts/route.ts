import { ElevenLabsClient } from "elevenlabs";

const voiceList = ["Sarah", "Roger"];

export async function POST(req: Request) {
  const { text, voice } = (await req.json()) as {
    text: string;
    voice: string;
  };

  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });

  const audio = await elevenlabs.generate({
    voice: voiceList.includes(voice) ? voice : "Sarah",
    text: text,
    model_id: "eleven_flash_v2_5",
  });

  // @ts-ignore
  return new Response(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
    },
  });
}
