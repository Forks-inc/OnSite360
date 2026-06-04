import { CommunicationWorkflowService } from './communication-workflows.service';

describe('CommunicationWorkflowService', () => {
  it('keeps outbound email records when SMTP is not configured', async () => {
    const prisma = {
      emailMessage: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'email-1',
          subject: 'Original',
          from: 'owner@example.com',
          to: ['pm@example.com'],
          accountId: 'account-1',
          projectId: 'project-1',
          correspondenceId: null,
          threadId: null,
          rfiId: null,
          messageId: '<original@example.com>',
          references: [],
        }),
        create: jest.fn().mockResolvedValue({
          id: 'reply-1',
          status: 'Failed',
          direction: 'Outgoing',
        }),
      },
    };
    const previousSmtpHost = process.env.MAIL_SMTP_HOST;
    const previousMailFrom = process.env.MAIL_FROM;
    delete process.env.MAIL_SMTP_HOST;
    process.env.MAIL_FROM = 'pm@example.com';
    const service = new CommunicationWorkflowService(prisma as any);

    const result = await service.replyToEmail(
      'email-1',
      { body: 'Respuesta', to: ['owner@example.com'] },
      'user-1',
    );

    if (previousSmtpHost === undefined) {
      delete process.env.MAIL_SMTP_HOST;
    } else {
      process.env.MAIL_SMTP_HOST = previousSmtpHost;
    }
    if (previousMailFrom === undefined) {
      delete process.env.MAIL_FROM;
    } else {
      process.env.MAIL_FROM = previousMailFrom;
    }

    expect(result.status).toBe('Failed');
    expect(prisma.emailMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          direction: 'Outgoing',
          status: 'Failed',
          inReplyTo: '<original@example.com>',
        }),
      }),
    );
  });

  it('deduplicates synced inbox messages by provider message id', async () => {
    const prisma = {
      emailMessage: {
        findUnique: jest.fn().mockResolvedValue({ id: 'existing-email' }),
        create: jest.fn(),
      },
    };
    const service = new CommunicationWorkflowService(prisma as any);

    const result = await service.storeSyncedEmail('account-1', {
      messageId: '<already-seen@example.com>',
      subject: 'Already imported',
      from: 'field@example.com',
      to: ['pm@example.com'],
      body: 'Existing',
      receivedAt: new Date('2026-06-03T12:00:00Z'),
    });

    expect(result).toEqual({ status: 'skipped', id: 'existing-email' });
    expect(prisma.emailMessage.create).not.toHaveBeenCalled();
  });
});
