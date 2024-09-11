// src/face/face.service.ts
import { Injectable } from '@nestjs/common';
import { ImageAnnotatorClient, protos } from '@google-cloud/vision';
import { existsSync } from 'fs';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FaceService {
  private client: ImageAnnotatorClient;

  constructor() {
    // Initialize Google Cloud Vision client
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS || !existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      throw new Error('Google Application Credentials file not found');
    }

    this.client = new ImageAnnotatorClient();
  }

  async compareTwoImages(imagePathOne: string, imagePathTwo: string): Promise<any> {
    // Detect faces in both images using Google Cloud Vision API
    const [resultOne] = await this.client.faceDetection(imagePathOne);
    const [resultTwo] = await this.client.faceDetection(imagePathTwo);

    const facesOne = resultOne.faceAnnotations || [];
    const facesTwo = resultTwo.faceAnnotations || [];

    if (facesOne.length === 0 || facesTwo.length === 0) {
      return { match: false, reason: 'No faces detected in one or both images.' };
    }

    // Extract face locations for the first detected face in each image
    const faceLocationOne = this.extractFaceLocation(facesOne[0]);
    const faceLocationTwo = this.extractFaceLocation(facesTwo[0]);

    // Prepare form data to send to the face-api microservice
    const formData = new FormData();
    formData.append('image1', fs.createReadStream(imagePathOne));
    formData.append('image2', fs.createReadStream(imagePathTwo));

    // Send the face locations and image files to the Node.js microservice for comparison
    try {
      const response = await axios.post('http://localhost:5000/compare-faces', formData, {
        headers: formData.getHeaders(),
      });

      return response.data;
    } catch (error) {
      console.error('Error during face comparison:', error);
      throw new Error('Error during face comparison');
    }
  }

  private extractFaceLocation(face: protos.google.cloud.vision.v1.IFaceAnnotation) {
    const boundingPoly = face.boundingPoly;
    const vertices = boundingPoly?.vertices;

    if (vertices && vertices.length === 4) {
      const top = vertices[0].y;
      const right = vertices[2].x;
      const bottom = vertices[2].y;
      const left = vertices[0].x;

      return { top, right, bottom, left };
    }

    throw new Error('Invalid face bounding box.');
  }
}

/*

// src/face/face.service.ts
import { Injectable } from '@nestjs/common';
import { ImageAnnotatorClient, protos } from '@google-cloud/vision';
import { existsSync } from 'fs';
import axios from 'axios';

@Injectable()
export class FaceService {
  private client: ImageAnnotatorClient;

  constructor() {
    // Initialize Google Cloud Vision client
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS || !existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      throw new Error('Google Application Credentials file not found');
    }

    this.client = new ImageAnnotatorClient();
  }

  async compareTwoImages(imagePathOne: string, imagePathTwo: string): Promise<any> {
    // Detect faces in both images using Google Cloud Vision API
    const [resultOne] = await this.client.faceDetection(imagePathOne);
    const [resultTwo] = await this.client.faceDetection(imagePathTwo);

    const facesOne = resultOne.faceAnnotations || [];
    const facesTwo = resultTwo.faceAnnotations || [];

    if (facesOne.length === 0 || facesTwo.length === 0) {
      return { match: false, reason: 'No faces detected in one or both images.' };
    }

    // Extract face locations for the first detected face in each image
    const faceLocationOne = this.extractFaceLocation(facesOne[0]);
    const faceLocationTwo = this.extractFaceLocation(facesTwo[0]);

    // Send the face locations and image paths to the Python microservice for comparison
    const response = await axios.post('http://localhost:5000/compare-faces', {
      image1_path: imagePathOne,
      image2_path: imagePathTwo,
      face_locations_one: faceLocationOne,
      face_locations_two: faceLocationTwo,
    });

    return response.data;
  }

  private extractFaceLocation(face: protos.google.cloud.vision.v1.IFaceAnnotation) {
    const boundingPoly = face.boundingPoly;
    const vertices = boundingPoly?.vertices;

    if (vertices && vertices.length === 4) {
      const top = vertices[0].y;
      const right = vertices[2].x;
      const bottom = vertices[2].y;
      const left = vertices[0].x;

      return { top, right, bottom, left };
    }

    throw new Error('Invalid face bounding box.');
  }
}


*/
