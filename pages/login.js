import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from "./index.module.css";
import { useAuth } from '../context/authContext'; // Make sure this path is correct
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    const { setSession } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const { error, session } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                setErrorMessage(error.message || 'Login failed.');
            } else {
                // Set the session in the context
                setSession(session);
                router.push('/');
            }
        } catch (error) {
            setErrorMessage('There was an error logging in.');
        }
    };

    return (
        <div className={styles.body}>
            <div className={styles.main}>
                <h3>Login</h3>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                <form onSubmit={handleLogin}>
                    <div>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="Email"
                        />
                    </div>
                    <div>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="Password"
                        />
                    </div>
                    <input type="submit" value="Login" />
                </form>
                <div>
                <a href="#" onClick={() => router.push('/forgotpassword')} className={styles.customButton}>Forgot Password? </a>
                        <span>  </span> {/* Add a separator */}
                <a href="#" onClick={() => router.push('/usersignup')} className={styles.customButton}>Sign Up</a>
                        <span>  </span> {/* Add a separator */}
                <a href="#" onClick={() => router.push('/')} className={styles.customButton}>Home</a>




                    </div>
                     </div>
                     </div>
    );
}

export default LoginPage;
