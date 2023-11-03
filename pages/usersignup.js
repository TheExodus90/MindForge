import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from "./index.module.css"; 
import supabase from '../supabase-client';  // Adjust the import path to match your project structure
import TermsOfService from './api/terms'; // Import the TermsOfService component

function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showTerms, setShowTerms] = useState(false); // State to control the terms modal visibility
    const router = useRouter();
    const [notification, setNotification] = useState('');

    const handleSignUp = async (e) => {
        e.preventDefault();

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            setErrorMessage(error.message || 'Sign up failed.');
        } else {
            setNotification(`Registration successful! Please check your email to verify your account. You may then proceed to <a href="/login" style="color: blue;">Login</a>.`);
            console.log('Registration successful!', data);
        }
    };

    return (
        <div className={`${styles.body} ${styles.main}`}>
            <h2>Sign Up</h2>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            {notification && <p style={{ color: 'green' }} dangerouslySetInnerHTML={{ __html: notification }} />}
            <form onSubmit={handleSignUp}>
                <div>
                    <label>Email:</label>
                    <input 
                        className={styles.inputField}
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input 
                        className={styles.inputField}
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <div className={styles.terms}>
                    <input 
                        type="checkbox" 
                        checked={acceptedTerms} 
                        onChange={(e) => setAcceptedTerms(e.target.checked)} 
                    />
                    <label>
                        I agree to the <button type="button" onClick={() => setShowTerms(true)}>Terms and Conditions</button>
                    </label>
                </div>
                <button type="submit" disabled={!acceptedTerms}>Sign Up</button>
            </form>
            <div>
                <a href="#" onClick={() => router.push('/login')}>Already have an account? Login</a>
            </div>

            {showTerms && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <span className={styles.close} onClick={() => setShowTerms(false)}>&times;</span>
                        <TermsOfService />
                    </div>
                </div>
            )}
        </div>
    );
}

export default SignUpPage;
