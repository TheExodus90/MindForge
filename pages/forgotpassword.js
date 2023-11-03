// forgotpassword.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from "./index.module.css";
import supabase from '../supabase-client'; // Adjust the import path to match your project structure

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();

    const handleResetPassword = async (e) => {
        e.preventDefault();

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`, // Replace with your password update page URL
        });

        if (error) {
            setErrorMessage(error.message || 'Failed to send password reset email.');
        } else {
            setSuccessMessage('Password reset email sent successfully. Please check your inbox as well as your Junk Mail folder.');
            setEmail('');
        }
    };

    return (
        <div className={styles.body}>
            <div className={styles.main}>
                <h3>Forgot Password</h3>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                <form onSubmit={handleResetPassword}>
                    <div>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="Enter your email"
                        />
                    </div>
                    <input type="submit" value="Send Reset Email" />
                </form>
                <div>
                    <a href="#" onClick={() => router.push('/login')}>Back to Login</a>
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
