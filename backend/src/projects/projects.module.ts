import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ProjectWorkflowService } from './project-workflows.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectWorkflowService],
})
export class ProjectsModule {}
