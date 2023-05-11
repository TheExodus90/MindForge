import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "./index.module.css";
import "isomorphic-fetch";

export default function Home() {
  const [count, setCounter] = useState(0);
  const [promptInput, setPromptInput] = useState("");
  const [result, setResult] = useState();
  const [voice, setVoice] = useState("female");
  const [ttsProvider, setTtsProvider] = useState("ElevenLabs");
  const [mode, setMode] = useState("genie");
  const [userAvatar, setUserAvatar] = useState("default");
  const [characterAvatar, setCharacterAvatar] = useState("/characterAvatars/genie.png");
  const [isLoading, setIsLoading] = useState(false);

  

  async function onSubmit(e) {
    e.preventDefault();
    setIsLoading(true); // Start loading

    try {
      if (count == 25) {
        return console.log("you have reached your limit");
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: promptInput, voice, mode }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(
        (prevResult) =>
          `${prevResult ? prevResult + '\n\n' : ''}You: ${promptInput}\nChatGPT: ${
            data.result.trim()
          }`
      );
      setCounter(count + 1);
      setPromptInput("");

      const ttsEndpoint = ttsProvider === "ElevenLabs" ? "/api/elevenLabs" : "/api/googleTTS";
      const voiceParam = ttsProvider === "GoogleTTS" ? (voice === "female" ? "en-AU-Wavenet-C" : "en-US-Wavenet-D") : (voice === "female" ? "female" : "male");
  
      console.log(`Type of voice: ${typeof voice}`);
      console.log(`Type of ttsProvider: ${typeof ttsProvider}`);
      console.log(`Type of voiceParam: ${typeof voiceParam}`);
      console.log(`Value of voice: ${voice}`);
      console.log(`Value of ttsProvider: ${ttsProvider}`);
      console.log(`Value of voiceParam: ${voiceParam}`);
      
      
      

      
      const audioResponse = await fetch(ttsEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: data.result, voice: voiceParam }),
      });
      console.log(`Sending voice to TTS API: ${voiceParam}`);

      // Play the audio
      if (audioResponse.ok) {
        const audioBlob = await audioResponse.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      } else {
        console.error("Error fetching audio:", await audioResponse.text());
        alert("An error occurred while fetching audio.");
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false); // End loading
    }
  }

  
useEffect(() => {
  setCharacterAvatar(`/characterAvatars/${mode}.png`);
}, [mode]);
  return (
    <div className={styles.body} style={{ minHeight: "100vh" }}>
      <Head>
        <title>Mind Forge</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        
        <h3>Mind Forge</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="prompt"
            value={promptInput}
            onChange={(e) => {
              setPromptInput(e.target.value);
              console.log(promptInput);
            }}
            placeholder="Ask Genie A Question"
          />
          <div>
            <input type="radio" name="voice" value="female" checked={voice === 'female'} onChange={(e) => setVoice(e.target.value)} /> Female Voice
            <input type="radio" name="voice" value="male" checked={voice === 'male'} onChange={(e) => setVoice(e.target.value)} /> Male Voice
          </div>
          <div>
            <label htmlFor="ttsProvider">TTS Provider: </label>
            <select name="ttsProvider" value={ttsProvider} onChange={(e) => setTtsProvider(e.target.value)}>
              <option value="ElevenLabs">ElevenLabs</option>
              <option value="GoogleTTS">Google TTS</option>
            </select>
          </div>
          <div>
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
            </select>
          </div>
          <div>
          <div className={styles.characterAvatarContainer}>
          
        </div>
        
        <label htmlFor="mode">Select an AI to Chat with: </label>

<div className={styles.characterAvatarContainer}>
<label htmlFor="characterGenie">
  <input type="radio" id="characterGenie" name="mode" value="genie" checked={mode === 'genie'} onChange={(e) => setMode(e.target.value)} />
  <img src="/characterAvatars/genie.png" alt="Genie" className={`${styles.characterAvatarImage} ${styles.characterAvatarRoundedCorners}`} />
  Genie
</label>

<label htmlFor="characterAssistant">
  <input type="radio" id="characterAssistant" name="mode" value="assistant" checked={mode === 'assistant'} onChange={(e) => setMode(e.target.value)} />
  <img src="/characterAvatars/assistant.png" alt="Assistant" className={`${styles.characterAvatarImage} ${styles.characterAvatarRoundedCorners}`} />
  Your Assistant
</label>

<label htmlFor="characterSimplify">
  <input type="radio" id="characterSimplify" name="mode" value="simplify" checked={mode === 'simplify'} onChange={(e) => setMode(e.target.value)} />
  <img src="/characterAvatars/simplify.png" alt="Simplify" className={`${styles.characterAvatarImage} ${styles.characterAvatarRoundedCorners}`} />
  Simplify Bot
</label>

<label htmlFor="characterPositive">
  <input type="radio" id="characterPositive" name="mode" value="positive" checked={mode === 'positive'} onChange={(e) => setMode(e.target.value)} />
  <img src="/characterAvatars/positive.png" alt="Positive" className={`${styles.characterAvatarImage} ${styles.characterAvatarRoundedCorners}`} />
  Positive Affirmations
</label>


<label htmlFor="characterStorytelling">
  <input type="radio" id="characterStorytelling" name="mode" value="storytelling" checked={mode === 'storytelling'} onChange={(e) => setMode(e.target.value)} />
  <img src="/characterAvatars/storytelling.png" alt="Storytelling" className={`${styles.characterAvatarImage} ${styles.characterAvatarRoundedCorners}`} />
  The Storyteller
</label>

<label htmlFor="characterCoding">
  <input type="radio" id="characterCoding" name="mode" value="coding" checked={mode === 'coding'} onChange={(e) => setMode(e.target.value)} />
  <img src="/characterAvatars/coding.png" alt="Coding Genius" className={`${styles.characterAvatarImage} ${styles.characterAvatarRoundedCorners}`} />
  Coding Genius
</label>

<label htmlFor="characterCompanion">
  <input type="radio" id="characterCompanion" name="mode" value="companion" checked={mode === 'companion'} onChange={(e) => setMode(e.target.value)} />
  <img src="/characterAvatars/companion.png" alt="Companion" className={`${styles.characterAvatarImage} ${styles.characterAvatarRoundedCorners}`} />
  Companion
</label>

<label htmlFor="character5H0D4N">
  <input type="radio" id="character5H0D4N" name="mode" value="5H0D4N" checked={mode === '5H0D4N'} onChange={(e) => setMode(e.target.value)} />
  <img src="/characterAvatars/5H0D4N.png" alt="5H0D4N" className={`${styles.characterAvatarImage} ${styles.characterAvatarRoundedCorners}`} />
  5H0D4N
</label>
  
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



  </div>
{/* ... */}
<input type="submit" value={isLoading ? "Loading..." : "Generate Response"} disabled={isLoading} />
</form>
<textarea
  className={styles.result}
  value={result}
  readOnly
  style={{width: '37.5%', height: '275px'}}
  placeholder="Generated response will appear here"
/>
</main>
</div>

  );
}
