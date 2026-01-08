# P!icture Th!s
P!icture Th!s is an interactive, browser-based whiteboard application that combines speech recognition, computer vision, and gesture-based interaction to create a hands-free, intuitive creative experience. Users can speak ideas into the system, see those ideas visualized as images on a shared whiteboard, and manipulate them in real time using hand gestures captured through a webcam.

## Overview
The application enables users to:
* Speak aloud to generate visual representations of their ideas
* Automatically add generated images to a digital whiteboard
* Use hand gestures to move, rotate, and resize images
* Interact naturally without physical input devices such as a mouse or keyboard
The core innovation of the project lies in its real-time hand tracking and gesture recognition pipeline, which translates physical hand movements into precise transformations applied to on-screen elements.

## Key Features
* **Voice-to-Image Pipeline**
  - Spoken input is processed and converted into visual elements that are added to the whiteboard.

* **Gesture-Based Interaction**
  - Hand gestures detected through a webcam allow users to:
    + Translate (move) images
    + Rotate images
    + Resize images
* **Real-Time Computer Vision**
  - Low-latency hand tracking enables smooth and responsive interaction.
 
## Technical Details
### Model Training
* Training and experimentation were performed in Jupyter Notebook
* Gesture datasets were stored and processed from CSV files
* Model outputs included hand landmarks and gesture states used for downstream logic
### Gesture Mapping Logic
Detected gestures were translated into geometric transformations:

* Translation → Position updates (x, y)
* Rotation → Angle calculations based on index finger relative position
* Scaling → Distance-based resizing using landmark separation

These transformations were applied continuously to ensure smooth, real-time manipulation of whiteboard elements.
