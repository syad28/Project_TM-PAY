import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { PpobController } from './ppob.controller';
import { PpobService } from './ppob.service';
import tripayConfig from './config/tripay.config';

@Module({
  imports: [
    PrismaModule,
    HttpModule,
    ConfigModule.forFeature(tripayConfig),
  ],
  controllers: [PpobController],
  providers: [PpobService],
  exports: [PpobService],
})
export class PpobModule {}
