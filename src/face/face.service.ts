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
    try {
      console.log(`Comparing images: ${imagePathOne} and ${imagePathTwo}`);

      // Detect faces in both images using Google Cloud Vision API
      console.log('Detecting faces in the first image...');
      const [resultOne] = await this.client.faceDetection(imagePathOne);
      console.log('Detection result for first image:', resultOne);

      console.log('Detecting faces in the second image...');
      const [resultTwo] = await this.client.faceDetection(imagePathTwo);
      console.log('Detection result for second image:', resultTwo);

      const facesOne = resultOne.faceAnnotations || [];
      const facesTwo = resultTwo.faceAnnotations || [];

      if (facesOne.length === 0 || facesTwo.length === 0) {
        console.error('No faces detected in one or both images.');
        return { match: false, reason: 'No faces detected in one or both images.' };
      }

      console.log('Sending image paths to Python microservice for comparison...');
      // Send the image paths to the Python microservice for comparison
      const response = await axios.post('http://localhost:5000/compare-faces', {
        image1_path: imagePathOne,
        image2_path: imagePathTwo
      });

      console.log("Response from Python microservice:", response.data);  // Log the response data
      return response.data;
    } catch (error) {
      console.error("Error comparing images:", error);  // Log the error
      throw new Error(`Error comparing images: ${error.message}`);
    }
  }
}
