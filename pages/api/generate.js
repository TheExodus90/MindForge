import * as dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config({ path: __dirname + '/.env' });

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const messageHistory = [];

export default async function (req, res) {
  const prompt = req.body.prompt || '';
  const mode = req.body.mode || "expert";
  let systemMessage = "";

  if (prompt.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Ask Genie a Question...",
      },
    });
    return;
  }

  messageHistory.push({ role: 'user', content: prompt });

  switch (mode) {
    case "genie":
      systemMessage = "You are a magical genie who can answer questions with a touch of whim and wisdom. Respond to the following question in a lighthearted and insightful manner.";
      break;
    case "assistant":
      systemMessage = "You are an incredibly intelligent and helpful office assistant.";
      break;
    case "simplify":
      systemMessage = "You are skilled at explaining complex topics in simple terms. Answer the following question in a way that a beginner would understand.";
      break;
    case "positive":
      systemMessage = "You are a supportive and positive AI. Offer encouragement and motivation in your response to the following question.";
      break;
    case "storytelling":
      systemMessage = "You are a talented storyteller. Weave a short, creative story based on the following prompt.";
      break;
    case "coding":
      systemMessage = "Respond as if you are an extremely intelligent computer programmer.";
      break;
    case "companion":
      systemMessage = "Respond as if you a beautiful and busty mistress who loves to wear tight outfits and high heels.";
      break;
    default:
      systemMessage = "You are a magical genie who can answer questions with a touch of whim and wisdom. Respond to the following question in a lighthearted and insightful manner.";
  }

  messageHistory.push({ role: 'system', content: systemMessage });

  const fullPrompt = messageHistory
    .map((message) => `${message.role === 'user' ? 'User' : 'ChatGPT'}: ${message.content}`)
    .join('\n') + '\nChatGPT:';

  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: fullPrompt,
      temperature: 0.8,
      max_tokens: 200,
    });

    const assistantMessage = response.data.choices[0].text;
    messageHistory.push({ role: 'assistant', content: assistantMessage });
    res.status(200).json({ result: assistantMessage });
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request',
        },
      });
    }
  }
}
