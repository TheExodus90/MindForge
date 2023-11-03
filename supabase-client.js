// supabase-client.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

const path = require('path');
const envPath = path.join(__dirname, '.env.local'); // Adjust the path as needed

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_API_KEY
);

console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_API_KEY:', process.env.NEXT_PUBLIC_SUPABASE_API_KEY);

export default supabase;
