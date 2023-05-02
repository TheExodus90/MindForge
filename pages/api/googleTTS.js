import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { config as loadEnvConfig } from "dotenv";

loadEnvConfig();

const client = new TextToSpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export default async function (req, res) {
  const { text, voice } = req.body;

  console.log(`Received voice: ${voice}`);

  const voiceConfig = {
    name: voice,
    languageCode: voice.slice(0, 5),
    ssmlGender: voice === "en-US-Wavenet-D" ? "MALE" : "FEMALE",
  };
  console.log(`Received voiceConfig: ${JSON.stringify(voiceConfig)}`);

  const audioConfig = {
    audioEncoding: "MP3",
  };

  const request = {
    input: { text },
    voice: voiceConfig,
    audioConfig,
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    const audioContent = response.audioContent;
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audioContent, "binary"));
  } catch (error) {
    console.error(`Error with Google TTS API request: ${error.message}`);
    res.status(500).json({
      error: {
        message: "An error occurred during your request",
      },
    });
  }
}
