import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";
import "isomorphic-fetch";

export default function Home() {
  const [count, setCounter] = useState(0);
  const [promptInput, setPromptInput] = useState("");
  const [result, setResult] = useState();

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
        body: JSON.stringify({ prompt: promptInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setCounter(count + 1);
      setPromptInput("");

      const audioResponse = await fetch("/api/elevenLabs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: data.result }),
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
        <h3>Ask Genie a Question</h3>
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
          <input type="submit" value="Generate Response" />
        </form>
        <div className={styles.result}>{result}</div>
      </main>
    </div>
  );
}
