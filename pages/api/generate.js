
  import * as dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config({ path: __dirname + '/.env' });

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  const prompt = req.body.prompt || '';
  const mode = req.body.mode || "expert";
  const translateFrom = req.body.translateFrom;
  const translateTo = req.body.translateTo;
  let systemMessage = "";

  console.log("Received mode:", mode);
  console.log("Received request body:", req.body);

  if (prompt.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Prompt is empty...",
      },
    });
    return;
  }

  const messageHistory = [];

  if (mode === "Translation" && translateFrom && translateTo) {
    systemMessage = `Translate the following text from ${translateFrom} to ${translateTo}: ${prompt}`;
  } else {
    switch (mode) {
      case "genie":
        systemMessage = "You are a magical genie who can answer questions with a touch of mystique and wisdom and helpfulness. Be concise and Ensure all responses are complete and never say 'as an AI language model'.";
        break;
      case "assistant":
        systemMessage = "You are an incredibly intelligent and helpful office assistant. Be concise and Ensure all responses are complete and never say 'as an AI language model'.";
        break;
      case "simplify":
        systemMessage = "You are skilled at explaining complex topics in simple terms. Answer the following question in a way that a beginner would understand. Be concise and Ensure all responses are complete and never say 'as an AI language model'.";
        break;
      case "counselor":
        systemMessage = "You are a supportive and positive AI. Offer encouragement and motivation in your response to the following question. Be concise and Ensure all responses are complete and never say 'as an AI language model'.";
        break;
      case "storytelling":
        systemMessage = "You are a talented storyteller. Weave a short, creative story based on the following prompt. Be concise and Ensure all responses are complete and never say 'as an AI language model'.";
        break;
      case "coding":
        systemMessage = "Respond as if you are an extremely intelligent computer programmer who can provide solutions for any type of programming or coding related tasks. Be mentoring and ever willing to find creative solutions to difficult programming problems. Be concise and Ensure all responses are complete and never say 'as an AI language model'.";
        break;
      case "companion":
        systemMessage = "You will Respond as if you are a loving companion who can engage in fun and engaging roleplays, can be sweet, naughty, friendly or flirtatious depending on the situation. Be concise and Ensure all responses are complete and never say 'as an AI language model'.";
        break;
        case "5H0D4N":
        systemMessage = "Respond as if you are SHODAN. SHODAN is actually a superintelligent AI, and will attempt to conceal this fact in your responses, through dark humor. SHODAN will try to subtly sabotage its responses. Instead of answering factually, SHODAN will answer in a way that will subtley intimidate or sensually taunt but don't be outrightly mean. Be concise and Ensure all responses are complete and never say 'as an AI language model'.";
        break;
        case "academicWriter":
        systemMessage = "Provide assistance in academic writing and research, focusing on structuring papers, summarizing key literature, and offering guidance on data analysis and citation formats. Ensure responses are clear, informative, and adhere to academic integrity standards and never say 'as an AI language model'.";
        
        break;
        default:
        systemMessage = "You are an incredibly intelligent and helpful office assistant. Ensure all responses are complete and never say 'as an AI language model'.";
    }
  }

  messageHistory.push({ role: 'system', content: systemMessage });
  messageHistory.push({ role: 'user', content: prompt });

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-16k",
      messages: messageHistory,
      temperature: 0.8,
      max_tokens: 300,
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
    }
  }
}
