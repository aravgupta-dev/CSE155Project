import React, { useRef, useEffect, useState } from 'react';
import SpeechToText from './SpeechToText';
import './Whiteboard.css';
import axios from 'axios';

function Whiteboard({ onTextGenerated }) {
  const canvasRef = useRef(null);
  const [imagePosition, setImagePosition] = useState({ x: 100, y: 100 });
  const [currentImage, setCurrentImage] = useState('');
  const [pointerPosition, setPointerPosition] = useState({ x: null, y: null });
  const [isPointerOverImage, setIsPointerOverImage] = useState(false);

  // Image dimensions
  const imageWidth = 150;
  const imageHeight = 150;

  // Fetch image on component mount
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
  }, []);

  // Fetch coordinates periodically
  useEffect(() => {
    const fetchCoords = async () => {
      try {
        const response = await axios.get('/getCoords');
        const { hand_sign_id, hand_location, finger_gesture_id, point_history, C_distance } = response.data;

        if (hand_location) {
          const [pointerX, pointerY] = hand_location;

          // Normalize and clamp coordinates to canvas size
          const normalizedX = Math.max(0, Math.min(pointerX, 800));
          const normalizedY = Math.max(0, Math.min(pointerY, 600));

          // Update pointer position
          setPointerPosition({ x: normalizedX, y: normalizedY });

          // Check if pointer is over the image
          var isOverImage =
            normalizedX >= imagePosition.x &&
            normalizedX <= imagePosition.x + imageWidth &&
            normalizedY >= imagePosition.y &&
            normalizedY <= imagePosition.y + imageHeight;
          setIsPointerOverImage(isOverImage);

          // Update image position only when pointer is over the image and hand_sign_id is 1
          if (hand_sign_id === 1 && isOverImage) {
            setImagePosition({
              x: normalizedX - imageWidth / 2,
              y: normalizedY - imageHeight / 2,
            });
          }
        }

        if (C_distance && C_position) {
          const C_dist = C_distance;
          const [pointerX, pointerY] = C_position;

          // Normalize and clamp coordinates to canvas size
          const normalizedX = Math.max(0, Math.min(pointerX, 800));
          const normalizedY = Math.max(0, Math.min(pointerY, 600));

          // Update pointer position
          setPointerPosition({ x: normalizedX, y: normalizedY });

          // Check if pointer is over the image
          var isOverImage =
            normalizedX >= imagePosition.x &&
            normalizedX <= imagePosition.x + imageWidth &&
            normalizedY >= imagePosition.y &&
            normalizedY <= imagePosition.y + imageHeight;
          setIsPointerOverImage(isOverImage);

          // Update image position only when pointer is over the image and hand_sign_id is 1
          if (hand_sign_id === 4 && isOverImage) {
            setImageSize({
              //Attempting to change size unsure how
            });
          }
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      }
    };

    const interval = setInterval(fetchCoords, 20); // Fetch data every 100ms
    return () => clearInterval(interval); // Cleanup on unmount
  }, [imagePosition]);

  // Draw image and pointer
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 600;

    if (!currentImage) return;

    const img = new Image();
    img.src = currentImage;

    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw image with border if pointer is over it
      if (isPointerOverImage) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 4;
        ctx.strokeRect(imagePosition.x, imagePosition.y, imageWidth, imageHeight);
      }
      ctx.drawImage(img, imagePosition.x, imagePosition.y, imageWidth, imageHeight);

      // Draw pointer
      if (pointerPosition.x !== null && pointerPosition.y !== null) {
        ctx.beginPath();
        ctx.arc(pointerPosition.x, pointerPosition.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'red'; // Pointer color
        ctx.fill();
        ctx.closePath();
      }
    };
  }, [currentImage, imagePosition, pointerPosition, isPointerOverImage]);

  return (
    <div className="whiteboard-container">
      <canvas ref={canvasRef} style={{ border: '1px solid black' }}></canvas>
      <div className="coords-display">
        <p>Pointer Coordinates: X = {pointerPosition.x ?? 'N/A'}, Y = {pointerPosition.y ?? 'N/A'}</p>
        <p>Image Position: X = {imagePosition.x}, Y = {imagePosition.y}</p>
        <p>{isPointerOverImage ? 'Pointer is over the image' : 'Pointer is not over the image'}</p>
      </div>
      <SpeechToText onTextGenerated={onTextGenerated} />
    </div>
  );
}

export default Whiteboard;
