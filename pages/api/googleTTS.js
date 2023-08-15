import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { text, voice } = req.body;

  // This logs the voice parameter each time the function is triggered.
  console.log(`Voice parameter received in backend: ${voice}`);

  try {
    let credentials;

    // Check if we're in a development environment
    if (process.env.NODE_ENV === 'development') {
      // Load credentials from the local .json file
      const credentialsPath = path.join(process.cwd(), 'burnished-ray-380807-6a2adfb349ba.json');
      credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    } else {
      // Parse the credentials from environment variable for production
      credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    }

    const client = new TextToSpeechClient({ credentials });

    const voiceConfig = {
      name: voice,
      languageCode: voice.slice(0, 5),
      ssmlGender: voice === "en-US-Wavenet-D" ? "MALE" : "FEMALE",
    };
    console.log(`Voice configuration: ${JSON.stringify(voiceConfig)}`);

    const request = {
      input: { text },
      voice: voiceConfig,
      audioConfig: { audioEncoding: "MP3" },
    };

    const [response] = await client.synthesizeSpeech(request);
    const audio = response.audioContent;

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
    res.send(audio);
  } catch (err) {
    console.error(`Failed to generate audio: ${err}`);
    res.status(500).send(`Failed to generate audio: ${err}`);
  }
}
