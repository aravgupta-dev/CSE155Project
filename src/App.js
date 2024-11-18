import React, { useState } from 'react';
import Whiteboard from './components/Whiteboard';
import './App.css';

function App() {
  const [generatedText, setGeneratedText] = useState('');

  const handleTextGenerated = (text) => {
    setGeneratedText(text);
    console.log("Generated text from speech:", text); // For debugging
  };

  return (
    <div className="App">
      <h1 className="title">P!cture Th!s</h1>
      <Whiteboard onTextGenerated={handleTextGenerated} />
      <p>Text from Speech: {generatedText}</p>
    </div>
  );
}

export default App;
