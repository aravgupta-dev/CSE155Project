import React, { useRef, useEffect, useState } from 'react';
import SpeechToText from './SpeechToText';
import './Whiteboard.css';
import axios from 'axios';

function Whiteboard({ onTextGenerated }) {
  const canvasRef = useRef(null);
  const [imagePosition, setImagePosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [currentImage, setCurrentImage] = useState('');

  // Fetch the image URL once when the component mounts
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await axios.get('/getImage');
        setCurrentImage(response.data);
      } catch (error) {
        console.error('Error fetching the image:', error);
      }
    };
    fetchImage();
  }, []); // Empty dependency array ensures this runs only once

  // Draw the image whenever the imagePosition or currentImage changes
  useEffect(() => {
    if (!currentImage) return; // Don't draw if image is not loaded yet

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 600;

    const img = new Image();
    img.src = currentImage;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height); // Whiteboard background
      ctx.drawImage(img, imagePosition.x, imagePosition.y, 150, 150);
    };
  }, [imagePosition, currentImage]);

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
