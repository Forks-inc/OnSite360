import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create permissions data from the provided JSON
  const permissionsData = [
    { pageId: 'dashboard', pageName: 'Dashboard' },
    { pageId: 'user-management', pageName: 'User Management' },
    { pageId: 'role-management', pageName: 'Role Management' },
    { pageId: 'permission-management', pageName: 'Permission Management' },
    { pageId: 'integrations', pageName: 'Integrations' },
    { pageId: 'system-logs', pageName: 'System Logs' },
    { pageId: 'project-oversight', pageName: 'Project Oversight' },
    { pageId: 'employee-management', pageName: 'Employee Management' },
    { pageId: 'communication', pageName: 'Communication' },
    { pageId: 'document-management', pageName: 'Document Management' },
    { pageId: 'schedule-management', pageName: 'Schedule Management' },
    { pageId: 'task-management', pageName: 'Task Management' },
    { pageId: 'risk-management', pageName: 'Risk Management' },
    { pageId: 'notifications', pageName: 'Notifications' },
    { pageId: 'workforce-management', pageName: 'Workforce Management' },
    { pageId: 'daily-logs-management', pageName: 'Daily Logs Management' },
    { pageId: 'issue-reporting', pageName: 'Issue Reporting' },
    { pageId: 'copilot', pageName: 'Copilot' },
  ];

  // Create permissions in the database
  for (const permission of permissionsData) {
    await prisma.permission.upsert({
      where: { pageId: permission.pageId },
      update: { pageName: permission.pageName },
      create: {
        pageId: permission.pageId,
        pageName: permission.pageName,
      },
    });
  }
  console.log('Created or verified all system permissions.');

  // Create system admin role
  const adminRole = await prisma.role.upsert({
    where: { name: 'System Admin' },
    update: {},
    create: {
      name: 'System Admin',
    },
  });

  // Get all permissions
  const allPermissions = await prisma.permission.findMany();

  // Create RolePermission entries for each permission (with admin level access)
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: { level: 3 },
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
        level: 3, // Admin level access
      },
    });
  }
  console.log(`Verified Admin RolePermissions for role: ${adminRole.name}`);

  // Create a system admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@onsite360.com' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@onsite360.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      roleId: adminRole.id,
    },
  });
  console.log(`Created or verified admin user: ${adminUser.email}`);

  // Create two realistic projects
  const project1 = await prisma.project.create({
    data: {
      name: 'OnSite360 Office Tower',
      description: 'Construction of a modern 15-story commercial office building featuring state-of-the-art sustainability systems.',
      type: 'Commercial',
      budget: 8500000,
      costToDate: 1250000,
      squareFeet: 120000,
      location: '550 Madison Ave, New York, NY',
      coordinates: { lat: 40.7619, lng: -73.9729 },
      startDate: new Date('2026-01-15'),
      endDate: new Date('2027-08-30'),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Westside Residential Complex',
      description: 'A multi-family residential housing project with 45 premium apartment units and community facilities.',
      type: 'Residential',
      budget: 3400000,
      costToDate: 450000,
      squareFeet: 65000,
      location: '120 West Side Ave, Jersey City, NJ',
      coordinates: { lat: 40.7241, lng: -74.0805 },
      startDate: new Date('2026-03-01'),
      endDate: new Date('2027-05-15'),
    },
  });
  console.log(`Created projects: "${project1.name}" and "${project2.name}"`);

  // ASSIGN adminUser to both projects (CRITICAL: this makes them visible in the dashboard/daily logs)
  await prisma.userProject.create({
    data: {
      userId: adminUser.id,
      projectId: project1.id,
      projectRole: 'Project Manager',
      accessLevel: 3,
    },
  });

  await prisma.userProject.create({
    data: {
      userId: adminUser.id,
      projectId: project2.id,
      projectRole: 'Supervisor',
      accessLevel: 3,
    },
  });
  console.log(`Assigned admin user ${adminUser.email} to both projects.`);

  // Create Crew Members
  const crew1 = await prisma.crewMember.create({
    data: {
      name: 'John Doe',
      role: 'Foreman',
      phone: '555-0199',
      email: 'john.doe@onsite360-crew.com',
      skills: ['Framing', 'Concrete', 'Blueprint Reading'],
      isActive: true,
      hireDate: new Date('2024-05-10'),
    },
  });

  const crew2 = await prisma.crewMember.create({
    data: {
      name: 'Jane Smith',
      role: 'Electrician',
      phone: '555-0188',
      email: 'jane.smith@onsite360-crew.com',
      skills: ['High Voltage Wiring', 'Conduit Bending', 'Safety Standards'],
      isActive: true,
      hireDate: new Date('2025-01-12'),
    },
  });

  const crew3 = await prisma.crewMember.create({
    data: {
      name: 'Bob Johnson',
      role: 'Plumber',
      phone: '555-0177',
      email: 'bob.johnson@onsite360-crew.com',
      skills: ['Copper Pipe Soldering', 'Drainage Systems', 'HVAC'],
      isActive: true,
      hireDate: new Date('2024-11-20'),
    },
  });

  const crew4 = await prisma.crewMember.create({
    data: {
      name: 'Alice Williams',
      role: 'Carpenter',
      phone: '555-0166',
      email: 'alice.williams@onsite360-crew.com',
      skills: ['Finish Carpentry', 'Cabinetry', 'Drywall'],
      isActive: true,
      hireDate: new Date('2025-03-01'),
    },
  });
  console.log('Created crew members.');

  // Assign Crew Members to Project 1
  await prisma.crewAssignment.createMany({
    data: [
      { projectId: project1.id, crewMemberId: crew1.id, notes: 'Assigned as primary project foreman.' },
      { projectId: project1.id, crewMemberId: crew2.id, notes: 'Electrical subcontractor lead.' },
      { projectId: project1.id, crewMemberId: crew3.id, notes: 'Plumbing contractor.' },
      { projectId: project1.id, crewMemberId: crew4.id, notes: 'Carpentry and framing subcontractor.' },
    ],
  });
  console.log('Assigned crew members to OnSite360 Office Tower project.');

  // Create Tasks for Project 1
  const task1 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Foundation Excavation & Soil Prep',
      description: 'Clear site, perform heavy soil excavation, and pour mud slab for foundation work.',
      status: 'Completed',
      priority: 'High',
      progress: 100,
      estimatedHours: 120,
      actualHours: 115,
      startedAt: new Date('2026-01-20'),
      completedAt: new Date('2026-02-10'),
      dueDate: new Date('2026-02-15'),
    },
  });

  const task2 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Concrete Pouring - Level 1 & 2 Slabs',
      description: 'Install formwork, place rebar reinforcement, and pour structural concrete for the first two floors.',
      status: 'In Progress',
      priority: 'Critical',
      progress: 65,
      estimatedHours: 200,
      actualHours: 140,
      startedAt: new Date('2026-02-12'),
      dueDate: new Date('2026-03-15'),
    },
  });

  const task3 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Structural Steel Framing (Floors 1-5)',
      description: 'Erect primary steel structural columns, girders, and beams for the first five floors.',
      status: 'Pending',
      priority: 'High',
      progress: 0,
      estimatedHours: 350,
      dueDate: new Date('2026-04-30'),
    },
  });

  const task4 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Plumbing Rough-in Level 1',
      description: 'Lay out and install main water lines, drainage, and vents in the concrete slab of Level 1.',
      status: 'Pending',
      priority: 'Medium',
      progress: 0,
      estimatedHours: 80,
      dueDate: new Date('2026-03-25'),
    },
  });
  console.log('Created tasks for OnSite360 Office Tower project.');

  // Create Daily Logs for the last 3 days
  const today = new Date();
  const oneDayAgo = new Date();
  oneDayAgo.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(today.getDate() - 2);

  // Day 1 Daily Log
  const log1 = await prisma.dailyLog.create({
    data: {
      projectId: project1.id,
      date: twoDaysAgo,
      weather: 'Sunny',
      temperature: '65-72°F',
      workHours: 8,
      workersPresent: 4,
      summary: 'Completed formwork installation and began concrete reinforcement (rebar) placement for Level 1 Floor.',
      loggedById: adminUser.id,
      activities: {
        create: [
          {
            activity: 'Reinforcing bar (rebar) tying on Level 1 slab.',
            location: 'Level 1 Center',
            status: 'COMPLETED',
            progress: 100,
            notes: 'Successfully passed reinforcing inspection. All ties verified.',
            crewMembers: { connect: [{ id: crew1.id }, { id: crew4.id }] },
          },
        ],
      },
    },
  });

  // Day 2 Daily Log
  const log2 = await prisma.dailyLog.create({
    data: {
      projectId: project1.id,
      date: oneDayAgo,
      weather: 'Rainy',
      temperature: '58-62°F',
      workHours: 6.5,
      workersPresent: 3,
      summary: 'Concrete truck deliveries arrived. Poured Level 1 structural slab. Work cut short due to afternoon thunder storms.',
      loggedById: adminUser.id,
      activities: {
        create: [
          {
            activity: 'Level 1 Concrete Slab Pouring',
            location: 'Level 1 Slab',
            status: 'IN_PROGRESS',
            progress: 80,
            notes: 'Poured 120 cubic yards of concrete. Rainy weather delayed final finishing.',
            crewMembers: { connect: [{ id: crew1.id }, { id: crew3.id }, { id: crew4.id }] },
          },
        ],
      },
    },
  });

  // Day 3 Daily Log (Today)
  const log3 = await prisma.dailyLog.create({
    data: {
      projectId: project1.id,
      date: today,
      weather: 'Cloudy',
      temperature: '60-66°F',
      workHours: 8,
      workersPresent: 4,
      summary: 'Concrete curing inspection and quality test completed. Formwork stripping on Level 1 started. Plumber began rough-in layouts.',
      loggedById: adminUser.id,
      activities: {
        create: [
          {
            activity: 'Stripping concrete forms & curing monitoring',
            location: 'Level 1 Columns',
            status: 'IN_PROGRESS',
            progress: 50,
            notes: 'Concrete strength test passed at 3000 PSI target.',
            crewMembers: { connect: [{ id: crew1.id }, { id: crew4.id }] },
          },
          {
            activity: 'Level 1 Plumbing Line layout and measurement',
            location: 'Level 1 Floor',
            status: 'IN_PROGRESS',
            progress: 25,
            notes: 'Marking locations for bathroom drainage lines.',
            crewMembers: { connect: [{ id: crew3.id }] },
          },
        ],
      },
    },
  });
  console.log('Created daily logs and daily activities.');

  // Create Project Attendance Records
  // Day 1 Attendance
  const attendance1 = await prisma.projectAttendance.create({
    data: {
      projectId: project1.id,
      date: twoDaysAgo,
      markedById: adminUser.id,
      dayType: 'WORKDAY',
      isWorkDay: true,
      notes: 'Excellent weather. All contractors present on time.',
    },
  });

  await prisma.attendanceRecord.createMany({
    data: [
      { projectAttendanceId: attendance1.id, crewMemberId: crew1.id, status: 'PRESENT', totalHours: 8 },
      { projectAttendanceId: attendance1.id, crewMemberId: crew2.id, status: 'PRESENT', totalHours: 8 },
      { projectAttendanceId: attendance1.id, crewMemberId: crew3.id, status: 'PRESENT', totalHours: 8 },
      { projectAttendanceId: attendance1.id, crewMemberId: crew4.id, status: 'PRESENT', totalHours: 8 },
    ],
  });

  // Day 2 Attendance (Rainy day - late / half day)
  const attendance2 = await prisma.projectAttendance.create({
    data: {
      projectId: project1.id,
      date: oneDayAgo,
      markedById: adminUser.id,
      dayType: 'WEATHER_DELAY',
      isWorkDay: true,
      notes: 'Rain started around 2:00 PM. Pours completed before storm, but site closed early due to lightning risk.',
    },
  });

  await prisma.attendanceRecord.createMany({
    data: [
      { projectAttendanceId: attendance2.id, crewMemberId: crew1.id, status: 'PRESENT', totalHours: 6.5 },
      { projectAttendanceId: attendance2.id, crewMemberId: crew2.id, status: 'ABSENT', notes: 'Excused absence - called off due to rain.' },
      { projectAttendanceId: attendance2.id, crewMemberId: crew3.id, status: 'PRESENT', totalHours: 6.5 },
      { projectAttendanceId: attendance2.id, crewMemberId: crew4.id, status: 'PRESENT', totalHours: 6.5 },
    ],
  });

  // Day 3 Attendance (Today)
  const attendance3 = await prisma.projectAttendance.create({
    data: {
      projectId: project1.id,
      date: today,
      markedById: adminUser.id,
      dayType: 'WORKDAY',
      isWorkDay: true,
      notes: 'All workers checked in at 7:00 AM.',
    },
  });

  await prisma.attendanceRecord.createMany({
    data: [
      { projectAttendanceId: attendance3.id, crewMemberId: crew1.id, status: 'PRESENT', totalHours: 8 },
      { projectAttendanceId: attendance3.id, crewMemberId: crew2.id, status: 'PRESENT', totalHours: 8 },
      { projectAttendanceId: attendance3.id, crewMemberId: crew3.id, status: 'PRESENT', totalHours: 8 },
      { projectAttendanceId: attendance3.id, crewMemberId: crew4.id, status: 'PRESENT', totalHours: 8 },
    ],
  });
  console.log('Created project attendance and daily records.');

  // Create Issues
  await prisma.issue.create({
    data: {
      projectId: project1.id,
      title: 'Level 1 Concrete Curing Moisture Levels',
      description: 'Moisture level reading on Level 1 slab is higher than specifications allow for flooring adhesive application. Needs monitoring.',
      category: 'Quality',
      severity: 'Medium',
      status: 'Open',
      location: 'Level 1 Center Slab',
      reportedBy: 'System Admin',
      reportedById: adminUser.id,
      dueDate: new Date(new Date().setDate(today.getDate() + 7)),
    },
  });

  await prisma.issue.create({
    data: {
      projectId: project1.id,
      title: 'Safety Guardrail missing on Level 2 scaffold',
      description: 'Scaffolding on the north facade of Level 2 does not have proper safety handrails/kickboards. Safety hazard.',
      category: 'Safety',
      severity: 'Critical',
      status: 'Resolved',
      location: 'North Facade Level 2',
      reportedBy: 'John Doe',
      reportedById: adminUser.id,
      resolvedAt: today,
      resolution: 'Wood guardrail installed immediately. Safety Inspector cleared it for use.',
    },
  });
  console.log('Created project issues.');

  // Create Documents
  await prisma.document.create({
    data: {
      projectId: project1.id,
      name: 'Architectural_Drawings_A-102.pdf',
      url: '/uploads/architectural_drawing_a102.pdf',
      type: 'Drawing',
      category: 'Architectural',
      version: '1.2',
      size: 4500000,
      mimeType: 'application/pdf',
      uploadedById: adminUser.id,
      description: 'Level 1 & Level 2 floor plans and partitions layout.',
      tags: ['blueprint', 'drawings', 'level1'],
    },
  });

  await prisma.document.create({
    data: {
      projectId: project1.id,
      name: 'Concrete_Quality_Inspection_Report.pdf',
      url: '/uploads/inspection_report_concrete_june2.pdf',
      type: 'Report',
      category: 'Quality Control',
      version: '1.0',
      size: 1200000,
      mimeType: 'application/pdf',
      uploadedById: adminUser.id,
      description: 'Passed test of compressive strength of Level 1 slab concrete cylinders (passed at 3200 PSI).',
      tags: ['concrete', 'inspection', 'quality'],
    },
  });
  console.log('Created project documents.');

  // Create Schedule Events
  await prisma.scheduleEvent.create({
    data: {
      projectId: project1.id,
      title: 'Structural Steel Framing Delivery',
      description: 'Heavy transport trucks arriving on site with column and beam shipments. Require staging area clearance.',
      type: 'Delivery',
      startDate: new Date(new Date().setDate(today.getDate() + 2)),
      endDate: new Date(new Date().setDate(today.getDate() + 2)),
      allDay: true,
      location: 'Front staging yard',
      status: 'Scheduled',
      priority: 'High',
      color: '#f59e0b',
      createdById: adminUser.id,
    },
  });

  await prisma.scheduleEvent.create({
    data: {
      projectId: project1.id,
      title: 'Weekly Contractor Alignment Meeting',
      description: 'Review project progress, coordinate trades, resolve issues, and align on upcoming weekly sprints.',
      type: 'Meeting',
      startDate: new Date(new Date().setDate(today.getDate() + 4)),
      endDate: new Date(new Date().setDate(today.getDate() + 4)),
      allDay: false,
      location: 'Site HQ Office trailer',
      status: 'Scheduled',
      priority: 'Medium',
      color: '#3b82f6',
      createdById: adminUser.id,
    },
  });
  console.log('Created schedule events.');

  // Create Expenses
  await prisma.expense.create({
    data: {
      projectId: project1.id,
      amount: 14500.5,
      currency: 'USD',
      vendor: 'Redi-Mix Concrete Suppliers Inc',
      category: 'Materials',
      date: twoDaysAgo,
      notes: '120 cubic yards of concrete mix for Level 1 structural slab pour.',
      createdById: adminUser.id,
      isApproved: true,
    },
  });

  await prisma.expense.create({
    data: {
      projectId: project1.id,
      amount: 3200,
      currency: 'USD',
      vendor: 'ProSafety Rentals Corp',
      category: 'Equipment',
      date: oneDayAgo,
      notes: 'Rental of perimeter guardrails and safety fencing for Level 1 & 2 decks.',
      createdById: adminUser.id,
      isApproved: true,
    },
  });
  console.log('Created expenses.');

  console.log('🌱  Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
