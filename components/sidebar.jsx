

import React from 'react';
import styles from "../pages/index.module.css";

const Sidebar = ({
    isNightMode,
    toggleNightMode,
    voice,
    setVoice,
    showAvatars,
    setShowAvatars,
    selectedModel,
    setSelectedModel,
    ttsProvider,
    setTtsProvider,
    showLanguageInputs,
    translateFrom,
    setTranslateFrom,
    translateTo,
    setTranslateTo,
    mode,
    setMode
}) => {
    return (
        <div className={styles.sidebar}>
            <div className={styles.nightModeToggle}>
                <span onClick={toggleNightMode}>
                    {isNightMode ? <span>🌙</span> : <span>☀️</span>}
                </span>
            </div>

            <div>
                <ul>
                    <li>Home</li>
                    <li>About</li>
                    <li>Contact</li>
                </ul>
            </div>

            <div>
                <label>Voice Options:</label>
                <div>
                    <input type="radio" name="voice" value="female" checked={voice === 'female'} onChange={(e) => setVoice(e.target.value)} /> Female Voice
                    <input type="radio" name="voice" value="male" checked={voice === 'male'} onChange={(e) => setVoice(e.target.value)} /> Male Voice
                    <input type="radio" name="voice" value="disabled" checked={voice === 'disabled'} onChange={(e) => setVoice(e.target.value)} /> Disable Voice
                </div>

                <div>
                    <input type="checkbox" name="avatarDisplay" checked={showAvatars} onChange={(e) => setShowAvatars(e.target.checked)} /> Show Avatars
                </div>
            </div>

            <div>
                <label htmlFor="modelSelection">Select Model: </label>
                <select name="modelSelection" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                    <option value="GPT-3.5 Turbo">GPT-3.5 Turbo</option>
                    <option value="Translation">Translation</option>
                    <option value="DALL-E-3">DALL-E-3 (Image Generation)</option>
                </select>
            </div>

            <div>
                <label htmlFor="ttsProvider">TTS Provider: </label>
                <select name="ttsProvider" value={ttsProvider} onChange={(e) => setTtsProvider(e.target.value)}>
                    <option value="GoogleTTS">Google TTS</option>
                    <option value="ElevenLabs" disabled>ElevenLabs (for Plus Users)</option>
                </select>
            </div>

            {showLanguageInputs && (
                <div>
                    <input type="text" placeholder="Translate from..." value={translateFrom} onChange={(e) => setTranslateFrom(e.target.value)} />
                    <input type="text" placeholder="Translate to..." value={translateTo} onChange={(e) => setTranslateTo(e.target.value)} />
                </div>
            )}

            {selectedModel === "GPT-3.5 Turbo" && (
                <div className={styles.characterAvatarContainer}>
                    {/* Render character avatars/personalities here */}
                    <label htmlFor="mode">Select an AI to Chat with: </label>
                    <div className={styles.characterAvatarContainer}>
                        {/* Iterate through AI character options here */}
                        {/* Example for 'assistant' mode */}
                        <div className={`${styles.shadowBox} ${mode === 'assistant' ? styles.selected : ''}`} onClick={() => setMode('assistant')}>
                            {showAvatars && <img src="/pixel_characterAvatars/assistant.png" alt="Assistant" className={styles.characterAvatarImage} />}
                            <span>Assistant</span>
                        </div>

                        {/* Add other characters similarly */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
