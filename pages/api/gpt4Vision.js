// pages/api/gpt4Vision.js

export default async function handler(req, res) {
    if (req.method === 'POST') {
      try {
        const { imageData, question } = req.body; // imageData is base64-encoded
  
        // Correcting the payload structure
        const payload = {
          model: "gpt-4-vision-preview",
          messages: [
            {
              "role": "user",
              "content": [
                { "type": "text", "text": question },
                { "type": "image_url", "image_url": { "url": imageData } } // Corrected structure
              ]
            }
          ],
          max_tokens: 300
        };
  
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify(payload)
        });
  
        const data = await openAIResponse.json();
        if (openAIResponse.ok) {
          res.status(200).json(data);
        } else {
          res.status(openAIResponse.status).json({ error: data.error });
        }
      } catch (error) {
        console.error('Error in GPT-4 Vision API call:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  