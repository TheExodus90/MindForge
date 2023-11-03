// authContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);

    useEffect(() => {
        async function getSessionAndListen() {
            const { data: session, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('Error getting session:', error);
            } else {
                setSession(session);
            }
    
            const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
                setSession(session);
            });
    
            return () => {
                listener.unsubscribe();
            };
        }
    
        getSessionAndListen();
    }, []);

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        setSession(null);
        return { error }; // Return an object with the error property
    };

    return (
        <AuthContext.Provider value={{ session, setSession, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    return useContext(AuthContext);
}
