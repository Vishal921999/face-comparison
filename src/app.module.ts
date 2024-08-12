import { Module } from '@nestjs/common';
import { FaceModule } from './face/face.module';

@Module({
  imports: [FaceModule],
})
export class AppModule {}
