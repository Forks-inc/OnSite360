import { ProjectWorkflowService } from './project-workflows.service';

describe('ProjectWorkflowService', () => {
  it('creates punch list items and derives timecard totals from entries', async () => {
    const prisma = {
      punchListItem: {
        create: jest.fn().mockResolvedValue({
          id: 'pli-1',
          status: 'Open',
          title: 'Touch up lobby paint',
        }),
      },
      timecard: {
        create: jest.fn().mockResolvedValue({
          id: 'tc-1',
          status: 'Draft',
          totalRegularHours: 8,
          totalOvertimeHours: 2,
        }),
      },
    };
    const service = new ProjectWorkflowService(prisma as any);

    const punch = await service.createPunchListItem('project-1', {
      title: 'Touch up lobby paint',
      location: 'Lobby',
      discipline: 'Finishes',
    });
    const timecard = await service.createTimecard('project-1', {
      crewMemberId: 'crew-1',
      weekStart: '2026-06-01',
      entries: [
        { date: '2026-06-01', regularHours: 8, overtimeHours: 0 },
        { date: '2026-06-02', regularHours: 0, overtimeHours: 2 },
      ],
    });

    expect(punch.status).toBe('Open');
    expect(timecard.totalRegularHours).toBe(8);
    expect(timecard.totalOvertimeHours).toBe(2);
    expect(prisma.timecard.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          totalRegularHours: 8,
          totalOvertimeHours: 2,
        }),
      }),
    );
  });
});
