import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type PunchListInput = {
  title: string;
  description?: string;
  location?: string;
  discipline?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  dueDate?: string;
  issueId?: string;
  taskId?: string;
  documentIds?: string[];
};

type TimecardEntryInput = {
  date: string;
  regularHours?: number;
  overtimeHours?: number;
  breakHours?: number;
  notes?: string;
};

type CreateTimecardInput = {
  crewMemberId: string;
  weekStart: string;
  notes?: string;
  entries?: TimecardEntryInput[];
};

@Injectable()
export class ProjectWorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  createPunchListItem(projectId: string, input: PunchListInput) {
    return this.prisma.punchListItem.create({
      data: {
        projectId,
        title: input.title,
        description: input.description,
        location: input.location,
        discipline: input.discipline,
        status: input.status || 'Open',
        priority: input.priority || 'Medium',
        assigneeId: input.assigneeId,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        issueId: input.issueId,
        taskId: input.taskId,
        documents: input.documentIds?.length
          ? { connect: input.documentIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { documents: true, task: true, issue: true },
    });
  }

  listPunchListItems(projectId: string) {
    return this.prisma.punchListItem.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: { documents: true, task: true, issue: true },
    });
  }

  updatePunchListItem(id: string, input: Partial<PunchListInput>) {
    return this.prisma.punchListItem.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        location: input.location,
        discipline: input.discipline,
        status: input.status,
        priority: input.priority,
        assigneeId: input.assigneeId,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        closedAt: input.status === 'Closed' ? new Date() : undefined,
        issueId: input.issueId,
        taskId: input.taskId,
        documents: input.documentIds
          ? { set: input.documentIds.map((documentId) => ({ id: documentId })) }
          : undefined,
      },
      include: { documents: true, task: true, issue: true },
    });
  }

  createTimecard(projectId: string, input: CreateTimecardInput) {
    const entries = input.entries || [];
    const totalRegularHours = entries.reduce(
      (sum, entry) => sum + (entry.regularHours || 0),
      0,
    );
    const totalOvertimeHours = entries.reduce(
      (sum, entry) => sum + (entry.overtimeHours || 0),
      0,
    );
    const totalBreakHours = entries.reduce(
      (sum, entry) => sum + (entry.breakHours || 0),
      0,
    );

    return this.prisma.timecard.create({
      data: {
        projectId,
        crewMemberId: input.crewMemberId,
        weekStart: new Date(input.weekStart),
        status: 'Draft',
        totalRegularHours,
        totalOvertimeHours,
        totalBreakHours,
        notes: input.notes,
        entries: entries.length
          ? {
              create: entries.map((entry) => ({
                date: new Date(entry.date),
                regularHours: entry.regularHours || 0,
                overtimeHours: entry.overtimeHours || 0,
                breakHours: entry.breakHours || 0,
                notes: entry.notes,
              })),
            }
          : undefined,
      },
      include: { entries: true, crewMember: true },
    });
  }

  listTimecards(projectId: string) {
    return this.prisma.timecard.findMany({
      where: { projectId },
      orderBy: { weekStart: 'desc' },
      include: { entries: true, crewMember: true },
    });
  }

  updateTimecardStatus(
    id: string,
    status: 'Submitted' | 'Approved' | 'Rejected' | 'Draft',
    userId?: string,
    rejectionReason?: string,
  ) {
    return this.prisma.timecard.update({
      where: { id },
      data: {
        status,
        submittedById: status === 'Submitted' ? userId : undefined,
        submittedAt: status === 'Submitted' ? new Date() : undefined,
        approvedById: status === 'Approved' ? userId : undefined,
        approvedAt: status === 'Approved' ? new Date() : undefined,
        rejectionReason: status === 'Rejected' ? rejectionReason : undefined,
      },
      include: { entries: true, crewMember: true },
    });
  }

  async exportTimecardsCsv(projectId: string) {
    const timecards = await this.listTimecards(projectId);
    const rows = [
      'Crew Member,Week Start,Status,Regular Hours,Overtime Hours,Break Hours,Notes',
      ...timecards.map((timecard) =>
        [
          timecard.crewMember?.name || '',
          timecard.weekStart.toISOString().slice(0, 10),
          timecard.status,
          timecard.totalRegularHours,
          timecard.totalOvertimeHours,
          timecard.totalBreakHours,
          JSON.stringify(timecard.notes || ''),
        ].join(','),
      ),
    ];
    return rows.join('\n');
  }
}
