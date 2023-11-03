import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://krhkllgrwexetmuacpye.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyaGtsbGdyd2V4ZXRtdWFjcHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTgzNjIzNzYsImV4cCI6MjAxMzkzODM3Nn0.VFp7NETlOboI8XOP8S4wzMirBfpvWMeQShXBlrimpEI');

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


  

