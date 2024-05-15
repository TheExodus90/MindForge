// pages/api/speechToText.js

import { OpenAI } from 'openai'; // Import the OpenAI library

// Initialize the OpenAI client
const openai = new OpenAI(process.env.OPENAI_API_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { file } = req.body;

      // Call the OpenAI transcription endpoint with the audio file
      const transcription = await openai.audio.transcriptions.create({
        model: 'whisper-1',
        file: file,
      });

      // Respond with the transcription text
      res.status(200).json({ transcription: transcription.text });
    } catch (error) {
      console.error('Error during transcription:', error);
      res.status(500).json({ error: 'Error during transcription' });
    }
  } else {
    // Return a 405 Method Not Allowed error for non-POST requests
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
