import * as dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config({ path: __dirname + '/.env' });

// pages/api/listModels.js

export default async function handler(req, res) {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });
  
      const data = await response.json();
      if (response.ok) {
        res.status(200).json(data);
      } else {
        res.status(response.status).json({ error: data.error });
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  