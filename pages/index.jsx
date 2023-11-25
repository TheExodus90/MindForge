import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import styles from "./index.module.css";
import "isomorphic-fetch";
import { Analytics } from '@vercel/analytics/react';
import Link from 'next/link';
import { useAuth } from '../context/authContext';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient'; // Make sure to import your initialized Supabase client
import { v4 as uuidv4 } from 'uuid';
import Footer from '../components/footer';


async function uploadChatHistory(userId, conversationId, userMessage, chatGptResponse) {
  const currentTime = new Date().toISOString();
  // Use a generated UUID for anonymous users
  const anonymousUserId = uuidv4();
  const chatHistory = {
    user_id: userId === 'anonymous' ? anonymousUserId : userId,
    conversation_id: conversationId,
    text: JSON.stringify({ userMessage, chatGptResponse }),
    created_at: currentTime
  };

  const { error } = await supabase
    .from('OdysseyInteractions')
    .upsert([chatHistory], { onConflict: ['conversation_id'], returning: ['*'] });

  if (error) {
    console.error('Error uploading chat history:', error);
    return;

    
  }
}




export default function Home() {
const inputRef = useRef(null);

  const [count, setCounter] = useState(0);
  const [promptInput, setPromptInput] = useState("");
  const [result, setResult] = useState();
  const [voice, setVoice] = useState("female");
  const [ttsProvider, setTtsProvider] = useState("GoogleTTS");
  const [mode, setMode] = useState("assistant");
  const [userAvatar, setUserAvatar] = useState("default");
  const [characterAvatar, setCharacterAvatar] = useState("/characterAvatars/assistant.png");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);
  const [messageHistory, setMessageHistory] = useState([]);
  const [totalTokens, setTotalTokens] = useState(0);
  const avgModelResponseTokens = 260; // You might want to adjust this based on your specific use case
  const router = useRouter();
  const { session, signOut } = useAuth();
  const [remainingMessages, setRemainingMessages] = useState(5);
  const [userMessage, setUserMessage] = useState("");
  const prevModeRef = useRef(mode);
  const [isNightMode, setIsNightMode] = useState(true); // new state for night mode
  const [selectedModel, setSelectedModel] = useState("GPT-3.5 Turbo");
  const [showAvatars, setShowAvatars] = useState(false); // State to track avatar display

  const toggleNightMode = () => {
    setIsNightMode(!isNightMode);
  };


  
  const initializeAnonymousSession = () => {
    let session = localStorage.getItem('anonymousSession');
    if (!session) {
      session = uuidv4(); // Generate a unique session ID
      localStorage.setItem('anonymousSession', session);
      localStorage.setItem('anonymousMessageCount', '0');
      // Initialize message count here
      localStorage.setItem('anonymousMessageCount', '0');
    }
    updateRemainingMessages(); // Update remaining messages based on the new or existing session
  };

const updateRemainingMessages = () => {
  let messageCount;
  if (session) {
    messageCount = parseInt(localStorage.getItem('userMessageCount') || '0', 10);
  } else {
    messageCount = parseInt(localStorage.getItem('anonymousMessageCount') || '0', 10);
  }
  if (isNaN(messageCount)) {
    messageCount = 0; // Default to 0 if parsing failed
  }
  setRemainingMessages(5 - messageCount);
};





const checkMessageCount = () => {
  if (session) return true; // Skip check for signed-in users
  const storedMessageCount = session ? localStorage.getItem('userMessageCount') : localStorage.getItem('anonymousMessageCount');
  let messageCount = parseInt(storedMessageCount, 10);
  let remaining = 5 - messageCount;
  setRemainingMessages(remaining);
  if (messageCount >= 5 || remaining < 0) {
    setUserMessage("You have reached the free usage limit, please log-in or sign up for a free account to increase your usage limit ");
    return false;
  }
  return true;
};





// Add a new function to reset the chat
const resetChat = () => {
  setMessageHistory([]); // Clears the conversation history
  setResult(''); // Clears the displayed results
  setTotalTokens(0); // Resets the token count
  setPromptInput(''); // Clears the prompt input
  // Add any additional state resets here as needed
};





