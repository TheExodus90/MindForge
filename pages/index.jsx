import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";
import "isomorphic-fetch";

export default function Home() {
  const [count, setCounter] = useState(0);
  const [promptInput, setPromptInput] = useState("");
  const [result, setResult] = useState();
  const [voice, setVoice] = useState("female");
  const [ttsProvider, setTtsProvider] = useState("ElevenLabs");
  const [mode, setMode] = useState("genie");

  async function onSubmit(e) {
    e.preventDefault();

    try {
      if (count == 10) {
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
    }
  }

  return (
    <div className={styles.body} style={{ minHeight: "100vh" }}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <img src="/favicon.ico" className={styles.icon} />
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
            </select>
          </div>
          <input type="submit" value="Generate Response" />
        </form>
        <textarea
          className={styles.result}
          value={result}
          readOnly
          style={{width: '40%', height: '220px'}}
          placeholder="Generated response will appear here"
        />
      </main>
    </div>
  );
}
