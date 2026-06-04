import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { CommunicationService } from './communication.service';
import { CommunicationWorkflowService } from './communication-workflows.service';
import {
  CreateThreadDto,
  AddUserToThreadDto,
  CreateMessageDto,
  CreateRFIDto,
} from './dto/create-communication.dto';
import {
  UpdateThreadDto,
  UpdateMessageDto,
  UpdateRFIDto,
} from './dto/update-communication.dto';
import { ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../auth/auth.guard';

@Controller('communication')
export class CommunicationController {
  constructor(
    private readonly communicationService: CommunicationService,
    private readonly communicationWorkflowService: CommunicationWorkflowService,
  ) {}

  @Post('correspondence')
  @ApiBearerAuth()
  createCorrespondence(
    @Body() body: any,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationWorkflowService.createCorrespondence(
      body,
      req.user?.sub,
    );
  }

  @Get('correspondence')
  @ApiBearerAuth()
  listCorrespondence(@Query('projectId') projectId?: string) {
    return this.communicationWorkflowService.listCorrespondence(projectId);
  }

  @Patch('correspondence/:id')
  @ApiBearerAuth()
  updateCorrespondence(@Param('id') id: string, @Body() body: any) {
    return this.communicationWorkflowService.updateCorrespondence(id, body);
  }

  @Post('email/accounts')
  @ApiBearerAuth()
  createEmailAccount(
    @Body() body: any,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationWorkflowService.createEmailAccount({
      ...body,
      userId: body?.userId || req.user?.sub,
    });
  }

  @Get('email/accounts')
  @ApiBearerAuth()
  listEmailAccounts(@Request() req: AuthenticatedRequest) {
    return this.communicationWorkflowService.listEmailAccounts(req.user?.sub);
  }

  @Get('email/messages')
  @ApiBearerAuth()
  listEmailMessages(
    @Query('projectId') projectId?: string,
    @Query('accountId') accountId?: string,
    @Query('correspondenceId') correspondenceId?: string,
  ) {
    return this.communicationWorkflowService.listEmailMessages({
      projectId,
      accountId,
      correspondenceId,
    });
  }

  @Post('email/messages/:id/reply')
  @ApiBearerAuth()
  replyToEmail(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationWorkflowService.replyToEmail(
      id,
      body,
      req.user?.sub,
    );
  }

  @Post('email/messages/:id/forward')
  @ApiBearerAuth()
  forwardEmail(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationWorkflowService.forwardEmail(
      id,
      body,
      req.user?.sub,
    );
  }

  @Post('email/sync')
  @ApiBearerAuth()
  syncInbox(@Body() body: any) {
    return this.communicationWorkflowService.syncInbox(body?.accountId);
  }

  // Thread Routes
  @Post('threads')
  @ApiBearerAuth()
  createThread(
    @Body() createThreadDto: CreateThreadDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationService.createThread(
      createThreadDto,
      req.user.sub,
    );
  }

  @Get('threads')
  @ApiBearerAuth()
  getCurrentUserThreads(@Request() req: AuthenticatedRequest) {
    return this.communicationService.getCurrentUserThreads(req.user.sub);
  }

  @Get('threads/:id')
  @ApiBearerAuth()
  getThread(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.communicationService.getThread(id, req.user.sub);
  }

  @Patch('threads/:id')
  @ApiBearerAuth()
  updateThread(
    @Param('id') id: string,
    @Body() updateThreadDto: UpdateThreadDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationService.updateThread(
      id,
      updateThreadDto,
      req.user.sub,
    );
  }

  @Post('threads/:id/users')
  @ApiBearerAuth()
  addUserToThread(
    @Param('id') id: string,
    @Body() addUserDto: AddUserToThreadDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationService.addUserToThread(
      id,
      addUserDto,
      req.user.sub,
    );
  }

  @Delete('threads/:threadId/users/:userId')
  @ApiBearerAuth()
  removeUserFromThread(
    @Param('threadId') threadId: string,
    @Param('userId') userId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationService.removeUserFromThread(
      threadId,
      userId,
      req.user.sub,
    );
  }

  // Message Routes
  @Post('messages')
  @ApiBearerAuth()
  sendMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationService.sendMessage(
      createMessageDto,
      req.user.sub,
    );
  }

  @Post('messages/with-attachments')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Send message with file attachments',
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
        threadId: { type: 'string' },
        attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('attachments', 5, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/messages';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true, mode: 0o755 });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, uuidv4() + ext);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
      },
      fileFilter: (req, file, cb) => {
        // Accept images, documents, and common file types
        const allowed = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
    }),
  )
  async sendMessageWithAttachments(
    @Body() createMessageDto: CreateMessageDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
        fileIsRequired: false, // Attachments are optional
      }),
    )
    files: Express.Multer.File[],
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationService.sendMessageWithAttachments(
      createMessageDto,
      files || [],
      req.user.sub,
    );
  }

  @Get('threads/:id/messages')
  @ApiBearerAuth()
  getThreadMessages(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationService.getThreadMessages(id, req.user.sub);
  }

  @Patch('messages/:id')
  @ApiBearerAuth()
  updateMessage(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationService.updateMessage(
      id,
      updateMessageDto,
      req.user.sub,
    );
  }

  @Delete('messages/:id')
  @ApiBearerAuth()
  deleteMessage(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.communicationService.deleteMessage(id, req.user.sub);
  }

  // RFI Routes
  @Post('rfis')
  @ApiBearerAuth()
  createRFI(
    @Body() createRFIDto: CreateRFIDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationService.createRFI(createRFIDto, req.user.sub);
  }

  @Get('rfis')
  @ApiBearerAuth()
  getUserRFIs(@Request() req: AuthenticatedRequest) {
    return this.communicationService.getUserRFIs(req.user.sub);
  }

  @Patch('rfis/:id')
  @ApiBearerAuth()
  updateRFI(
    @Param('id') id: string,
    @Body() updateRFIDto: UpdateRFIDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationService.updateRFI(id, updateRFIDto, req.user.sub);
  }

  @Delete('rfis/:id')
  @ApiBearerAuth()
  deleteRFI(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.communicationService.deleteRFI(id, req.user.sub);
  }

  // Additional utility routes

  @Get('threads/:id/participants')
  @ApiBearerAuth()
  async getThreadParticipants(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    // This will return the thread with participants only
    const thread = await this.communicationService.getThread(id, req.user.sub);
    return {
      participants: thread.users,
    };
  }

  @Get('rfis/:id')
  @ApiBearerAuth()
  async getRFI(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.communicationService.getRFI(id, req.user.sub);
  }
}
