import React, { useRef, useEffect, useState } from 'react';
import SpeechToText from './SpeechToText';
import './Whiteboard.css';

function Whiteboard({ onTextGenerated }) {
  const canvasRef = useRef(null);
  const [imagePosition, setImagePosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 600;

    const img = new Image();
    img.src = 'https://via.placeholder.com/150'; // Replace with your image URL
    img.onload = () => {
      ctx.drawImage(img, imagePosition.x, imagePosition.y, 150, 150);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height); // Whiteboard background
      ctx.drawImage(img, imagePosition.x, imagePosition.y, 150, 150);
    };
    draw();
  }, [imagePosition]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (
      x >= imagePosition.x &&
      x <= imagePosition.x + 150 &&
      y >= imagePosition.y &&
      y <= imagePosition.y + 150
    ) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setImagePosition({ x: x - 75, y: y - 75 });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="whiteboard-container"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <canvas ref={canvasRef} style={{ border: '1px solid black' }}></canvas>
      <SpeechToText onTextGenerated={onTextGenerated} />
    </div>
  );
}

export default Whiteboard;
