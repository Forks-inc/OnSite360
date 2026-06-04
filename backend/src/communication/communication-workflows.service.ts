import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

type RecipientInput = {
  userId?: string;
  name: string;
  email?: string;
  company?: string;
  role?: string;
};

type CreateCorrespondenceInput = {
  projectId: string;
  type?: string;
  direction?: string;
  status?: string;
  senderName?: string;
  senderEmail?: string;
  subject: string;
  body?: string;
  dueDate?: string;
  threadId?: string;
  rfiId?: string;
  emailMessageId?: string;
  documentIds?: string[];
  recipients?: RecipientInput[];
};

type SyncedEmailInput = {
  messageId: string;
  projectId?: string;
  correspondenceId?: string;
  threadId?: string;
  rfiId?: string;
  subject: string;
  from: string;
  to?: string[];
  cc?: string[];
  body?: string;
  bodyHtml?: string;
  receivedAt?: Date;
  references?: string[];
  inReplyTo?: string;
  attachments?: {
    filename: string;
    url?: string;
    mimeType?: string;
    size?: number;
  }[];
};

type ReplyEmailInput = {
  body: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
};

@Injectable()
export class CommunicationWorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async createCorrespondence(input: CreateCorrespondenceInput, userId?: string) {
    const sequence = await this.prisma.correspondence.count({
      where: { projectId: input.projectId },
    });
    const number = `COR-${String(sequence + 1).padStart(4, '0')}`;
    return this.prisma.correspondence.create({
      data: {
        projectId: input.projectId,
        number,
        type: input.type || 'General',
        direction: input.direction || 'Outgoing',
        status: input.status || 'Draft',
        senderName: input.senderName,
        senderEmail: input.senderEmail,
        subject: input.subject,
        body: input.body,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        threadId: input.threadId,
        rfiId: input.rfiId,
        emailMessageId: input.emailMessageId,
        createdById: userId,
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
                role: recipient.role,
              })),
            }
          : undefined,
      },
      include: { recipients: true, documents: true },
    });
  }

  listCorrespondence(projectId?: string) {
    return this.prisma.correspondence.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { recipients: true, documents: true, emailMessages: true },
    });
  }

  async updateCorrespondence(
    id: string,
    input: Partial<CreateCorrespondenceInput>,
  ) {
    return this.prisma.correspondence.update({
      where: { id },
      data: {
        type: input.type,
        direction: input.direction,
        status: input.status,
        senderName: input.senderName,
        senderEmail: input.senderEmail,
        subject: input.subject,
        body: input.body,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        sentAt: input.status === 'Sent' ? new Date() : undefined,
        receivedAt: input.status === 'Received' ? new Date() : undefined,
        closedAt: input.status === 'Closed' ? new Date() : undefined,
        threadId: input.threadId,
        rfiId: input.rfiId,
        emailMessageId: input.emailMessageId,
        documents: input.documentIds
          ? { set: input.documentIds.map((documentId) => ({ id: documentId })) }
          : undefined,
      },
      include: { recipients: true, documents: true, emailMessages: true },
    });
  }

  listEmailAccounts(userId?: string) {
    return this.prisma.emailAccount.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  createEmailAccount(input: {
    userId?: string;
    name: string;
    email: string;
    syncEnabled?: boolean;
  }) {
    return this.prisma.emailAccount.create({
      data: {
        userId: input.userId,
        name: input.name,
        email: input.email,
        imapHost: process.env.MAIL_IMAP_HOST || undefined,
        imapPort: process.env.MAIL_IMAP_PORT
          ? Number(process.env.MAIL_IMAP_PORT)
          : undefined,
        imapSecure: process.env.MAIL_IMAP_SECURE !== 'false',
        smtpHost: process.env.MAIL_SMTP_HOST || undefined,
        smtpPort: process.env.MAIL_SMTP_PORT
          ? Number(process.env.MAIL_SMTP_PORT)
          : undefined,
        smtpSecure: process.env.MAIL_SMTP_SECURE !== 'false',
        syncEnabled: input.syncEnabled ?? process.env.MAIL_SYNC_ENABLED === 'true',
        status: this.isInboxConfigured()
          ? 'Ready'
          : 'ConfigurationRequired',
      },
    });
  }

  listEmailMessages(filters: {
    projectId?: string;
    accountId?: string;
    correspondenceId?: string;
  }) {
    return this.prisma.emailMessage.findMany({
      where: {
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
        ...(filters.accountId ? { accountId: filters.accountId } : {}),
        ...(filters.correspondenceId
          ? { correspondenceId: filters.correspondenceId }
          : {}),
      },
      orderBy: [{ receivedAt: 'desc' }, { createdAt: 'desc' }],
      include: { attachments: true, correspondence: true, project: true },
    });
  }

  async storeSyncedEmail(accountId: string, input: SyncedEmailInput) {
    const existing = await this.prisma.emailMessage.findUnique({
      where: { messageId: input.messageId },
    });
    if (existing) return { status: 'skipped', id: existing.id };
    const created = await this.prisma.emailMessage.create({
      data: {
        accountId,
        projectId: input.projectId,
        correspondenceId: input.correspondenceId,
        threadId: input.threadId,
        rfiId: input.rfiId,
        direction: 'Incoming',
        status: 'Received',
        messageId: input.messageId,
        inReplyTo: input.inReplyTo,
        references: input.references || [],
        from: input.from,
        to: input.to || [],
        cc: input.cc || [],
        bcc: [],
        subject: input.subject,
        body: input.body,
        bodyHtml: input.bodyHtml,
        receivedAt: input.receivedAt || new Date(),
        attachments: input.attachments?.length
          ? {
              create: input.attachments.map((attachment) => ({
                filename: attachment.filename,
                url: attachment.url,
                mimeType: attachment.mimeType,
                size: attachment.size,
              })),
            }
          : undefined,
      },
      include: { attachments: true },
    });
    return { status: 'imported', id: created.id };
  }

  async syncInbox(accountId?: string) {
    if (!this.isInboxConfigured()) {
      return {
        configured: false,
        imported: 0,
        skipped: 0,
        message: 'Mail IMAP configuration is required before syncing inbox.',
      };
    }

    const accounts = await this.prisma.emailAccount.findMany({
      where: {
        ...(accountId ? { id: accountId } : {}),
        syncEnabled: true,
      },
    });

    if (accounts.length === 0) {
      return {
        configured: true,
        imported: 0,
        skipped: 0,
        message: 'No sync-enabled email accounts were found.',
      };
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const account of accounts) {
      const client = new ImapFlow({
        host: account.imapHost || process.env.MAIL_IMAP_HOST || '',
        port: account.imapPort || Number(process.env.MAIL_IMAP_PORT || 993),
        secure: account.imapSecure ?? process.env.MAIL_IMAP_SECURE !== 'false',
        auth: {
          user: process.env.MAIL_USERNAME || account.email,
          pass: process.env.MAIL_PASSWORD || '',
        },
        logger: false,
      });

      try {
        await client.connect();
        const lock = await client.getMailboxLock('INBOX');
        try {
          const since =
            account.lastSyncedAt ||
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          const searchResult = await client.search({ since }, { uid: true });
          const uids = Array.isArray(searchResult) ? searchResult : [];
          const targetUids = uids.slice(-100);

          if (targetUids.length === 0) {
            continue;
          }

          for await (const message of client.fetch(
            targetUids.join(','),
            {
              uid: true,
              source: true,
              internalDate: true,
            },
            { uid: true },
          )) {
            if (!message.source) continue;
            const parsed = await simpleParser(message.source);
            const result = await this.storeSyncedEmail(account.id, {
              messageId:
                parsed.messageId || `imap-${account.id}-${message.uid}`,
              subject: parsed.subject || '(no subject)',
              from: this.formatAddress(parsed.from) || account.email,
              to: this.formatAddressList(parsed.to),
              cc: this.formatAddressList(parsed.cc),
              body: parsed.text || undefined,
              bodyHtml:
                typeof parsed.html === 'string' ? parsed.html : undefined,
              receivedAt: this.toDate(
                parsed.date || message.internalDate || new Date(),
              ),
              inReplyTo: parsed.inReplyTo || undefined,
              references: this.formatReferences(parsed.references),
              attachments: parsed.attachments.map((attachment) => ({
                filename:
                  attachment.filename ||
                  attachment.contentId ||
                  `attachment-${randomUUID()}`,
                mimeType: attachment.contentType,
                size: attachment.size,
              })),
            });

            if (result.status === 'imported') imported += 1;
            if (result.status === 'skipped') skipped += 1;
          }
        } finally {
          lock.release();
        }

        await this.prisma.emailAccount.update({
          where: { id: account.id },
          data: { lastSyncedAt: new Date(), status: 'Ready' },
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown IMAP sync error';
        errors.push(`${account.email}: ${message}`);
        await this.prisma.emailAccount.update({
          where: { id: account.id },
          data: { status: 'Failed' },
        });
      } finally {
        await client.logout().catch(() => undefined);
      }
    }

    return {
      configured: true,
      imported,
      skipped,
      message: errors.length
        ? `Inbox sync completed with errors: ${errors.join('; ')}`
        : 'Inbox sync completed.',
    };
  }

  async replyToEmail(id: string, input: ReplyEmailInput, userId?: string) {
    const original = await this.prisma.emailMessage.findUnique({
      where: { id },
    });
    if (!original) throw new NotFoundException('Email message not found');
    return this.createOutboundEmail(
      {
        accountId: original.accountId,
        projectId: original.projectId,
        correspondenceId: original.correspondenceId,
        threadId: original.threadId,
        rfiId: original.rfiId,
        to: input.to?.length ? input.to : [original.from],
        cc: input.cc || [],
        bcc: input.bcc || [],
        subject: original.subject.startsWith('Re:')
          ? original.subject
          : `Re: ${original.subject}`,
        body: input.body,
        inReplyTo: original.messageId,
        references: [
          ...(original.references || []),
          ...(original.messageId ? [original.messageId] : []),
        ],
      },
      userId,
    );
  }

  async forwardEmail(id: string, input: ReplyEmailInput, userId?: string) {
    const original = await this.prisma.emailMessage.findUnique({
      where: { id },
    });
    if (!original) throw new NotFoundException('Email message not found');
    return this.createOutboundEmail(
      {
        accountId: original.accountId,
        projectId: original.projectId,
        correspondenceId: original.correspondenceId,
        threadId: original.threadId,
        rfiId: original.rfiId,
        to: input.to || [],
        cc: input.cc || [],
        bcc: input.bcc || [],
        subject: original.subject.startsWith('Fwd:')
          ? original.subject
          : `Fwd: ${original.subject}`,
        body: `${input.body}\n\n--- Forwarded message ---\n${original.body || ''}`,
      },
      userId,
    );
  }

  private async createOutboundEmail(
    input: {
      accountId?: string | null;
      projectId?: string | null;
      correspondenceId?: string | null;
      threadId?: string | null;
      rfiId?: string | null;
      to: string[];
      cc?: string[];
      bcc?: string[];
      subject: string;
      body: string;
      inReplyTo?: string | null;
      references?: string[];
    },
    userId?: string,
  ) {
    const configured = this.isSmtpConfigured();
    let sentAt: Date | undefined;
    let status = 'Failed';
    let providerMessageId: string | undefined;

    if (configured) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.MAIL_SMTP_HOST,
          port: Number(process.env.MAIL_SMTP_PORT || 465),
          secure: process.env.MAIL_SMTP_SECURE !== 'false',
          auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
          },
        });
        const info = await transporter.sendMail({
          from: process.env.MAIL_FROM || process.env.MAIL_USERNAME,
          to: input.to,
          cc: input.cc,
          bcc: input.bcc,
          subject: input.subject,
          text: input.body,
          inReplyTo: input.inReplyTo || undefined,
          references: input.references?.join(' '),
        });
        status = 'Sent';
        sentAt = new Date();
        providerMessageId = info.messageId;
      } catch {
        status = 'Failed';
      }
    }

    return this.prisma.emailMessage.create({
      data: {
        accountId: input.accountId || undefined,
        projectId: input.projectId || undefined,
        correspondenceId: input.correspondenceId || undefined,
        threadId: input.threadId || undefined,
        rfiId: input.rfiId || undefined,
        direction: 'Outgoing',
        status,
        messageId: providerMessageId || `local-${randomUUID()}`,
        from: process.env.MAIL_FROM || process.env.MAIL_USERNAME || 'not-configured',
        to: input.to,
        cc: input.cc || [],
        bcc: input.bcc || [],
        subject: input.subject,
        body: input.body,
        inReplyTo: input.inReplyTo || undefined,
        references: input.references || [],
        sentAt,
        createdById: userId,
      },
    });
  }

  private formatAddress(addressObject: unknown) {
    const list = this.formatAddressList(addressObject);
    return list[0] || '';
  }

  private formatAddressList(addressObject: unknown) {
    const value = (addressObject as { value?: { name?: string; address?: string }[] })
      ?.value;
    if (!Array.isArray(value)) return [];
    return value
      .map((address) =>
        address.name && address.address
          ? `${address.name} <${address.address}>`
          : address.address || '',
      )
      .filter(Boolean);
  }

  private formatReferences(references?: string[] | string) {
    if (!references) return [];
    if (Array.isArray(references)) return references.filter(Boolean);
    return references.split(/\s+/).filter(Boolean);
  }

  private toDate(value: Date | string) {
    return value instanceof Date ? value : new Date(value);
  }

  private isInboxConfigured() {
    return Boolean(
      process.env.MAIL_IMAP_HOST &&
        process.env.MAIL_USERNAME &&
        process.env.MAIL_PASSWORD,
    );
  }

  private isSmtpConfigured() {
    return Boolean(
      process.env.MAIL_SMTP_HOST &&
        process.env.MAIL_USERNAME &&
        process.env.MAIL_PASSWORD,
    );
  }
}
