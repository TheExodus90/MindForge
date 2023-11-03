import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import path from 'path';



// Load environment variables from the .env file
dotenv.config();

// Get the current file's path (URL) and directory (dirname)
// These are necessary because __filename and __dirname aren't available in ES modules
const __filename = fileURLToPath(import.meta.url); // Convert the URL to a local file path
const __dirname = dirname(__filename); // Extract the directory path from the file path



// Load environment variables from .env.local
const envPath = path.join(__dirname, '../../.env.local'); // Adjust the path as needed
dotenv.config({ path: envPath });


// Read Supabase API URL and API key from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseApiKey = process.env.SUPABASE_API_KEY;


if (!supabaseUrl || !supabaseApiKey) {
    console.error('Supabase environment variables are missing.');
    process.exit(1); // Exit the script if environment variables are not set
}

// Initialize Supabase client with environment variables
const supabase = createClient(supabaseUrl, supabaseApiKey);

// Define a function to register a new user
const registerUser = async (email, password) => {
    try {
        // Attempt to register the user with the provided email and password
        const { user, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            // Handle specific error scenarios
            if (error.code === 'BAD_REQUEST') {
                console.error("Bad request: Please check your email and password format.");
            } else if (error.code === 'LIMIT_EXCEEDED') {
                console.error("Limit exceeded: Too many registration attempts. Try again later.");
            } else {
                console.error("Registration error:", error);
            }
            return null; // Registration failed
        }

        // If registration is successful, log a success message and return the user object
        console.log("Registration successful!");
        return user; // Registration succeeded
    } catch (error) {
        // Handle unexpected errors
        console.error("Unexpected registration error:", error);
        return null; // Registration failed
    }
};

// Example: Register a new user with a specific email and password
const newUser = await registerUser('rob.farag@outlook.com', 'password123');
if (newUser) {
    // User registration was successful, you can proceed with further actions
}

console.log("🌟😄🌟");

