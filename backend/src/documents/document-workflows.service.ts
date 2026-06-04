import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type RecipientInput = {
  userId?: string;
  name: string;
  email?: string;
  company?: string;
};

type CreateTransmittalInput = {
  projectId: string;
  title: string;
  description?: string;
  dueDate?: string;
  notes?: string;
  documentIds?: string[];
  recipients?: RecipientInput[];
};

type UpdateTransmittalInput = Partial<CreateTransmittalInput> & {
  status?: string;
};

type UpsertSubmittalWorkflowInput = {
  projectId: string;
  documentId: string;
  status?: string;
  submittedById?: string;
  reviewerId?: string;
  dueDate?: string;
  response?: string;
  notes?: string;
};

@Injectable()
export class DocumentsWorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async createTransmittal(input: CreateTransmittalInput, userId?: string) {
    const sequence = await this.prisma.transmittal.count({
      where: { projectId: input.projectId },
    });
    const number = `TR-${String(sequence + 1).padStart(4, '0')}`;

    return this.prisma.transmittal.create({
      data: {
        projectId: input.projectId,
        number,
        title: input.title,
        description: input.description,
        status: 'Draft',
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        notes: input.notes,
        sentById: userId,
        documents: input.documentIds?.length
          ? { connect: input.documentIds.map((id) => ({ id })) }
          : undefined,
        recipients: input.recipients?.length
          ? {
              create: input.recipients.map((recipient) => ({
                userId: recipient.userId,
                name: recipient.name,
                email: recipient.email,
                company: recipient.company,
              })),
            }
          : undefined,
      },
      include: {
        documents: true,
        recipients: true,
        project: { select: { id: true, name: true } },
      },
    });
  }

  listTransmittals(projectId?: string) {
    return this.prisma.transmittal.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        documents: true,
        recipients: true,
        project: { select: { id: true, name: true } },
      },
    });
  }

  async getTransmittal(id: string) {
    const transmittal = await this.prisma.transmittal.findUnique({
      where: { id },
      include: {
        documents: true,
        recipients: true,
        project: { select: { id: true, name: true } },
      },
    });
    if (!transmittal) throw new NotFoundException('Transmittal not found');
    return transmittal;
  }

  async updateTransmittal(id: string, input: UpdateTransmittalInput) {
    await this.getTransmittal(id);
    return this.prisma.transmittal.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        status: input.status,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        notes: input.notes,
        documents: input.documentIds
          ? { set: input.documentIds.map((documentId) => ({ id: documentId })) }
          : undefined,
        recipients: input.recipients
          ? {
              deleteMany: {},
              create: input.recipients.map((recipient) => ({
                userId: recipient.userId,
                name: recipient.name,
                email: recipient.email,
                company: recipient.company,
              })),
            }
          : undefined,
      },
      include: { documents: true, recipients: true },
    });
  }

  async sendTransmittal(id: string, userId?: string) {
    await this.getTransmittal(id);
    return this.prisma.transmittal.update({
      where: { id },
      data: {
        status: 'Sent',
        sentAt: new Date(),
        sentById: userId,
      },
      include: { documents: true, recipients: true },
    });
  }

  async acknowledgeTransmittal(id: string, recipientId?: string) {
    await this.getTransmittal(id);
    if (recipientId) {
      await this.prisma.transmittalRecipient.update({
        where: { id: recipientId },
        data: { acknowledgedAt: new Date() },
      });
    }
    return this.prisma.transmittal.update({
      where: { id },
      data: {
        status: 'Acknowledged',
        acknowledgedAt: new Date(),
      },
      include: { documents: true, recipients: true },
    });
  }

  listSubmittalWorkflows(projectId?: string) {
    return this.prisma.submittalWorkflow.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { updatedAt: 'desc' },
      include: { document: true, project: { select: { id: true, name: true } } },
    });
  }

  upsertSubmittalWorkflow(input: UpsertSubmittalWorkflowInput) {
    return this.prisma.submittalWorkflow.upsert({
      where: { documentId: input.documentId },
      update: {
        status: input.status,
        submittedById: input.submittedById,
        reviewerId: input.reviewerId,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        response: input.response,
        notes: input.notes,
        submittedAt:
          input.status === 'Submitted' ? new Date() : undefined,
        reviewedAt:
          input.status === 'Approved' || input.status === 'Rejected'
            ? new Date()
            : undefined,
      },
      create: {
        projectId: input.projectId,
        documentId: input.documentId,
        status: input.status || 'Draft',
        submittedById: input.submittedById,
        reviewerId: input.reviewerId,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        response: input.response,
        notes: input.notes,
      },
      include: { document: true },
    });
  }
}
