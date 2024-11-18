import React, { useState } from 'react';
import './SpeechToText.css';

function SpeechToText({ onTextGenerated }) {
  const [isListening, setIsListening] = useState(false);

  const handleSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support speech recognition. Please try Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const speechText = event.results[0][0].transcript;
      onTextGenerated(speechText); // Send the text back to App component
    };

    recognition.start();
  };

  return (
    <button 
      className="microphone-button" 
      onClick={handleSpeech} 
      disabled={isListening}
      aria-label="Touch to Speak"
    >
      🎤
    </button>
  );
}

export default SpeechToText;
