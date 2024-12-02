import React, { useRef, useEffect, useState } from 'react';
import SpeechToText from './SpeechToText';
import './Whiteboard.css';
import axios from 'axios';

function Whiteboard({ onTextGenerated }) {
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]); // Array of images with their properties
  const [pointerPosition, setPointerPosition] = useState({ x: null, y: null });
  const [selectedImageId, setSelectedImageId] = useState(null); // ID of the currently selected image
  const [isPointerOverImage, setIsPointerOverImage] = useState(false);

  // For scaling smoothing
  const [lastScale, setLastScale] = useState(1); // To store the last known scale for smoothing
  const [scaleVelocity, setScaleVelocity] = useState(0); // Used to gradually change scale (easing)

  // For rotation
  const [rotationAngles, setRotationAngles] = useState({}); // Store rotation angles for each image

  // Text generated from speech
  const [generatedText, setGeneratedText] = useState('');

  // Trash bin coordinates
  const trashBin = { x: 650, y: 500, width: 100, height: 100 }; // Define the trash bin area

  // Fetch image on component mount or when generatedText changes
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await axios.get('/getImage', {
          params: { query: generatedText }, // Pass generatedText as a query param
        });
        setImages((prevImages) => [
          ...prevImages,
          { 
            id: Date.now(), 
            src: response.data, 
            position: { x: 100, y: 100 }, 
            width: 150, 
            height: 150, 
            rotation: 0, 
            imageElement: null // Placeholder for cached image element
          },
        ]);
      } catch (error) {
        console.error('Error fetching the image:', error);
      }
    };

    if (generatedText) {
      fetchImage(); // Fetch image when generatedText is available
    }
  }, [generatedText]);

  // Fetch coordinates and update image position and scaling
  useEffect(() => {
    const fetchCoords = async () => {
      try {
        const response = await axios.get('/getCoords');
        const { hand_sign_id, hand_location, C_distance, point_history } = response.data;

        if (hand_location) {
          const [pointerX, pointerY] = hand_location;

          // Normalize and clamp coordinates to canvas size
          const normalizedX = Math.max(0, Math.min(pointerX, 800));
          const normalizedY = Math.max(0, Math.min(pointerY, 600));

          // Update pointer position
          setPointerPosition({ x: normalizedX, y: normalizedY });

          // Check if pointer is over any image
          let newSelectedImageId = null;
          setIsPointerOverImage(false);
          let newCursorStyle = 'default'; // Default cursor

          setImages((prevImages) =>
            prevImages.map((image) => {
              const isOverImage =
                normalizedX >= image.position.x &&
                normalizedX <= image.position.x + image.width &&
                normalizedY >= image.position.y &&
                normalizedY <= image.position.y + image.height;

              if (isOverImage) {
                setIsPointerOverImage(true);
                newSelectedImageId = image.id; // Set the ID of the image the pointer is over

                // Change cursor based on hand_sign_id
                if (hand_sign_id === 1) {
                  newCursorStyle = 'move'; // Move cursor for dragging
                } else if (hand_sign_id === 4 && C_distance != null) {
                  newCursorStyle = C_distance > 100 ? 'zoom-out' : 'zoom-in'; // Zoom cursor for scaling
                } else if (hand_sign_id === 2 && point_history) {
                  newCursorStyle = 'grabbing'; // Grabbing cursor for rotating
                }
              }

              // Update image position when pointer is over it and hand_sign_id is 1
              if (hand_sign_id === 1 && isOverImage) {
                return {
                  ...image,
                  position: {
                    x: normalizedX - image.width / 2,
                    y: normalizedY - image.height / 2,
                  },
                };
              }

              // Scale the image when pointer is over the image and hand_sign_id is 4
              if (hand_sign_id === 4 && isOverImage && C_distance != null) {
                const normalizedScale = Math.max(0.5, Math.min(C_distance / 100, 2));

                const scaleDifference = normalizedScale - lastScale;
                setScaleVelocity(scaleDifference * 0.1); // The smaller the value, the smoother the transition
                setLastScale(lastScale + scaleVelocity);

                return {
                  ...image,
                  width: 150 * lastScale,
                  height: 150 * lastScale,
                };
              }

              // Rotate the image when pointer is over the image and hand_sign_id is 2
              if (hand_sign_id === 2 && isOverImage && point_history) {
                const [x, y] = point_history;
                if (x && y) {
                  const deltaX = x - y;
                  if (Math.abs(deltaX) > 5) {
                    setRotationAngles((prevAngles) => {
                      const newAngle = (prevAngles[image.id] || 0) + deltaX * 0.05;
                      return { ...prevAngles, [image.id]: (newAngle + 360) % 360 };
                    });
                  }
                }
              }

              return image;
            })
          );

          // Update the selected image ID
          if (newSelectedImageId !== selectedImageId) {
            setSelectedImageId(newSelectedImageId);
          }

          // Check if any image is in the trash bin's area and delete it
          setImages((prevImages) => prevImages.filter((image) => {
            const isInTrashBin =
              image.position.x + image.width > trashBin.x &&
              image.position.x < trashBin.x + trashBin.width &&
              image.position.y + image.height > trashBin.y &&
              image.position.y < trashBin.y + trashBin.height;

            return !isInTrashBin; // Keep the image if it's not in the trash bin
          }));

          // Update cursor style
          document.body.style.cursor = newCursorStyle;

        }
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      }
    };

    const interval = setInterval(fetchCoords, 20); // Fetch data every 20ms
    return () => clearInterval(interval); // Cleanup on unmount
  }, [lastScale, scaleVelocity, selectedImageId]);

  // Draw images and pointer
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 600;

    if (images.length > 0) {
      // Only clear canvas when necessary
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      images.forEach((image) => {
        if (!image.imageElement) {
          // Create an image element only once
          const img = new Image();
          img.src = image.src;
          img.onload = () => {
            image.imageElement = img;
            drawImage(image);
          };
        } else {
          drawImage(image);
        }
      });

      // Draw pointer
      if (pointerPosition.x !== null && pointerPosition.y !== null) {
        ctx.beginPath();
        ctx.arc(pointerPosition.x, pointerPosition.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'red'; // Pointer color
        ctx.fill();
        ctx.closePath();
      }

    }
  }, [images, pointerPosition, isPointerOverImage, selectedImageId, rotationAngles]);

  const drawImage = (image) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.translate(image.position.x + image.width / 2, image.position.y + image.height / 2);
    const rotation = rotationAngles[image.id] || image.rotation;
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-image.width / 2, -image.height / 2);

    // Highlight only the selected image
    if (image.id === selectedImageId) {
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, image.width, image.height);
    }

    ctx.drawImage(image.imageElement, 0, 0, image.width, image.height);
    ctx.restore();
  };

  return (
    <div className="whiteboard-container">
      <canvas
        ref={canvasRef}
        style={{ border: '5px solid black' }}
      ></canvas>
      <SpeechToText onTextGenerated={setGeneratedText} />
    </div>
  );
}

export default Whiteboard;
