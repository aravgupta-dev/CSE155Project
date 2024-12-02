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
    <div className="App" style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
      {/* Static Help Section */}
      <div className="help-section" style={{ width: '350px', padding: '20px', backgroundColor: '#f9f9f9', borderRight: '1px solid #ccc', height: '100vh', overflowY: 'auto' }}>
        <h1 style={{ fontSize: '1.8em', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Welcome to <span style={{ color: '#007bff' }}>P!cture Th!s!</span></h1>
        <p>Here’s a quick guide to help you navigate and use the site:</p>
        <h2 style={{ fontSize: '1.2em', fontWeight: 'bold' }}>Generating an Image:</h2>
        <p style={{ marginLeft: '20px' }}>🎤 To create an image, simply press the mic button located at the bottom-right corner of the page and speak your description.</p>
        <h2 style={{ fontSize: '1.2em', fontWeight: 'bold' }}>Manipulating Images:</h2>
        <p style={{ marginLeft: '20px' }}>✋ <b>Open Hand:</b> Move the cursor around.</p>
        <p style={{ marginLeft: '20px' }}>✊ <b>Closed Hand:</b> Select an image to move it.</p>
        <p style={{ marginLeft: '20px' }}>🤏 <b>Form a ‘C’ Shape with Your Hand:</b> Resize the image.</p>
        <p style={{ marginLeft: '20px' }}>👆 <b>Pointer Finger in a Circle:</b> Rotate the image.</p>
        <h2 style={{ fontSize: '1.2em', fontWeight: 'bold' }}>Removing an Image:</h2>
        <p style={{ marginLeft: '20px' }}>🗑️ To remove an image, drag it to the bottom-right corner of the whiteboard and release it.</p>
        <p style={{ fontStyle: 'italic', marginTop: '20px' }}>Enjoy exploring your creativity with <span style={{ color: '#007bff' }}>P!cture Th!s!</span>!</p>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px' }}>
        <h1 className="title">P!cture Th!s</h1>
        <Whiteboard onTextGenerated={handleTextGenerated} />
        <p>Text from Speech: {generatedText}</p>
      </div>
    </div>
  );
}

export default App;
