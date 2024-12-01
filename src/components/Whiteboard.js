import React, { useRef, useEffect, useState } from 'react';
import SpeechToText from './SpeechToText';
import './Whiteboard.css';
import axios from 'axios';

function Whiteboard({ onTextGenerated }) {
  var canvasRef = useRef(null);
  var [imagePosition, setImagePosition] = useState({ x: 100, y: 100 });
  var [currentImage, setCurrentImage] = useState('');
  var [pointerPosition, setPointerPosition] = useState({ x: null, y: null });
  var [isPointerOverImage, setIsPointerOverImage] = useState(false);

  // Image dimensions (state to allow scaling)
  var [imageWidth, setImageWidth] = useState(150);
  var [imageHeight, setImageHeight] = useState(150);

  // For scaling smoothing
  var [lastScale, setLastScale] = useState(1); // To store the last known scale for smoothing
  var [scaleVelocity, setScaleVelocity] = useState(0); // Used to gradually change scale (easing)

  // For rotation
  var [rotationAngle, setRotationAngle] = useState(0); // Stores the current rotation angle of the image
  var [lastPointerPosition, setLastPointerPosition] = useState({ x: null, y: null }); // Stores previous pointer position for rotation

  // Fetch image on component mount
  useEffect(() => {
    var fetchImage = async () => {
      try {
        var response = await axios.get('/getImage');
        setCurrentImage(response.data);
      } catch (error) {
        console.error('Error fetching the image:', error);
      }
    };
    fetchImage();
  }, []);

  // Fetch coordinates and update image position and scaling
  useEffect(() => {
    var fetchCoords = async () => {
      try {
        var response = await axios.get('/getCoords');
        var { hand_sign_id, hand_location, C_distance, point_history } = response.data;

        if (hand_location) {
          var [pointerX, pointerY] = hand_location;

          // Normalize and clamp coordinates to canvas size
          var normalizedX = Math.max(0, Math.min(pointerX, 800));
          var normalizedY = Math.max(0, Math.min(pointerY, 600));

          // Update pointer position
          setPointerPosition({ x: normalizedX, y: normalizedY });

          // Check if pointer is over the image
          var isOverImage =
            normalizedX >= imagePosition.x &&
            normalizedX <= imagePosition.x + imageWidth &&
            normalizedY >= imagePosition.y &&
            normalizedY <= imagePosition.y + imageHeight;
          setIsPointerOverImage(isOverImage);

          // Update image position when pointer is over the image and hand_sign_id is 1
          if (hand_sign_id === 1 && isOverImage) {
            setImagePosition({
              x: normalizedX - imageWidth / 2,
              y: normalizedY - imageHeight / 2,
            });
          }

          // Scale the image when pointer is over the image and hand_sign_id is 4
          if (hand_sign_id === 4 && isOverImage && C_distance != null) {
            // Normalize C_distance (scaling factor between 0.5 and 2)
            var normalizedScale = Math.max(0.5, Math.min(C_distance / 100, 2));

            // Introduce smoothing/easing for scale (lerping the scale value)
            var scaleDifference = normalizedScale - lastScale;

            // Apply a small factor to gradually change scale (this is the smoothing)
            setScaleVelocity(scaleDifference * 0.1); // The smaller the value, the smoother the transition

            // Update the lastScale value after applying the smoothing
            setLastScale(lastScale + scaleVelocity);

            // Apply the new smooth scale to image dimensions
            setImageWidth(150 * lastScale);
            setImageHeight(150 * lastScale);
          }

          // Rotate the image when pointer is over the image and hand_sign_id is 2
          if (hand_sign_id === 2 && isOverImage && point_history) {
            var [x, y] = point_history; // Get the last two points
            if (x && y) {
              // Calculate horizontal movement for rotation
              var deltaX = x - y; // Get the relative X position difference

              // Only rotate when there's a significant X movement
              if (Math.abs(deltaX) > 5) {
                // Smooth the rotation by multiplying by 0.1
                setRotationAngle(prevAngle => {
                  // Normalize rotation angle between 0 and 360
                  var newAngle = prevAngle + deltaX * 0.1;
                  return (newAngle + 360) % 360; // Ensure rotation stays within 0-360 degrees
                });
              }
            }
            setLastPointerPosition({ x: pointerX, y: pointerY }); // Update the last pointer position
          }
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      }
    };

    var interval = setInterval(fetchCoords, 20); // Fetch data every 20ms
    return () => clearInterval(interval); // Cleanup on unmount
  }, [imagePosition, lastScale, scaleVelocity, rotationAngle, lastPointerPosition]); // Dependencies

  // Draw image and pointer
  useEffect(() => {
    var canvas = canvasRef.current;
    var ctx = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 600;

    if (!currentImage) return;

    var img = new Image();
    img.src = currentImage;

    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set the transformation for rotation
      ctx.save();

      // Translate to the center of the image
      ctx.translate(imagePosition.x + imageWidth / 2, imagePosition.y + imageHeight / 2);

      // Apply rotation in radians
      ctx.rotate(rotationAngle * Math.PI / 180);

      // Translate back to the top-left corner
      ctx.translate(-imageWidth / 2, -imageHeight / 2);

      // Draw image with border if pointer is over it
      if (isPointerOverImage) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, imageWidth, imageHeight);
      }

      // Draw image with updated width, height, and rotation
      ctx.drawImage(img, 0, 0, imageWidth, imageHeight);

      // Restore the context to its original state (to prevent affecting other drawings)
      ctx.restore();

      // Draw pointer
      if (pointerPosition.x !== null && pointerPosition.y !== null) {
        ctx.beginPath();
        ctx.arc(pointerPosition.x, pointerPosition.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'red'; // Pointer color
        ctx.fill();
        ctx.closePath();
      }
    };
  }, [currentImage, imagePosition, pointerPosition, isPointerOverImage, imageWidth, imageHeight, rotationAngle]);  // Dependencies to trigger update

  return (
    <div className="whiteboard-container">
      <canvas ref={canvasRef} style={{ border: '1px solid black' }}></canvas>
      <div className="coords-display">
        <p>Pointer Coordinates: X = {pointerPosition.x ?? 'N/A'}, Y = {pointerPosition.y ?? 'N/A'}</p>
        <p>Image Position: X = {imagePosition.x}, Y = {imagePosition.y}</p>
        <p>Image Dimensions: Width = {imageWidth}, Height = {imageHeight}</p>
        <p>Rotation Angle: {rotationAngle.toFixed(2)}°</p>
        <p>{isPointerOverImage ? 'Pointer is over the image' : 'Pointer is not over the image'}</p>
      </div>
      <SpeechToText onTextGenerated={onTextGenerated} />
    </div>
  );
}

export default Whiteboard;