// Run this effect when the app starts

useEffect(() => {
  if (session) {
    // Reset user message count
    localStorage.setItem('userMessageCount', '0');
    setRemainingMessages(5);
  } else {
    // Handle anonymous user logic
    initializeAnonymousSession();
    checkMessageCount();
  }
}, [session]);

useEffect(() => {
  if (!session) {
    initializeAnonymousSession();
    const messageCheckPassed = checkMessageCount();
  }
}, [session]); // Depend on session state


useEffect(() => {
 
  if (prevModeRef.current !== mode) {
    resetChat();
  }
  prevModeRef.current = mode; // Update the ref to the current mode
}, [mode]); // Re-run the effect if 'mode' changes


// Function to insert interaction into the Supabase database
async function insertInteraction(userId, conversationId, text) {
    const { data, error } = await supabase
        .from('OdysseyInteractions')
        .insert([
            { user_id: userId, conversation_id: conversationId, text: text, created_at: new Date().toISOString() }
        ]);

    if (error) {
        console.error('Error inserting interaction:', error);
        return false;
    }

    return true;
}
const onSubmit = async (e) => { if (e && e.preventDefault && typeof e.preventDefault === 'function'){
  e.preventDefault();
  setIsLoading(true);

  let textForTTS = ""; // Declare textForTTS at the beginning of the function
  



  if (!session && !checkMessageCount()) {
    return; // Early return if message limit is reached
  }
  
    const userInputTokens = Math.ceil(promptInput.length / 4);
    let newTotalTokens = totalTokens + userInputTokens;
    let newMessageHistory = [...messageHistory, {role: 'user', content: promptInput}];
    
  
    while (newTotalTokens > (4096 - avgModelResponseTokens)) {
      const removedMessage = newMessageHistory.shift();
      const removedTokens = Math.ceil(removedMessage.content.length / 4);
      newTotalTokens -= removedTokens;
    }

    // If an anonymous user sends a message, increment the message count
    if (!session) {
      const key = 'anonymousMessageCount';
      let messageCount = parseInt(localStorage.getItem(key) || '0', 10);
      localStorage.setItem(key, (messageCount + 1).toString());
      updateRemainingMessages(); // Make sure this is called right after updating localStorage
    }
  
    // Update state
    setTotalTokens(newTotalTokens);
    setMessageHistory(newMessageHistory);
      
    e.preventDefault();
    setIsLoading(true); 

    let responseData; // Define responseData outside the try-catch block

    try {
      if (inputRef.current) inputRef.current.focus();
    if (count == 50) {
        return console.log("you have reached your limit");
      }

     // Define the apiEndpoint variable based on the selected model
  let apiEndpoint = '';
  if (selectedModel === "GPT-3.5 Turbo") {
    apiEndpoint = "/api/generate";
  } else if (selectedModel === "DALL-E-3") {
    apiEndpoint = "/api/dalleGen";
    console.log("DALL-E API response:", responseData);
  } else {
    // Handle other cases or set a default endpoint if needed
  }

  try {
    const requestBody = JSON.stringify({ prompt: promptInput, mode: mode });
   
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody, // Use the requestBody here
      timeout: 22500, // Set the timeout in milliseconds (e.g., 17 seconds)
    });

    const data = await response.json();
    responseData = data; // Assign the response data to responseData

    if (selectedModel === "GPT-3.5 Turbo") {
      const chatGptResponse = data.result.trim();
      setResult((prevResult) =>
        `${prevResult ? prevResult + '\n\n' : ''}You: ${promptInput}\nChatGPT: ${chatGptResponse}`
      );
      textForTTS = chatGptResponse;
    } else if (selectedModel === "DALL-E-3") {
      if (responseData && responseData.data && responseData.data.length > 0) {
        const revisedPrompt = responseData.data[0].revised_prompt;
        const imageUrl = responseData.data[0].url; // Extract imageUrl from responseData
        setResult((prevResult) =>
          `${prevResult ? prevResult + '\n\n' : ''}You: ${promptInput}\nDALL-E: ${revisedPrompt}\n\n<img src="${imageUrl}" alt="Generated Image" style="max-width: 80%; height: auto;">`
        );
        textForTTS = revisedPrompt;
      }
    }

      // Generate a UUID for conversationId and update DB
      const conversationId = uuidv4();
    
    await uploadChatHistory(session ? session.user.id : 'anonymous', conversationId, promptInput, textForTTS);

    
  } catch (error) {
    console.error('Error during API call:', error);
  } finally {
    setIsLoading(false);
  }



    
  if (textForTTS && voice !== 'disabled') {  // Check if textForTTS is not empty and voice is not disabled
    const ttsEndpoint = ttsProvider === "ElevenLabs" ? "/api/elevenLabs" : "/api/googleTTS";
    const voiceParam = ttsProvider === "GoogleTTS" ? (voice === "female" ? "en-GB-News-H" : "en-US-Wavenet-D") : (voice === "female" ? "female" : "male");
  
    const audioResponse = await fetch(ttsEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: textForTTS, voice: voiceParam }),
    });

    if (audioResponse.ok) {
      const audioBlob = await audioResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } else {
      console.error("Error fetching audio:", await audioResponse.text());
      alert("An error occurred while fetching audio.");
    }
  }
    
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false); 
    }
  }}

  

  
  useEffect(() => {
    if (session) {
      localStorage.setItem('userMessageCount', '0');
    }
    updateRemainingMessages();
  }, [session]);

