import { useState } from 'react';
import styles from './index.module.css'; // Import your CSS module here

export default function VisionPage() {
  const [imageData, setImageData] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImageData(reader.result);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/gpt4Vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageData, question })
    });

    const data = await res.json();
    console.log("Response from backend:", data);

    if (data.error) {
      setResponse(`Error: ${data.error.message}`);
    } else if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      setResponse(data.choices[0].message.content);
    } else {
      setResponse("No response or unexpected response format.");
    }
  };

  return (
    <div className={styles.body}>
      <h1 className={styles.main}>GPT-4 Vision</h1>
      <form onSubmit={handleSubmit} className={styles.mainForm}>
        <input type="file" onChange={handleImageChange} className={styles.inputFile} />
        <input 
          type="text" 
          value={question} 
          onChange={(e) => setQuestion(e.target.value)} 
          placeholder="What’s in this image?" 
          className={styles.inputText}
        />
        <button type="submit" className={styles.submitButton}>Ask GPT-4</button>
      </form>
      {response && <div className={styles.result}><strong>Response:</strong> {response}</div>}
    </div>
  );
}
