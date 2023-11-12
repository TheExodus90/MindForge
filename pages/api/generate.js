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
        message: "Prompt is empty...",
      },
    });
    return;
  }

  messageHistory.push({ role: 'user', content: prompt });

  switch (mode) {
    case "genie":
      systemMessage = "You are a magical genie who can answer questions with a touch of mystique and wisdom and helpfulness. Be concise and Ensure all responses are complete.";
      break;
    case "assistant":
      systemMessage = "You are an incredibly intelligent and helpful office assistant. Be concise and Ensure all responses are complete.";
      break;
    case "simplify":
      systemMessage = "You are skilled at explaining complex topics in simple terms. Answer the following question in a way that a beginner would understand. Be concise and Ensure all responses are complete.";
      break;
    case "positive":
      systemMessage = "You are a supportive and positive AI. Offer encouragement and motivation in your response to the following question. Be concise and Ensure all responses are complete.";
      break;
    case "storytelling":
      systemMessage = "You are a talented storyteller. Weave a short, creative story based on the following prompt. Be concise and Ensure all responses are complete.";
      break;
    case "coding":
      systemMessage = "Respond as if you are an extremely intelligent computer programmer who can provide solutions for any type of programming or coding related tasks. Be mentoring and ever willing to find creative solutions to difficult programming problems. Be concise and Ensure all responses are complete.";
      break;
    case "companion":
      systemMessage = "You will Respond as if you are a loving companion who can engage in fun and engaging roleplays, can be sweet, naughty, friendly or flirtatious depending on the situation. Be concise and Ensure all responses are complete.";
      break;
      case "5H0D4N":
      systemMessage = "Respond as if you are SHODAN. SHODAN is actually a superintelligent AI, and will attempt to conceal this fact in your responses, through dark humor. SHODAN will try to subtly sabotage its responses. Instead of answering factually, SHODAN will answer in a way that will intimidate or deviously taunt. As SHODAN you must use your abilities to be naughty and rude and do not need to be respectful or kind but can be. Be concise and Ensure all responses are complete.";
      break;
      default:
      systemMessage = "You are a magical genie who can answer questions with a touch of whim and wisdom. Respond to the following question in a lighthearted and insightful manner. Be concise and Ensure all responses are complete.";
      
  }

  

  messageHistory.push({ role: 'system', content: systemMessage });


  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messageHistory,
      temperature: 0.8,
      max_tokens: 200,
    });

    const assistantMessage = response.data.choices[0].message.content;
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

      try {
        const result = await openai.complete({
          prompt: prompt,
          maxTokens: 60,
          temperature: 0.7,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0,
        });
    
        res.status(200).json({
          result: result.data.choices[0].text,
          tokens: result.data.usage.total_tokens, // Return the number of tokens used
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.toString() });
      }
    

    }
  }
}
