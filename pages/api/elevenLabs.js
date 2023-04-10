import fetch from "node-fetch";

export default async function (req, res) {
  const text = req.body.text;

  const url = "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL";
  const headers = {
    "xi-api-key": process.env.ELEVENLABS_API_KEY,
    "Content-Type": "application/json",
    "Accept": "audio/mpeg",
  };
  const data = { text };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const buffer = await response.buffer();
      res.setHeader("Content-Type", "audio/mpeg");
      res.send(buffer);
    } else {
      console.error("Request to ElevenLabs TTS API failed:", await response.text());
      throw new Error(`Request failed with status ${response.status}`);
    }
  } catch (error) {
    console.error(`Error with ElevenLabs TTS API request: ${error.message}`);
    res.status(500).json({
      error: {
        message: "An error occurred during your request",
      },
    });
  }
}
