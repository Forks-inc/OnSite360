import { Module } from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { CommunicationController } from './communication.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CommunicationWorkflowService } from './communication-workflows.service';

@Module({
  imports: [PrismaModule],
  controllers: [CommunicationController],
  providers: [CommunicationService, CommunicationWorkflowService],
})
export class CommunicationModule {}
