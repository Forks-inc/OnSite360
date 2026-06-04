import { DocumentsWorkflowService } from './document-workflows.service';

describe('DocumentsWorkflowService', () => {
  it('creates project-scoped transmittal numbers and sends transmittals', async () => {
    const prisma = {
      transmittal: {
        count: jest.fn().mockResolvedValue(2),
        create: jest.fn().mockResolvedValue({ id: 'tr-1', number: 'TR-0003' }),
        findUnique: jest.fn().mockResolvedValue({ id: 'tr-1', number: 'TR-0003' }),
        update: jest.fn().mockResolvedValue({ id: 'tr-1', status: 'Sent' }),
      },
    };
    const service = new DocumentsWorkflowService(prisma as any);

    const created = await service.createTransmittal(
      {
        projectId: 'project-1',
        title: 'Weekly drawing package',
        documentIds: ['doc-1', 'doc-2'],
        recipients: [{ name: 'Owner', email: 'owner@example.com' }],
      },
      'user-1',
    );
    const sent = await service.sendTransmittal('tr-1', 'user-1');

    expect(created.number).toBe('TR-0003');
    expect(prisma.transmittal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          number: 'TR-0003',
          status: 'Draft',
        }),
      }),
    );
    expect(sent.status).toBe('Sent');
    expect(prisma.transmittal.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'Sent',
          sentAt: expect.any(Date),
        }),
      }),
    );
  });
});
