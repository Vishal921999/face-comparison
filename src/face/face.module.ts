import { Module } from '@nestjs/common';
import { FaceService } from './face.service';
import { FaceController } from './face.controller';

@Module({
  controllers: [FaceController],
  providers: [FaceService],
})
export class FaceModule {}
