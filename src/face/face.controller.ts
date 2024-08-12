// src/face/face.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { FaceService } from './face.service';

@Controller('face')
export class FaceController {
  constructor(private readonly faceService: FaceService) {}

  @Post('compare')
  async compareFaces(@Body() body: { imagePathOne: string; imagePathTwo: string }) {
    const { imagePathOne, imagePathTwo } = body;
    const result = await this.faceService.compareTwoImages(imagePathOne, imagePathTwo);
    return result;
  }
}
