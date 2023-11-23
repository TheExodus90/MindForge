// pages/api/dalle.js

export default async function handler(req, res) {
    if (req.method === 'POST') {
      try {
        const { prompt } = req.body;
        console.log("Received prompt:", prompt);  // Log the received prompt

        const payload = {
          model: "dall-e-3",
          prompt: prompt,
          size: "1024x1024",
          n: 1,
          quality: "standard"
        };
        console.log("Sending payload to OpenAI:", payload);  // Log the payload

        const openAIResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify(payload)
        });

        const data = await openAIResponse.json();
        console.log("Received response from OpenAI:", data);  // Log the response data

        if (openAIResponse.ok) {
          res.status(200).json(data);
        } else {
          console.error("OpenAI API response error:", data.error);  // Log any errors from the API
          res.status(openAIResponse.status).json({ error: data.error });
        }
      } catch (error) {
        console.error('Error in DALL·E API call:', error);  // Log any errors in the fetch call
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