useEffect(() => {
    setCharacterAvatar(`/characterAvatars/${mode}.png`);
  }, [mode]);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      router.push('/'); // Redirect to the main page after successful logout
    } else {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={isNightMode ? styles.nightMode : styles.dayMode}> {/* Toggle class based on state */}
    
    <div className={styles.nightModeToggle}>
          <span onClick={toggleNightMode}>
            {isNightMode ? (
              <span>🌙</span> // Moon symbol for night mode
            ) : (
              <span>☀️</span> // Sun symbol for day mode
            )}
            </span>
          </div>

    
    
      <Head>
        <title>ExoFi Labs</title>
        <meta name="description" content="MindForge, created by ExoFi Labs." />
        <meta name="keywords" content="ExoFi Labs, Mindforge, AI, Technology, TTS, text to speech, MindForge by ExoFi Labs, chatbot, RPG, AI Companion" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta property="og:title" content="MindForge by ExoFi Labs" />
        <meta property="og:image" content="public\imageresources\MindForgeLogo.png" />
        <meta property="og:url" content="https://www.exofi.app" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ExoFi Labs" />
        <meta name="twitter:description" content="The Utlimate AI Experience, MindForge by ExoFi Labs" />
        <meta name="twitter:image" content="public\imageresources\logo-black.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1>Mind Forge by ExoFi Labs</h1>

      
  

      {/* Conditional rendering based on session */}
      {!session ? (
          <div>
          <a href="#" onClick={() => router.push('/login')} className={styles.customButton}>Log In </a>   
          <a href="#" onClick={() => router.push('/usersignup')} className={styles.customButton}>Sign-Up</a>

              </div>
        ) : (
          <div className={styles.welcomeLogoutContainer}>
            <span>Welcome, {session.user.email}!</span> {/* Display the user's email or name */}
            <button onClick={handleLogout}>Logout</button>
          </div> 
          
            
        )}

        

<div>  
  {remainingMessages <= 0 ? (
    <span className={styles.redText}>
      You have {remainingMessages} free messages remaining. Sign up for a free account to increase usage limits.
    </span>
  ) : (
    <span className={styles.userMessageStyle}>
      Usage limits depend on service demand. Please upgrade to increase usage limits. 
    </span>
  )}
</div>

<div className={styles.bodyText}> Welcome to MindForge by ExoFi Labs, a cutting-edge digital platform powered by ChatGPT. Our platform seamlessly integrates advanced AI communication with rapid voice synthesis capabilities from 11Labs and Google TTS, ensuring a dynamic and responsive experience. Please select an AI Personality to chat with below. <div>Update: DALLE-3 Now Available!</div></div>
      
      
  
      
        
        <form onSubmit={onSubmit}>
        <input
  type="text"
  name="prompt"
  value={promptInput} // This is where the input value should be bound
  onChange={(e) => setPromptInput(e.target.value)}
  onKeyPress={(e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      onSubmit(e); // Call the onSubmit function directly
    }
  }}
  placeholder="Send a message"/>

            <div className={styles.buttonContainer}>
              <input
              type="submit"
              className={remainingMessages <= 0 ? styles.redText : undefined}
              value={isLoading ? "Loading..." : "Generate Response"}
              disabled={isLoading || remainingMessages <= 0}
            /> 
            </div>

                      
            

            <div className={styles.buttonContainer}>
            <button type="button"
            className={styles.resetButton} /* new class for reset button */
          onClick={resetChat} >Reset</button>

          </div>

          

            <div className={styles.modelSettings}>

            

          
          <div>
            <input type="radio" name="voice" value="female" checked={voice === 'female'} onChange={(e) => setVoice(e.target.value)} /> Female Voice
            <input type="radio" name="voice" value="male" checked={voice === 'male'} onChange={(e) => setVoice(e.target.value)} /> Male Voice
            <input type="radio" name="voice" value="disabled" checked={voice === 'disabled'} onChange={(e) => setVoice(e.target.value)} /> Disable Voice


            <div><input type="checkbox" name="avatarDisplay" checked={showAvatars} onChange={(e) => setShowAvatars(e.target.checked)} />  Show Avatars </div>
            
  



          </div>





          

           {/* Dropdown for model selection */}
         <div>
         <label htmlFor="modelSelection">Select Model: </label>
          <select name="modelSelection" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
          <option value="GPT-3.5 Turbo">GPT-3.5 Turbo</option>
          <option value="DALL-E-3">DALL-E-3 (Image Generation)</option>
          {/* Add more models as they become available */}
         </select>
         </div>

         <div>
            <label htmlFor="ttsProvider">TTS Provider: </label>
            <select name="ttsProvider" value={ttsProvider} onChange={(e) => setTtsProvider(e.target.value)}>
            
            <option value="GoogleTTS">Google TTS</option>
            <option value="ElevenLabs" disabled>ElevenLabs (for Plus Users)</option>
            </select>
          </div>

         
          {/* Conditional rendering based on selectedModel */}
          {selectedModel === "GPT-3.5 Turbo" && (
          <div>
          {/* Render character avatars/personalities here */}
          <label htmlFor="mode">Select an AI to Chat with: </label>
          <div className={styles.characterAvatarContainer}>
          {
          
          <div className={styles.characterAvatarContainer}>


<div className={`${styles.shadowBox} ${mode === 'assistant' ? styles.selected : ''}`} onClick={() => setMode('assistant')}>
    {showAvatars && <img src="/pixel_characterAvatars/assistant.png" alt="Assistant" className={styles.characterAvatarImage} />}
    <span>Assistant</span>
  </div>

  <div className={`${styles.shadowBox} ${mode === 'academicWriter' ? styles.selected : ''}`} onClick={() => setMode('academicWriter')}>
    {showAvatars && <img src="/pixel_characterAvatars/academicWriter.png" alt="academicWriter" className={styles.characterAvatarImage} />}
    <span>Academic Writer</span>
  </div>

  <div className={`${styles.shadowBox} ${mode === 'simplify' ? styles.selected : ''}`} onClick={() => setMode('simplify')}>
    {showAvatars && <img src="/pixel_characterAvatars/simplify.png" alt="Simplify" className={styles.characterAvatarImage} />}
    <span>Simplify Anything</span>
  </div>

  <div className={`${styles.shadowBox} ${mode === 'counselor' ? styles.selected : ''}`} onClick={() => setMode('counselor')}>
    {showAvatars && <img src="/pixel_characterAvatars/counselor.png" alt="Counselor" className={styles.characterAvatarImage} />}
    <span>Counselor</span>
  </div>

  <div className={`${styles.shadowBox} ${mode === 'storytelling' ? styles.selected : ''}`} onClick={() => setMode('storytelling')}>
    {showAvatars && <img src="/pixel_characterAvatars/storytelling.png" alt="Storytelling" className={styles.characterAvatarImage} />}
    <span>The Story Teller</span>
  </div>

  <div className={`${styles.shadowBox} ${mode === 'coding' ? styles.selected : ''}`} onClick={() => setMode('coding')}>
    {showAvatars && <img src="/pixel_characterAvatars/coding.png" alt="Coding Genius" className={styles.characterAvatarImage} />}
    <span>Coding Guru</span>
  </div>

  <div className={`${styles.shadowBox} ${mode === 'companion' ? styles.selected : ''}`} onClick={() => setMode('companion')}>
    {showAvatars && <img src="/pixel_characterAvatars/companion.png" alt="Companion" className={styles.characterAvatarImage} />}
    <span>Friend</span>
  </div>

  {/*<div className={`${styles.shadowBox} ${mode === '5H0D4N' ? styles.selected : ''}`} onClick={() => setMode('5H0D4N')}>
    {showAvatars && <img src="/pixel_characterAvatars/5H0D4N.png" alt="5H0D4N" className={styles.characterAvatarImage} />}
    <span>5H0D4N</span>
        </div>*/}





{/*


</div>

  <label htmlFor="userAvatar">Your Avatar: </label>

  <select name="userAvatar" value={userAvatar} onChange={(e) => setUserAvatar(e.target.value)}>
    <option value="avatar1">Avatar 1</option>
    <option value="avatar2">Avatar 2</option>
    <option value="avatar3">Avatar 3</option>
    <option value="avatar4">Avatar 4</option>
  </select>

  <div className={styles.avatarContainer}>
    <label htmlFor="userAvatar1">
      <input type="radio" id="userAvatar1" name="userAvatar" value="avatar1" checked={userAvatar === 'avatar1'} onChange={(e) => setUserAvatar(e.target.value)} />
      <img src="/avatars/avatar1.png" alt="Avatar 1" className={`${styles.avatarImage} ${styles.avatarRoundedCorners}`} />
      
    </label>
    <label htmlFor="userAvatar2">
      <input type="radio" id="userAvatar2" name="userAvatar" value="avatar2" checked={userAvatar === 'avatar2'} onChange={(e) => setUserAvatar(e.target.value)} />
      <img src="/avatars/avatar2.png" alt="Avatar 2" className={`${styles.avatarImage} ${styles.avatarRoundedCorners}`} />
      
    </label>
    <label htmlFor="userAvatar3">
      <input type="radio" id="userAvatar3" name="userAvatar" value="avatar3" checked={userAvatar === 'avatar3'} onChange={(e) => setUserAvatar(e.target.value)} />
      <img src="/avatars/avatar3.png" alt="Avatar 3" className={`${styles.avatarImage} ${styles.avatarRoundedCorners}`} />
      
    </label>
    <label htmlFor="userAvatar4">
      <input type="radio" id="userAvatar4" name="userAvatar" value="avatar4" checked={userAvatar === 'avatar4'} onChange={(e) => setUserAvatar(e.target.value)} />
      <img src="/avatars/avatar4.png" alt="Avatar 4" className={`${styles.avatarImage} ${styles.avatarRoundedCorners}`} />
      
    </label>
  </div>

  

*/}


    

  </div>


        
          
          }
          </div>
          </div>
          )}



          
          
          {/*<div>
            <label htmlFor="mode">Personality: </label>
            <select name="mode" value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="genie">Genie</option>
              <option value="assistant">Assistant</option>
              <option value="simplify">Simplify</option>
              <option value="positive">Positive</option>
              <option value="storytelling">Storytelling</option>
              <option value="coding">Coding Genius</option>
              <option value="companion">Companion</option>
              <option value="5H0D4N">5H0D4N</option>
              <option value="counselor">Counselor</option>
            </select>
          </div>*/}

          <div>
         


       
        </div>

        

             
        


        </div>

        




 



</form>



<div
  className={styles.result}
  dangerouslySetInnerHTML={{ __html: result || "Generated response will appear here..." }}


  
/>


<Analytics />



</main>

<Footer />
</div>



  );
}

