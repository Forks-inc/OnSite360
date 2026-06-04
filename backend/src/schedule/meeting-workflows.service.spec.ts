import { MeetingWorkflowService } from './meeting-workflows.service';

describe('MeetingWorkflowService', () => {
  it('creates a meeting event with minutes, attendees, and action items', async () => {
    const prisma = {
      scheduleEvent: {
        create: jest.fn().mockResolvedValue({
          id: 'meeting-event-1',
          type: 'MEETING',
          meetingMinute: { id: 'minutes-1' },
        }),
      },
    };
    const service = new MeetingWorkflowService(prisma as any);

    const result = await service.createMeeting(
      {
        projectId: 'project-1',
        title: 'Weekly coordination',
        startDate: '2026-06-04T15:00:00Z',
        endDate: '2026-06-04T16:00:00Z',
        agenda: 'Safety, schedule, RFIs',
        attendees: [{ userId: 'user-2', name: 'Foreman' }],
        actionItems: [{ title: 'Close drywall punch', assigneeId: 'user-3' }],
      },
      'user-1',
    );

    expect(result.type).toBe('MEETING');
    expect(prisma.scheduleEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'MEETING',
          meetingMinute: expect.objectContaining({
            create: expect.objectContaining({
              agenda: 'Safety, schedule, RFIs',
            }),
          }),
        }),
      }),
    );
  });
});
