// pages/dalle.js
import { useState } from 'react';
import styles from './index.module.css'; // Importing the CSS module

export default function DallePage() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newMessage = { text: inputText, sender: 'user' };
    setMessages(oldMessages => [...oldMessages, newMessage]);

    const response = await fetch('/api/dalleGen', {
      method: 'POST',
      body: JSON.stringify({ prompt: inputText }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    const imageUrl = data.data[0].url;
    setMessages(oldMessages => [...oldMessages, { text: imageUrl, sender: 'bot' }]);
    setInputText('');
  };

  return (
    <div className={styles.main}> {/* replaces chatContainer */}
  <div className={styles.result}> {/* replaces chatBox */}
        {messages.map((message, index) => (
          <div key={index} className={`${styles.message} ${message.sender === 'bot' ? styles.bot : styles.user}`}>
            {message.sender === 'bot' ? <img src={message.text} alt="Generated from DALL-E" /> : message.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter a prompt for DALL-E..."
          className={styles.input}
        />
        <button type="submit" className={styles.button}>Send</button>
      </form>
    </div>
  );
}
