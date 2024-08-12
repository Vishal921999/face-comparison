const express = require('express');
const multer = require('multer');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const tf = require('@tensorflow/tfjs'); 
const { Canvas, Image, ImageData } = canvas;

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const app = express();
const port = 4000;

const storage = multer.memoryStorage();
const upload = multer({ storage });

Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromDisk('./models'),
  faceapi.nets.faceLandmark68Net.loadFromDisk('./models'),
  faceapi.nets.faceRecognitionNet.loadFromDisk('./models')
]).then(() => console.log('Models loaded'))
  .catch(err => console.error('Error loading models:', err));

app.use(express.json());

app.post('/compare-faces', upload.fields([{ name: 'image1' }, { name: 'image2' }]), async (req, res) => {
  try {
    // Check if images are provided
    const { image1, image2 } = req.files;
    if (!image1 || !image2) {
      return res.status(400).json({ error: 'Both image files are required.' });
    }

    const image1Buffer = image1[0].buffer;
    const image2Buffer = image2[0].buffer;

    // Load images
    const img1 = await canvas.loadImage(image1Buffer);
    const img2 = await canvas.loadImage(image2Buffer);

    // Log image paths (since you cannot get the original path from memory storage, log the buffer length as a proxy)
    console.log('Received Image 1 Buffer Length:', image1Buffer.length);
    console.log('Received Image 2 Buffer Length:', image2Buffer.length);

    // Detect faces and landmarks
    const detections1 = await faceapi.detectAllFaces(img1).withFaceLandmarks().withFaceDescriptors();
    const detections2 = await faceapi.detectAllFaces(img2).withFaceLandmarks().withFaceDescriptors();

    // Log detected landmarks
    if (detections1.length > 0) {
      console.log('Detected Landmarks for Image 1:', detections1[0].landmarks.positions);
    } else {
      console.log('No landmarks detected in Image 1.');
    }

    if (detections2.length > 0) {
      console.log('Detected Landmarks for Image 2:', detections2[0].landmarks.positions);
    } else {
      console.log('No landmarks detected in Image 2.');
    }

    // Compare faces
    if (detections1.length === 0 || detections2.length === 0) {
      return res.json({ match: false, reason: 'No faces detected in one or both images.' });
    }

    const faceDescriptor1 = detections1[0].descriptor;
    const faceDescriptor2 = detections2[0].descriptor;

    const distance = faceapi.euclideanDistance(faceDescriptor1, faceDescriptor2);
    const threshold = 0.6;

    const match = distance <= threshold;

    res.json({ match, distance });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error during face comparison' });
  }
});

app.listen(port, () => {
  console.log(`Face API microservice running at http://localhost:${port}`);
});
