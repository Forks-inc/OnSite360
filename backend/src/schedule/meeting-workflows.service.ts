import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type MeetingAttendeeInput = {
  userId?: string;
  name: string;
  email?: string;
  company?: string;
  status?: string;
};

type MeetingActionItemInput = {
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate?: string;
  taskId?: string;
  status?: string;
};

type CreateMeetingInput = {
  projectId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  agenda?: string;
  minutes?: string;
  decisions?: string[];
  attendees?: MeetingAttendeeInput[];
  actionItems?: MeetingActionItemInput[];
  documentIds?: string[];
};

@Injectable()
export class MeetingWorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  createMeeting(input: CreateMeetingInput, userId: string) {
    return this.prisma.scheduleEvent.create({
      data: {
        projectId: input.projectId,
        title: input.title,
        description: input.description,
        type: 'MEETING',
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        location: input.location,
        status: 'Scheduled',
        priority: 'MEDIUM',
        createdById: userId,
        meetingMinute: {
          create: {
            projectId: input.projectId,
            agenda: input.agenda,
            minutes: input.minutes,
            decisions: input.decisions || [],
            createdById: userId,
            attendees: input.attendees?.length
              ? {
                  create: input.attendees.map((attendee) => ({
                    userId: attendee.userId,
                    name: attendee.name,
                    email: attendee.email,
                    company: attendee.company,
                    status: attendee.status || 'Invited',
                  })),
                }
              : undefined,
            actionItems: input.actionItems?.length
              ? {
                  create: input.actionItems.map((actionItem) => ({
                    title: actionItem.title,
                    description: actionItem.description,
                    assigneeId: actionItem.assigneeId,
                    dueDate: actionItem.dueDate
                      ? new Date(actionItem.dueDate)
                      : undefined,
                    taskId: actionItem.taskId,
                    status: actionItem.status || 'Open',
                  })),
                }
              : undefined,
            documents: input.documentIds?.length
              ? { connect: input.documentIds.map((id) => ({ id })) }
              : undefined,
          },
        },
      },
      include: {
        meetingMinute: {
          include: { attendees: true, actionItems: true, documents: true },
        },
        assignees: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  listMeetings(projectId?: string) {
    return this.prisma.scheduleEvent.findMany({
      where: {
        type: 'MEETING',
        ...(projectId ? { projectId } : {}),
      },
      orderBy: { startDate: 'desc' },
      include: {
        meetingMinute: {
          include: { attendees: true, actionItems: true, documents: true },
        },
      },
    });
  }

  async updateMeeting(id: string, input: Partial<CreateMeetingInput>) {
    const meeting = await this.prisma.scheduleEvent.findUnique({
      where: { id },
      include: { meetingMinute: true },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    return this.prisma.scheduleEvent.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        location: input.location,
        meetingMinute: {
          upsert: {
            create: {
              projectId: meeting.projectId,
              agenda: input.agenda,
              minutes: input.minutes,
              decisions: input.decisions || [],
            },
            update: {
              agenda: input.agenda,
              minutes: input.minutes,
              decisions: input.decisions,
            },
          },
        },
      },
      include: {
        meetingMinute: {
          include: { attendees: true, actionItems: true, documents: true },
        },
      },
    });
  }
}
