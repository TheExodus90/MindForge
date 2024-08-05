import { ChakraProvider, Box, VStack, Heading, Text, Container, Input, Button, Select, Radio, RadioGroup, Stack, FormControl, FormLabel, Switch, useColorMode, useColorModeValue, IconButton } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import Head from "next/head";
import Script from 'next/script';
import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./index.module.css";
import "isomorphic-fetch";
import { Analytics } from '@vercel/analytics/react';
import Link from 'next/link';
import { useAuth } from '../context/authContext';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';

const Footer = dynamic(() => import('../components/footer'), { ssr: false });


async function uploadChatHistory(userId, conversationId, userMessage, chatGptResponse) {
  const currentTime = new Date().toISOString();
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
  const [chatHistory, setChatHistory] = useState([]);
  const [showLanguageInputs, setShowLanguageInputs] = useState(false);
  const [translateFrom, setTranslateFrom] = useState('');
  const [translateTo, setTranslateTo] = useState('');
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const color = useColorModeValue('gray.800', 'white');


    
  const initializeAnonymousSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      let session = localStorage.getItem('anonymousSession');
      if (!session) {
        session = uuidv4();
        localStorage.setItem('anonymousSession', session);
        localStorage.setItem('anonymousMessageCount', '0');
      }
      updateRemainingMessages();
    }
  }, []);

  const updateRemainingMessages = useCallback(() => {
    if (typeof window !== 'undefined') {
      let messageCount;
      if (session) {
        messageCount = parseInt(localStorage.getItem('userMessageCount') || '0', 10);
      } else {
        messageCount = parseInt(localStorage.getItem('anonymousMessageCount') || '0', 10);
      }
      if (isNaN(messageCount)) {
        messageCount = 0;
      }
      const remaining = Math.max(0, 7 - messageCount);
      setRemainingMessages(remaining);
      localStorage.setItem('remainingMessages', remaining.toString());
    }
  }, [session]);





  const checkMessageCount = useCallback(() => {
    if (session) return true;
    const storedMessageCount = localStorage.getItem('anonymousMessageCount');
    let messageCount = parseInt(storedMessageCount, 10);
    let remaining = 7 - messageCount;
    setRemainingMessages(remaining);
    if (messageCount >= 7 || remaining < 0) {
      setUserMessage("You have reached the free usage limit, please log-in or sign up for a free account to increase your usage limit ");
      return false;
    }
    return true;
  }, [session]);


  const resetChat = useCallback(() => {
    setMessageHistory([]);
    setResult('');
    setTotalTokens(0);
    setPromptInput('');
  }, []);




// Run this effect when the app starts

useEffect(() => {
  if (session) {
    localStorage.setItem('userMessageCount', '0');
    setRemainingMessages(7);
  } else {
    initializeAnonymousSession();
    checkMessageCount();
  }
}, [session, initializeAnonymousSession, checkMessageCount]);

useEffect(() => {
  if (!session) {
    initializeAnonymousSession();
    const messageCheckPassed = checkMessageCount();
  }
}, [session]); // Depend on session state

useEffect(() => {
  setShowLanguageInputs(selectedModel === "Translation");
}, [selectedModel]);



useEffect(() => {
  if (prevModeRef.current !== mode) {
    resetChat();
  }
  prevModeRef.current = mode;
}, [mode, resetChat]);

useEffect(() => {
  setCharacterAvatar(`/characterAvatars/${mode}.png`);
}, [mode]);




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

  let requestBody;
  if (selectedModel === "Translation") {
    requestBody = JSON.stringify({ 
      prompt: promptInput, 
      mode: "Translation", 
      translateFrom, 
      translateTo 
    });
  } else {
    // Existing requestBody for other models
    requestBody = JSON.stringify({ prompt: promptInput, mode: mode });
  }
  



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
    
   
    const response = await fetch('/api/generate', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody, // Use the requestBody here
    });

    const data = await response.json();
    responseData = data; // Assign the response data to responseData
    console.log("API response data:", data);

   // After receiving a response from the AI model
