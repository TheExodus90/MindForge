import * as dotenv from 'dotenv';
import {Configuration, OpenAIApi} from 'openai';

dotenv.config({path:__dirname + '/.env'});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
 
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function(req, res) {

  if(!configuration.apiKey) {
      res.status(500).json({
          error: {
              message: "OpenAI API key not configured"
          }
      });
      return;
  }

const prompt = req.body.prompt || '';
if (prompt.trim().length === 0) {
  res.status(400).json({
      error: {
          message: "Ask Genie a Question..."
      }
  });
  return;
};

try {
const response = await openai.createCompletion({
model: "text-davinci-003",
prompt: `Please answer the following question as if you were a hyperintelligent A.I Assistant:${prompt}`,
temperature: 0.8,
max_tokens: 250,
});
res.status(200).json({result: response.data.choices[0].text})
} catch(error) {
  if(error.response) {
      console.log(error(error.response.status, error.response.data));
      res.status(error.response.status).json(error.response.data);
  } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
          error: {
              message: 'An error occured during your request'
          }
      })
  }
}
}