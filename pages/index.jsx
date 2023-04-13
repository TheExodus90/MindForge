import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";
import "isomorphic-fetch";

export default function Home() {
  const [count, setCounter] = useState(0);
  const [promptInput, setPromptInput] = useState("");
  const [result, setResult] = useState();
  const [voice, setVoice] = useState("female");
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

      const audioResponse = await fetch("/api/elevenLabs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: data.result, voice }),
      });

      // Play the audio
      if (audioResponse.ok) {
        const audioBlob = await audioResponse.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      } else {
        console.error("Error fetching audio from ElevenLabs API:", await audioResponse.text());
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
            <input type="radio" name="voice" value="female" checked={voice === 'female'} onChange={(e) => setVoice(e.target.value)} /> Male Voice
            <input type="radio" name="voice" value="male" checked={voice === 'male'} onChange={(e) => setVoice(e.target.value)} /> Female Voice
          </div>
          
        <div>
        <label htmlFor="mode">Personality: </label>
        <select name="mode" value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="genie">Genie</option>
        <option value="assistant">Assistant</option>
        <option value="simplify">Simplify</option>
        <option value="positive">Positive</option>
        <option value="storytelling">Storytelling</option>
        <option value="PHD">PHD</option>
        <option value="companion">Travel Agent</option>
        
      </select>
  </div>
  <input type="submit" value="Generate Response" />
  </form>
  <textarea
  className={styles.result}
  value={result}
  readOnly
  style={{width: '40%', height: '200px'}}
  placeholder="Generated response will appear here"
    />
    </main>
    </div>
    );
    }