if (selectedModel === "GPT-3.5 Turbo") {
  const chatGptResponse = data.result.trim();
  const newMessage = { role: 'user', content: promptInput };
  const newResponse = { role: 'ChatGPT', content: chatGptResponse };
  setChatHistory((prevHistory) => [...prevHistory, newMessage, newResponse]);
  textForTTS = chatGptResponse;
  await uploadChatHistory(session ? session.user.id : 'anonymous', conversationId, promptInput, chatGptResponse, 'user');
} else if (selectedModel === "Translation") {
  // Assuming 'data.result' contains the translated text
  const translationResponse = data.result;
  const newMessage = { role: 'user', content: promptInput };
  const newResponse = { role: 'Translation', content: translationResponse };
  setChatHistory((prevHistory) => [...prevHistory, newMessage, newResponse]);
  textForTTS = translationResponse;
  await uploadChatHistory(session ? session.user.id : 'anonymous', conversationId, promptInput, translationResponse, 'user');
} else if (selectedModel === "DALL-E-3") {
  // Make sure to point to your specific DALL-E API endpoint
  const dalleResponse = await fetch('/api/dalleGen', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: promptInput }) // Adjust the request body as per your dalle.js endpoint's requirements
  });

  const dalleData = await dalleResponse.json();
  console.log("DALL-E API response data:", dalleData);

  if (dalleData && dalleData.data && dalleData.data.length > 0) {
    const revisedPrompt = dalleData.data[0].revised_prompt;
    const imageUrl = dalleData.data[0].url;
    const newMessage = { role: 'user', content: promptInput };
    const newResponse = { role: 'DALL-E', content: revisedPrompt, image: imageUrl };
    setChatHistory((prevHistory) => [...prevHistory, newMessage, newResponse]);
    // The uploadChatHistory may need adjustment based on whether you want to store image URLs in your database
    await uploadChatHistory(session ? session.user.id : 'anonymous', conversationId, promptInput, revisedPrompt, 'user');
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
    <Box bg={bgColor} color={color} minH="100vh">
      <Box textAlign="right" p={4}>
        <IconButton
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          isRound
          size="lg"
        />
      </Box>
  
      <Head>
        <title>ExoFi Labs</title>
        <meta name="description" content="MindForge, created by ExoFi Labs." />
        <meta name="keywords" content="ExoFi Labs, Mindforge, AI, Technology, TTS, text to speech, MindForge by ExoFi Labs, chatbot, RPG, AI Companion" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta property="og:title" content="MindForge by ExoFi Labs" />
        <meta property="og:image" content="public/imageresources/MindForgeLogo.png" />
        <meta property="og:url" content="https://www.exofi.app" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ExoFi Labs" />
        <meta name="twitter:description" content="The Utlimate AI Experience, MindForge by ExoFi Labs" />
        <meta name="twitter:image" content="https://www.exofi.app/imageresources/hero1.png" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://www.exofi.app" />
      </Head>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6135280913884215"
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
  
      <Container maxW="container.lg" py={8}>
        <Heading mb={6}>Mind Forge by ExoFi Labs</Heading>
  
        {session !== null ? (
  <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
    <Text>Welcome, {session.user.email}!</Text>
    <Button onClick={handleLogout}>Logout</Button>
  </Box>
) : (
  <Box mb={4}>
    <Button as={Link} href="/login" mr={4}>Log In</Button>
    <Button as={Link} href="/usersignup">Sign-Up</Button>
  </Box>
)}

<Text mb={4}>
  {typeof window !== 'undefined' && remainingMessages <= 0 ? (
    <Text color="red">
      You have 0 free messages remaining. Sign up for a free account to increase usage limits.
    </Text>
  ) : (
    <Text>
      Usage limits depend on service demand. Please upgrade to increase usage limits.
    </Text>
  )}
</Text>
  
        <Text mb={4}>
          Welcome to MindForge by ExoFi Labs, a cutting-edge digital platform powered by ChatGPT. Our platform seamlessly integrates advanced AI communication with rapid voice synthesis capabilities from 11Labs and Google TTS, ensuring a dynamic and responsive experience. Please select an AI Personality to chat with below. <div>Update: DALLE-3 Now Available!</div>
        </Text>
  
        <form onSubmit={onSubmit}>
          <FormControl mb={4}>
            <Input
              ref={inputRef}
              type="text"
              name="prompt"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  onSubmit(e);
                }
              }}
              placeholder="Send a message"
            />
          </FormControl>
  
          <Stack direction="row" spacing={4} mb={4}>
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading || remainingMessages <= 0}
            >
              {isLoading ? "Loading..." : "Generate Response"}
            </Button>
            <Button type="button" onClick={resetChat}>
              Reset
            </Button>
          </Stack>
  
          <Box mb={4}>
            <FormLabel>Voice:</FormLabel>
            <RadioGroup onChange={setVoice} value={voice}>
              <Stack direction="row">
                <Radio value="female">Female Voice</Radio>
                <Radio value="male">Male Voice</Radio>
                <Radio value="disabled">Disable Voice</Radio>
              </Stack>
            </RadioGroup>
          </Box>
  
          <Box mb={4}>
            <Switch isChecked={showAvatars} onChange={(e) => setShowAvatars(e.target.checked)}>Show Avatars</Switch>
          </Box>
  
          <Box mb={4}>
            <FormLabel>Select Model:</FormLabel>
            <Select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
              <option value="GPT-3.5 Turbo">GPT-3.5 Turbo</option>
              <option value="Translation">Translation</option>
              <option value="DALL-E-3">DALL-E-3 (Image Generation)</option>
            </Select>
          </Box>
  
          <Box mb={4}>
            <FormLabel>TTS Provider:</FormLabel>
            <Select value={ttsProvider} onChange={(e) => setTtsProvider(e.target.value)}>
              <option value="GoogleTTS">Google TTS</option>
              <option value="ElevenLabs" disabled>ElevenLabs (for Plus Users)</option>
            </Select>
          </Box>
  
          {showLanguageInputs && (
            <Stack spacing={4} mb={4}>
              <Input type="text" placeholder="Translate from..." value={translateFrom} onChange={e => setTranslateFrom(e.target.value)} />
              <Input type="text" placeholder="Translate to..." value={translateTo} onChange={e => setTranslateTo(e.target.value)} />
            </Stack>
          )}
  
          {selectedModel === "GPT-3.5 Turbo" && (
            <Box mb={4}>
              <FormLabel>Select an AI to Chat with:</FormLabel>
              <Stack direction="row" spacing={4}>
                <Box onClick={() => setMode('assistant')} p={2} border="1px" borderColor={mode === 'assistant' ? 'blue.500' : 'gray.200'} borderRadius="md">
                  {showAvatars && <img src="/pixel_characterAvatars/assistant.png" alt="Assistant" />}
                  <Text>Assistant</Text>
                </Box>
                <Box onClick={() => setMode('academicWriter')} p={2} border="1px" borderColor={mode === 'academicWriter' ? 'blue.500' : 'gray.200'} borderRadius="md">
                  {showAvatars && <img src="/pixel_characterAvatars/academicWriter.png" alt="Academic Writer" />}
                  <Text>Academic Writer</Text>
                </Box>
                <Box onClick={() => setMode('simplify')} p={2} border="1px" borderColor={mode === 'simplify' ? 'blue.500' : 'gray.200'} borderRadius="md">
                  {showAvatars && <img src="/pixel_characterAvatars/simplify.png" alt="Simplify" />}
                  <Text>Simplify Anything</Text>
                </Box>
                <Box onClick={() => setMode('counselor')} p={2} border="1px" borderColor={mode === 'counselor' ? 'blue.500' : 'gray.200'} borderRadius="md">
                  {showAvatars && <img src="/pixel_characterAvatars/counselor.png" alt="Counselor" />}
                  <Text>Counselor</Text>
                </Box>
                <Box onClick={() => setMode('storytelling')} p={2} border="1px" borderColor={mode === 'storytelling' ? 'blue.500' : 'gray.200'} borderRadius="md">
                  {showAvatars && <img src="/pixel_characterAvatars/storytelling.png" alt="Storytelling" />}
                  <Text>The Story Teller</Text>
                </Box>
                <Box onClick={() => setMode('coding')} p={2} border="1px" borderColor={mode === 'coding' ? 'blue.500' : 'gray.200'} borderRadius="md">
                  {showAvatars && <img src="/pixel_characterAvatars/coding.png" alt="Coding Genius" />}
                  <Text>Coding Guru</Text>
                </Box>
                <Box onClick={() => setMode('companion')} p={2} border="1px" borderColor={mode === 'companion' ? 'blue.500' : 'gray.200'} borderRadius="md">
                  {showAvatars && <img src="/pixel_characterAvatars/companion.png" alt="Companion" />}
                  <Text>Friend</Text>
                </Box>
                <Box onClick={() => setMode('MALINA')} p={2} border="1px" borderColor={mode === 'MALINA' ? 'blue.500' : 'gray.200'} borderRadius="md">
                  {showAvatars && <img src="/pixel_characterAvatars/MALINA.png" alt="MALINA" />}
                  <Text>MALINA</Text>
                </Box>
              </Stack>
            </Box>
          )}
        </form>
  
        <Box mt={8}>
          {chatHistory.map((message, index) => (
            <Box key={index} p={4} bg={message.role === 'user' ? 'blue.50' : 'gray.50'} borderRadius="md" mb={4}>
              <Text>
                {message.role === 'user' ? 'You: ' : mode === 'assistant' ? 'Assistant: ' : mode === 'academicWriter' ? 'Academic Writer: ' : mode === 'simplify' ? 'Simplify: ' : mode === 'counselor' ? 'Counselor: ' : mode === 'storytelling' ? 'The Story Teller: ' : mode === 'coding' ? 'Coding Guru: ' : mode === 'companion' ? 'Friend: ' : 'AI Personality: ' ? 'MALINA: ' : mode === 'MALINA'}
                {message.content}
              </Text>
              {message.role === 'DALL-E' && (
                <img src={message.image} alt="Generated Image" style={{ maxWidth: '80%', height: 'auto' }} />
              )}
            </Box>
          ))}
        </Box>
  
        <Analytics />
      </Container>
  
      <Footer />
    </Box>
  );
}  