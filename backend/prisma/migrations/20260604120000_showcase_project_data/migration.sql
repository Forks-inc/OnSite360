-- Showcase data for exercising all main OnSite360 modules with one project.

INSERT INTO "Role" ("id", "name", "createdAt", "updatedAt")
VALUES ('showcase-role-admin', 'Showcase Admin', NOW(), NOW())
ON CONFLICT ("name") DO UPDATE SET "updatedAt" = NOW();

INSERT INTO "Permission" ("id", "pageId", "pageName", "description", "components", "createdAt", "updatedAt")
VALUES
  ('showcase-permission-dashboard', 'dashboard', 'Dashboard', 'Showcase dashboard access', ARRAY['overview','reports','map'], NOW(), NOW()),
  ('showcase-permission-user-management', 'user-management', 'User Management', 'Showcase users access', ARRAY['users'], NOW(), NOW()),
  ('showcase-permission-role-management', 'role-management', 'Role Management', 'Showcase roles access', ARRAY['roles','components'], NOW(), NOW()),
  ('showcase-permission-permission-management', 'permission-management', 'Permission Management', 'Showcase permissions access', ARRAY['permissions','components'], NOW(), NOW()),
  ('showcase-permission-integrations', 'integrations', 'Integrations', 'Showcase integrations access', ARRAY['integrations'], NOW(), NOW()),
  ('showcase-permission-system-logs', 'system-logs', 'System Logs', 'Showcase system logs access', ARRAY['logs','monitoring'], NOW(), NOW()),
  ('showcase-permission-project-oversight', 'project-oversight', 'Project Oversight', 'Showcase project access', ARRAY['projects','statistics'], NOW(), NOW()),
  ('showcase-permission-employee-management', 'employee-management', 'Employee Management', 'Showcase employee access', ARRAY['employees','assignments'], NOW(), NOW()),
  ('showcase-permission-communication', 'communication', 'Communication', 'Showcase communication access', ARRAY['threads','rfis','correspondence','email-inbox'], NOW(), NOW()),
  ('showcase-permission-document-management', 'document-management', 'Document Management', 'Showcase document access', ARRAY['documents','drawings','specifications','photos','submittals','transmittals'], NOW(), NOW()),
  ('showcase-permission-schedule-management', 'schedule-management', 'Schedule Management', 'Showcase schedule access', ARRAY['calendar','meetings','gantt','logs'], NOW(), NOW()),
  ('showcase-permission-task-management', 'task-management', 'Task Management', 'Showcase task access', ARRAY['tasks','comments','attachments'], NOW(), NOW()),
  ('showcase-permission-risk-management', 'risk-management', 'Risk Management', 'Showcase risk access', ARRAY['expenses','risk'], NOW(), NOW()),
  ('showcase-permission-notifications', 'notifications', 'Notifications', 'Showcase notifications access', ARRAY['notifications'], NOW(), NOW()),
  ('showcase-permission-workforce-management', 'workforce-management', 'Workforce Management', 'Showcase workforce access', ARRAY['crew','attendance','timecards','analytics'], NOW(), NOW()),
  ('showcase-permission-daily-logs-management', 'daily-logs-management', 'Daily Logs Management', 'Showcase daily logs access', ARRAY['daily-logs','activities','photos','maps'], NOW(), NOW()),
  ('showcase-permission-issue-reporting', 'issue-reporting', 'Issue Reporting', 'Showcase issue access', ARRAY['issues','punch-list','analytics'], NOW(), NOW()),
  ('showcase-permission-copilot', 'copilot', 'Copilot', 'Showcase copilot access', ARRAY['chat','documents','reports'], NOW(), NOW())
ON CONFLICT ("pageId") DO UPDATE SET
  "pageName" = EXCLUDED."pageName",
  "description" = EXCLUDED."description",
  "components" = EXCLUDED."components",
  "updatedAt" = NOW();

INSERT INTO "RolePermission" ("id", "roleId", "permissionId", "level", "availableComponents", "createdAt", "updatedAt")
SELECT
  'showcase-rp-' || p."pageId",
  'showcase-role-admin',
  p."id",
  3,
  p."components",
  NOW(),
  NOW()
FROM "Permission" p
WHERE p."pageId" IN (
  'dashboard','user-management','role-management','permission-management','integrations','system-logs',
  'project-oversight','employee-management','communication','document-management','schedule-management',
  'task-management','risk-management','notifications','workforce-management','daily-logs-management',
  'issue-reporting','copilot'
)
ON CONFLICT ("roleId", "permissionId") DO UPDATE SET
  "level" = 3,
  "availableComponents" = EXCLUDED."availableComponents",
  "updatedAt" = NOW();

INSERT INTO "User" ("id", "firstName", "lastName", "email", "password", "roleId", "createdAt", "updatedAt")
VALUES
  ('showcase-user-admin', 'Showcase', 'Admin', 'showcase@onsite360.com', '$2b$10$oN7UYP68CrMfxhi0y7wrj.SsfwAL6vD3e5Xd5QIozDQsH0BuFeA8i', 'showcase-role-admin', NOW(), NOW()),
  ('showcase-user-owner', 'Maya', 'Owner', 'maya.owner@example.com', '$2b$10$oN7UYP68CrMfxhi0y7wrj.SsfwAL6vD3e5Xd5QIozDQsH0BuFeA8i', 'showcase-role-admin', NOW(), NOW()),
  ('showcase-user-superintendent', 'Carlos', 'Reyes', 'carlos.reyes@example.com', '$2b$10$oN7UYP68CrMfxhi0y7wrj.SsfwAL6vD3e5Xd5QIozDQsH0BuFeA8i', 'showcase-role-admin', NOW(), NOW())
ON CONFLICT ("email") DO UPDATE SET
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  "roleId" = EXCLUDED."roleId",
  "updatedAt" = NOW();

INSERT INTO "Project" (
  "id", "name", "description", "type", "budget", "costToDate", "squareFeet", "location",
  "coordinates", "logoUrl", "featuredImageUrl", "startDate", "endDate", "createdAt", "updatedAt"
)
VALUES (
  'showcase-project-highrise',
  'Showcase Medical Office Buildout',
  'Demo project with phases, schedule, documents, RFIs, correspondence, workforce, daily logs, punch list, timecards, expenses and notifications.',
  'Commercial',
  12500000,
  3825000,
  96000,
  '2100 Innovation Dr, Austin, TX',
  '{"lat":30.2672,"lng":-97.7431}'::jsonb,
  '/demo/showcase-logo.png',
  '/demo/showcase-medical-office.jpg',
  '2026-06-01',
  '2027-02-15',
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "budget" = EXCLUDED."budget",
  "costToDate" = EXCLUDED."costToDate",
  "squareFeet" = EXCLUDED."squareFeet",
  "location" = EXCLUDED."location",
  "coordinates" = EXCLUDED."coordinates",
  "startDate" = EXCLUDED."startDate",
  "endDate" = EXCLUDED."endDate",
  "updatedAt" = NOW();

INSERT INTO "UserProject" ("id", "userId", "projectId", "projectRole", "accessLevel", "assignedDate", "isActive", "workSchedule", "notes", "createdAt", "updatedAt")
VALUES
  ('showcase-user-project-admin', 'showcase-user-admin', 'showcase-project-highrise', 'Project Manager', 3, '2026-06-01', true, 'Full-time', 'Primary showcase user.', NOW(), NOW()),
  ('showcase-user-project-owner', 'showcase-user-owner', 'showcase-project-highrise', 'Owner Representative', 2, '2026-06-01', true, 'Weekly reviews', 'Receives correspondence and meeting updates.', NOW(), NOW()),
  ('showcase-user-project-super', 'showcase-user-superintendent', 'showcase-project-highrise', 'Superintendent', 3, '2026-06-01', true, 'Full-time', 'Field operations lead.', NOW(), NOW())
ON CONFLICT ("userId", "projectId") DO UPDATE SET
  "projectRole" = EXCLUDED."projectRole",
  "accessLevel" = EXCLUDED."accessLevel",
  "isActive" = true,
  "updatedAt" = NOW();

INSERT INTO "CrewMember" ("id", "name", "role", "phone", "email", "skills", "isActive", "hireDate", "createdAt", "updatedAt")
VALUES
  ('showcase-crew-foreman', 'Luis Hernandez', 'Foreman', '555-2201', 'luis.hernandez@showcase.local', ARRAY['Safety','Concrete','Coordination'], true, '2024-04-10', NOW(), NOW()),
  ('showcase-crew-electrician', 'Ana Torres', 'Electrician', '555-2202', 'ana.torres@showcase.local', ARRAY['MEP','Conduit','Panel rough-in'], true, '2024-08-18', NOW(), NOW()),
  ('showcase-crew-plumber', 'Miguel Santos', 'Plumber', '555-2203', 'miguel.santos@showcase.local', ARRAY['Medical gas','Copper','Drainage'], true, '2025-01-12', NOW(), NOW()),
  ('showcase-crew-carpenter', 'Sofia Vega', 'Carpenter', '555-2204', 'sofia.vega@showcase.local', ARRAY['Framing','Blocking','Finish carpentry'], true, '2025-03-03', NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "role" = EXCLUDED."role",
  "phone" = EXCLUDED."phone",
  "email" = EXCLUDED."email",
  "skills" = EXCLUDED."skills",
  "isActive" = true,
  "updatedAt" = NOW();

INSERT INTO "CrewAssignment" ("id", "projectId", "crewMemberId", "assignedDate", "isActive", "notes", "createdAt", "updatedAt")
VALUES
  ('showcase-assignment-foreman', 'showcase-project-highrise', 'showcase-crew-foreman', '2026-06-01', true, 'Coordinates all field crews.', NOW(), NOW()),
  ('showcase-assignment-electrician', 'showcase-project-highrise', 'showcase-crew-electrician', '2026-06-03', true, 'MEP electrical rough-in lead.', NOW(), NOW()),
  ('showcase-assignment-plumber', 'showcase-project-highrise', 'showcase-crew-plumber', '2026-06-03', true, 'Medical gas and plumbing rough-in lead.', NOW(), NOW()),
  ('showcase-assignment-carpenter', 'showcase-project-highrise', 'showcase-crew-carpenter', '2026-06-05', true, 'Metal framing and blocking lead.', NOW(), NOW())
ON CONFLICT ("projectId", "crewMemberId") DO UPDATE SET
  "isActive" = true,
  "notes" = EXCLUDED."notes",
  "updatedAt" = NOW();

INSERT INTO "ProjectPhase" ("id", "projectId", "name", "description", "startDate", "endDate", "progress", "order", "parentId", "color", "isActive", "createdAt", "updatedAt")
VALUES
  ('showcase-phase-precon', 'showcase-project-highrise', 'Preconstruction & Mobilization', 'Permits, procurement, site setup and kickoff coordination.', '2026-06-01', '2026-06-21', 100, 1, NULL, '#2563eb', true, NOW(), NOW()),
  ('showcase-phase-shell', 'showcase-project-highrise', 'Core & Shell Coordination', 'Structural openings, envelope coordination and long-lead MEP embeds.', '2026-06-22', '2026-08-16', 55, 2, NULL, '#16a34a', true, NOW(), NOW()),
  ('showcase-phase-interiors', 'showcase-project-highrise', 'Interior Buildout', 'Framing, MEP rough-in, drywall and finishes.', '2026-08-17', '2026-12-20', 20, 3, NULL, '#f59e0b', true, NOW(), NOW()),
  ('showcase-phase-closeout', 'showcase-project-highrise', 'Commissioning & Closeout', 'Testing, commissioning, punch list, owner training and turnover.', '2026-12-21', '2027-02-15', 0, 4, NULL, '#7c3aed', true, NOW(), NOW()),
  ('showcase-phase-mep-rough', 'showcase-project-highrise', 'MEP Rough-in', 'Electrical, plumbing and low-voltage overhead rough-in.', '2026-08-17', '2026-10-12', 15, 31, 'showcase-phase-interiors', '#0ea5e9', true, NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "startDate" = EXCLUDED."startDate",
  "endDate" = EXCLUDED."endDate",
  "progress" = EXCLUDED."progress",
  "order" = EXCLUDED."order",
  "parentId" = EXCLUDED."parentId",
  "color" = EXCLUDED."color",
  "isActive" = true,
  "updatedAt" = NOW();

INSERT INTO "Task" ("id", "projectId", "title", "description", "assigneeId", "status", "priority", "progress", "estimatedHours", "actualHours", "dueDate", "startedAt", "completedAt", "tags", "projectPhaseId", "createdAt", "updatedAt")
VALUES
  ('showcase-task-mobilization', 'showcase-project-highrise', 'Complete site mobilization', 'Install temp fencing, trailer, signage and safety boards.', 'showcase-user-superintendent', 'Completed', 'High', 100, 40, 38, '2026-06-07', '2026-06-01', '2026-06-06', ARRAY['mobilization','safety'], 'showcase-phase-precon', NOW(), NOW()),
  ('showcase-task-embed-review', 'showcase-project-highrise', 'Coordinate slab embed revisions', 'Review new embed plates around imaging suite structural openings.', 'showcase-user-admin', 'In Progress', 'Critical', 65, 32, 18, '2026-06-14', '2026-06-08', NULL, ARRAY['rfi','structural','mep'], 'showcase-phase-shell', NOW(), NOW()),
  ('showcase-task-mep-roughin', 'showcase-project-highrise', 'Start overhead MEP rough-in', 'Begin electrical and medical gas overhead rough-in above exam rooms.', 'showcase-user-superintendent', 'Pending', 'High', 0, 120, NULL, '2026-08-24', NULL, NULL, ARRAY['mep','rough-in'], 'showcase-phase-mep-rough', NOW(), NOW()),
  ('showcase-task-close-punch', 'showcase-project-highrise', 'Close owner punch list', 'Resolve owner walk-through items before final turnover.', 'showcase-user-admin', 'Pending', 'High', 0, 80, NULL, '2027-01-31', NULL, NULL, ARRAY['closeout','punch-list'], 'showcase-phase-closeout', NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "title" = EXCLUDED."title",
  "description" = EXCLUDED."description",
  "status" = EXCLUDED."status",
  "priority" = EXCLUDED."priority",
  "progress" = EXCLUDED."progress",
  "projectPhaseId" = EXCLUDED."projectPhaseId",
  "updatedAt" = NOW();

INSERT INTO "Document" ("id", "projectId", "name", "url", "type", "category", "version", "size", "mimeType", "uploadedById", "description", "tags", "isActive", "createdAt", "updatedAt")
VALUES
  ('showcase-doc-drawings', 'showcase-project-highrise', 'A-201 Clinic Floor Plan.pdf', '/demo/documents/a-201-clinic-floor-plan.pdf', 'drawings', 'Architectural', '2.1', 4200000, 'application/pdf', 'showcase-user-admin', 'Architectural floor plan for clinic suite.', ARRAY['drawing','architectural','floor-plan'], true, NOW(), NOW()),
  ('showcase-doc-specs', 'showcase-project-highrise', 'MEP Specification 230000.pdf', '/demo/documents/mep-spec-230000.pdf', 'specifications', 'MEP', '1.4', 2600000, 'application/pdf', 'showcase-user-admin', 'Mechanical, electrical and plumbing specifications.', ARRAY['specification','mep'], true, NOW(), NOW()),
  ('showcase-doc-submittal', 'showcase-project-highrise', 'Submittal 07-4213 Metal Panels.pdf', '/demo/documents/submittal-metal-panels.pdf', 'submittals', 'Envelope', '1.0', 1900000, 'application/pdf', 'showcase-user-superintendent', 'Metal panel system shop drawing package.', ARRAY['submittal','metal-panels'], true, NOW(), NOW()),
  ('showcase-doc-photo', 'showcase-project-highrise', 'Progress Photo - Level 02.jpg', '/demo/photos/level-02-progress.jpg', 'photos', 'Progress', '1.0', 890000, 'image/jpeg', 'showcase-user-superintendent', 'Level 02 progress photo after layout.', ARRAY['photo','level-02','progress'], true, NOW(), NOW()),
  ('showcase-doc-report', 'showcase-project-highrise', 'Concrete Break Report - 7 Day.pdf', '/demo/documents/concrete-break-report.pdf', 'reports', 'Quality', '1.0', 1100000, 'application/pdf', 'showcase-user-admin', 'Concrete cylinder break report for early strength.', ARRAY['quality','concrete','report'], true, NOW(), NOW()),
  ('showcase-doc-contract', 'showcase-project-highrise', 'Owner Change Directive 004.pdf', '/demo/documents/owner-change-directive-004.pdf', 'contracts', 'Change Directive', '1.0', 980000, 'application/pdf', 'showcase-user-owner', 'Owner directive for imaging suite routing change.', ARRAY['contract','change-directive'], true, NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "type" = EXCLUDED."type",
  "category" = EXCLUDED."category",
  "version" = EXCLUDED."version",
  "description" = EXCLUDED."description",
  "tags" = EXCLUDED."tags",
  "isActive" = true,
  "updatedAt" = NOW();

INSERT INTO "_DocumentToTask" ("A", "B")
VALUES
  ('showcase-doc-drawings', 'showcase-task-embed-review'),
  ('showcase-doc-specs', 'showcase-task-mep-roughin')
ON CONFLICT DO NOTHING;

INSERT INTO "SubmittalWorkflow" ("id", "projectId", "documentId", "status", "submittedById", "reviewerId", "dueDate", "submittedAt", "reviewedAt", "response", "notes", "createdAt", "updatedAt")
VALUES (
  'showcase-submittal-metal-panels',
  'showcase-project-highrise',
  'showcase-doc-submittal',
  'In Review',
  'showcase-user-superintendent',
  'showcase-user-admin',
  '2026-06-18',
  '2026-06-05',
  NULL,
  'Reviewing fastener spacing against revised envelope notes.',
  'Formal submittal workflow for showcase.',
  NOW(),
  NOW()
)
ON CONFLICT ("documentId") DO UPDATE SET
  "status" = EXCLUDED."status",
  "reviewerId" = EXCLUDED."reviewerId",
  "dueDate" = EXCLUDED."dueDate",
  "response" = EXCLUDED."response",
  "notes" = EXCLUDED."notes",
  "updatedAt" = NOW();

INSERT INTO "Transmittal" ("id", "projectId", "number", "title", "description", "status", "dueDate", "sentAt", "acknowledgedAt", "notes", "sentById", "createdAt", "updatedAt")
VALUES (
  'showcase-transmittal-001',
  'showcase-project-highrise',
  'TR-0001',
  'Issued for coordination - clinic drawings and MEP specs',
  'Package sent to owner and consultants for coordination review.',
  'Acknowledged',
  '2026-06-13',
  '2026-06-06 09:15:00',
  '2026-06-07 14:30:00',
  'Owner acknowledged receipt and requested RFI for imaging suite ceiling clearance.',
  'showcase-user-admin',
  NOW(),
  NOW()
)
ON CONFLICT ("projectId", "number") DO UPDATE SET
  "title" = EXCLUDED."title",
  "status" = EXCLUDED."status",
  "sentAt" = EXCLUDED."sentAt",
  "acknowledgedAt" = EXCLUDED."acknowledgedAt",
  "notes" = EXCLUDED."notes",
  "updatedAt" = NOW();

INSERT INTO "TransmittalRecipient" ("id", "transmittalId", "userId", "name", "email", "company", "acknowledgedAt", "createdAt", "updatedAt")
VALUES
  ('showcase-transmittal-recipient-owner', 'showcase-transmittal-001', 'showcase-user-owner', 'Maya Owner', 'maya.owner@example.com', 'Owner Group', '2026-06-07 14:30:00', NOW(), NOW()),
  ('showcase-transmittal-recipient-aor', 'showcase-transmittal-001', NULL, 'Elena Park', 'elena.park@aor.example.com', 'Park Studio Architects', NULL, NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "acknowledgedAt" = EXCLUDED."acknowledgedAt",
  "updatedAt" = NOW();

INSERT INTO "_TransmittalDocuments" ("A", "B")
VALUES
  ('showcase-doc-drawings', 'showcase-transmittal-001'),
  ('showcase-doc-specs', 'showcase-transmittal-001'),
  ('showcase-doc-report', 'showcase-transmittal-001')
ON CONFLICT DO NOTHING;

INSERT INTO "Thread" ("id", "projectId", "title", "description", "type", "status", "isPrivate", "tags", "createdAt", "updatedAt")
VALUES
  ('showcase-thread-rfi', 'showcase-project-highrise', 'RFI 004 - Imaging Suite Ceiling Clearance', 'Coordination thread for imaging suite overhead routing and clearance.', 'RFI', 'Active', false, ARRAY['rfi','mep','imaging'], NOW(), NOW()),
  ('showcase-thread-daily', 'showcase-project-highrise', 'Daily Field Coordination', 'Daily site coordination thread for superintendents and trades.', 'General', 'Active', false, ARRAY['daily','field'], NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "title" = EXCLUDED."title",
  "description" = EXCLUDED."description",
  "status" = EXCLUDED."status",
  "tags" = EXCLUDED."tags",
  "updatedAt" = NOW();

INSERT INTO "_ThreadToUser" ("A", "B")
VALUES
  ('showcase-thread-rfi', 'showcase-user-admin'),
  ('showcase-thread-rfi', 'showcase-user-owner'),
  ('showcase-thread-rfi', 'showcase-user-superintendent'),
  ('showcase-thread-daily', 'showcase-user-admin'),
  ('showcase-thread-daily', 'showcase-user-superintendent')
ON CONFLICT DO NOTHING;

INSERT INTO "Message" ("id", "senderId", "content", "threadId", "attachment", "createdAt", "updatedAt")
VALUES
  ('showcase-message-rfi-1', 'showcase-user-superintendent', 'Ceiling clearance conflict found above imaging room 204. Need design direction before rough-in.', 'showcase-thread-rfi', NULL, '2026-06-08 08:20:00', NOW()),
  ('showcase-message-rfi-2', 'showcase-user-admin', 'Please attach the marked-up drawing and submit as RFI 004. We will send it to AOR today.', 'showcase-thread-rfi', '/demo/documents/a-201-clinic-floor-plan.pdf', '2026-06-08 08:45:00', NOW()),
  ('showcase-message-daily-1', 'showcase-user-superintendent', 'Layout crew completed east corridor control lines. MEP walk is scheduled for 2 PM.', 'showcase-thread-daily', NULL, '2026-06-09 07:55:00', NOW())
ON CONFLICT ("id") DO UPDATE SET
  "content" = EXCLUDED."content",
  "attachment" = EXCLUDED."attachment",
  "updatedAt" = NOW();

INSERT INTO "RFI" ("id", "projectId", "title", "description", "category", "priority", "status", "requestedById", "threadId", "dueDate", "answeredAt", "answer", "attachments", "createdAt", "updatedAt")
VALUES (
  'showcase-rfi-004',
  'showcase-project-highrise',
  'RFI 004 - Imaging Suite Ceiling Clearance',
  'Existing ceiling clearance conflicts with revised medical gas and electrical tray routing. Confirm acceptable alternate routing or ceiling height adjustment.',
  'Design Clarification',
  'High',
  'Answered',
  'showcase-user-superintendent',
  'showcase-thread-rfi',
  '2026-06-12',
  '2026-06-10 16:10:00',
  'AOR approved alternate routing along gridline C with access panel added at room 204 corridor.',
  ARRAY['/demo/documents/a-201-clinic-floor-plan.pdf'],
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO UPDATE SET
  "title" = EXCLUDED."title",
  "description" = EXCLUDED."description",
  "priority" = EXCLUDED."priority",
  "status" = EXCLUDED."status",
  "answer" = EXCLUDED."answer",
  "updatedAt" = NOW();

INSERT INTO "_RFIAssignee" ("A", "B")
VALUES
  ('showcase-rfi-004', 'showcase-user-admin'),
  ('showcase-rfi-004', 'showcase-user-owner')
ON CONFLICT DO NOTHING;

INSERT INTO "_DocumentToRFI" ("A", "B")
VALUES
  ('showcase-doc-drawings', 'showcase-rfi-004'),
  ('showcase-doc-specs', 'showcase-rfi-004')
ON CONFLICT DO NOTHING;

INSERT INTO "Correspondence" ("id", "projectId", "number", "type", "direction", "status", "senderName", "senderEmail", "subject", "body", "dueDate", "sentAt", "receivedAt", "closedAt", "createdById", "threadId", "rfiId", "emailMessageId", "createdAt", "updatedAt")
VALUES (
  'showcase-correspondence-001',
  'showcase-project-highrise',
  'COR-0001',
  'Notice',
  'Outgoing',
  'Closed',
  'Showcase Admin',
  'showcase@onsite360.com',
  'RFI 004 response and directive acknowledgement',
  'Formal notice documenting approved alternate routing and schedule impact review.',
  '2026-06-15',
  '2026-06-10 17:00:00',
  NULL,
  '2026-06-11 10:00:00',
  'showcase-user-admin',
  'showcase-thread-rfi',
  'showcase-rfi-004',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT ("projectId", "number") DO UPDATE SET
  "subject" = EXCLUDED."subject",
  "status" = EXCLUDED."status",
  "threadId" = EXCLUDED."threadId",
  "rfiId" = EXCLUDED."rfiId",
  "updatedAt" = NOW();

INSERT INTO "CorrespondenceRecipient" ("id", "correspondenceId", "userId", "name", "email", "company", "role", "createdAt", "updatedAt")
VALUES
  ('showcase-correspondence-recipient-owner', 'showcase-correspondence-001', 'showcase-user-owner', 'Maya Owner', 'maya.owner@example.com', 'Owner Group', 'Owner Representative', NOW(), NOW()),
  ('showcase-correspondence-recipient-aor', 'showcase-correspondence-001', NULL, 'Elena Park', 'elena.park@aor.example.com', 'Park Studio Architects', 'Architect of Record', NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET "updatedAt" = NOW();

INSERT INTO "_CorrespondenceDocuments" ("A", "B")
VALUES
  ('showcase-correspondence-001', 'showcase-doc-drawings'),
  ('showcase-correspondence-001', 'showcase-doc-contract')
ON CONFLICT DO NOTHING;

INSERT INTO "EmailAccount" ("id", "userId", "name", "email", "imapHost", "imapPort", "imapSecure", "smtpHost", "smtpPort", "smtpSecure", "syncEnabled", "lastSyncedAt", "status", "createdAt", "updatedAt")
VALUES (
  'showcase-email-account',
  'showcase-user-admin',
  'Showcase Project Mailbox',
  'showcase@onsite360.com',
  NULL,
  993,
  true,
  NULL,
  465,
  true,
  false,
  NULL,
  'ConfigurationRequired',
  NOW(),
  NOW()
)
ON CONFLICT ("userId", "email") DO UPDATE SET
  "name" = EXCLUDED."name",
  "syncEnabled" = EXCLUDED."syncEnabled",
  "status" = EXCLUDED."status",
  "updatedAt" = NOW();

INSERT INTO "EmailMessage" ("id", "accountId", "projectId", "correspondenceId", "threadId", "rfiId", "direction", "status", "messageId", "inReplyTo", "references", "from", "to", "cc", "bcc", "subject", "body", "bodyHtml", "sentAt", "receivedAt", "createdById", "createdAt", "updatedAt")
VALUES
  ('showcase-email-incoming-rfi', 'showcase-email-account', 'showcase-project-highrise', 'showcase-correspondence-001', 'showcase-thread-rfi', 'showcase-rfi-004', 'Incoming', 'Received', 'showcase-msg-rfi-response@example.local', NULL, ARRAY[]::TEXT[], 'Elena Park <elena.park@aor.example.com>', ARRAY['showcase@onsite360.com'], ARRAY['maya.owner@example.com'], ARRAY[]::TEXT[], 'Re: RFI 004 - Imaging Suite Ceiling Clearance', 'Approved alternate routing along gridline C. Add access panel at corridor side.', NULL, NULL, '2026-06-10 16:12:00', NULL, NOW(), NOW()),
  ('showcase-email-outgoing-notice', 'showcase-email-account', 'showcase-project-highrise', 'showcase-correspondence-001', 'showcase-thread-rfi', 'showcase-rfi-004', 'Outgoing', 'Sent', 'showcase-msg-formal-notice@example.local', 'showcase-msg-rfi-response@example.local', ARRAY['showcase-msg-rfi-response@example.local'], 'Showcase Admin <showcase@onsite360.com>', ARRAY['maya.owner@example.com','elena.park@aor.example.com'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 'Formal Notice - RFI 004 Response Logged', 'The RFI response has been logged and linked to correspondence COR-0001.', NULL, '2026-06-10 17:00:00', NULL, 'showcase-user-admin', NOW(), NOW())
ON CONFLICT ("messageId") DO UPDATE SET
  "status" = EXCLUDED."status",
  "body" = EXCLUDED."body",
  "updatedAt" = NOW();

UPDATE "Correspondence"
SET "emailMessageId" = 'showcase-email-incoming-rfi', "updatedAt" = NOW()
WHERE "id" = 'showcase-correspondence-001';

INSERT INTO "EmailAttachment" ("id", "emailMessageId", "filename", "url", "mimeType", "size", "createdAt")
VALUES
  ('showcase-email-attachment-rfi', 'showcase-email-incoming-rfi', 'rfi-004-response-markup.pdf', '/demo/documents/rfi-004-response-markup.pdf', 'application/pdf', 760000, NOW())
ON CONFLICT ("id") DO UPDATE SET
  "url" = EXCLUDED."url",
  "size" = EXCLUDED."size";

INSERT INTO "ScheduleEvent" ("id", "projectId", "title", "description", "type", "startDate", "endDate", "allDay", "location", "status", "priority", "color", "recurrence", "notes", "createdById", "createdAt", "updatedAt")
VALUES
  ('showcase-event-kickoff', 'showcase-project-highrise', 'Owner kickoff and site orientation', 'Project kickoff with owner, superintendent and trade leads.', 'MEETING', '2026-06-03 09:00:00', '2026-06-03 10:30:00', false, 'Site Trailer', 'Completed', 'High', '#3b82f6', NULL, 'Kickoff completed with action items.', 'showcase-user-admin', NOW(), NOW()),
  ('showcase-event-inspection', 'showcase-project-highrise', 'Above-ceiling inspection window', 'Inspection hold point before ceiling close-in.', 'INSPECTION', '2026-09-14 08:00:00', '2026-09-14 12:00:00', false, 'Level 02 Exam Rooms', 'Scheduled', 'High', '#f59e0b', NULL, 'Coordinate all MEP signoffs.', 'showcase-user-superintendent', NOW(), NOW()),
  ('showcase-event-delivery', 'showcase-project-highrise', 'Metal panel delivery', 'Envelope metal panel shipment arrives at south staging.', 'DELIVERY', '2026-06-19 07:00:00', '2026-06-19 11:00:00', false, 'South Staging Yard', 'Scheduled', 'Medium', '#16a34a', NULL, 'Forklift and laydown area required.', 'showcase-user-superintendent', NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "title" = EXCLUDED."title",
  "description" = EXCLUDED."description",
  "type" = EXCLUDED."type",
  "startDate" = EXCLUDED."startDate",
  "endDate" = EXCLUDED."endDate",
  "status" = EXCLUDED."status",
  "updatedAt" = NOW();

INSERT INTO "_EventAssignees" ("A", "B")
VALUES
  ('showcase-event-kickoff', 'showcase-user-admin'),
  ('showcase-event-kickoff', 'showcase-user-owner'),
  ('showcase-event-kickoff', 'showcase-user-superintendent'),
  ('showcase-event-inspection', 'showcase-user-superintendent')
ON CONFLICT DO NOTHING;

INSERT INTO "MeetingMinute" ("id", "projectId", "scheduleEventId", "agenda", "minutes", "decisions", "createdById", "createdAt", "updatedAt")
VALUES (
  'showcase-meeting-minute-kickoff',
  'showcase-project-highrise',
  'showcase-event-kickoff',
  'Safety orientation; communication protocol; RFI turnaround; document control; near-term schedule.',
  'Owner confirmed weekly reporting cadence. Superintendent confirmed daily log expectations. AOR requested RFIs through Communication module.',
  ARRAY['Weekly owner meeting set for Wednesdays','RFI turnaround target is 3 business days','All issued drawings must be transmitted through Documents'],
  'showcase-user-admin',
  NOW(),
  NOW()
)
ON CONFLICT ("scheduleEventId") DO UPDATE SET
  "agenda" = EXCLUDED."agenda",
  "minutes" = EXCLUDED."minutes",
  "decisions" = EXCLUDED."decisions",
  "updatedAt" = NOW();

INSERT INTO "MeetingAttendee" ("id", "meetingMinuteId", "userId", "name", "email", "company", "status", "createdAt", "updatedAt")
VALUES
  ('showcase-meeting-attendee-admin', 'showcase-meeting-minute-kickoff', 'showcase-user-admin', 'Showcase Admin', 'showcase@onsite360.com', 'OnSite360 Demo GC', 'Attended', NOW(), NOW()),
  ('showcase-meeting-attendee-owner', 'showcase-meeting-minute-kickoff', 'showcase-user-owner', 'Maya Owner', 'maya.owner@example.com', 'Owner Group', 'Attended', NOW(), NOW()),
  ('showcase-meeting-attendee-super', 'showcase-meeting-minute-kickoff', 'showcase-user-superintendent', 'Carlos Reyes', 'carlos.reyes@example.com', 'OnSite360 Demo GC', 'Attended', NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "status" = EXCLUDED."status",
  "updatedAt" = NOW();

INSERT INTO "MeetingActionItem" ("id", "meetingMinuteId", "title", "description", "assigneeId", "dueDate", "status", "taskId", "createdAt", "updatedAt")
VALUES
  ('showcase-meeting-action-rfi', 'showcase-meeting-minute-kickoff', 'Publish RFI response workflow', 'Confirm RFI 004 is linked to correspondence and issued documents.', 'showcase-user-admin', '2026-06-12', 'Completed', 'showcase-task-embed-review', NOW(), NOW()),
  ('showcase-meeting-action-weekly', 'showcase-meeting-minute-kickoff', 'Send first weekly owner report', 'Package daily logs, photos, schedule and open items.', 'showcase-user-superintendent', '2026-06-14', 'Open', NULL, NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "status" = EXCLUDED."status",
  "taskId" = EXCLUDED."taskId",
  "updatedAt" = NOW();

INSERT INTO "_MeetingMinuteDocuments" ("A", "B")
VALUES
  ('showcase-doc-drawings', 'showcase-meeting-minute-kickoff'),
  ('showcase-doc-report', 'showcase-meeting-minute-kickoff')
ON CONFLICT DO NOTHING;

INSERT INTO "DailyLog" ("id", "projectId", "date", "weather", "temperature", "workHours", "workersPresent", "summary", "issues", "notes", "location", "coordinates", "files", "loggedById", "createdAt", "updatedAt")
VALUES
  ('showcase-dailylog-2026-06-08', 'showcase-project-highrise', '2026-06-08', 'Sunny', '76-84 F', 8, 4, 'Completed clinic grid layout and verified control lines.', 'Ceiling clearance conflict found over imaging room 204.', 'RFI 004 drafted from field observation.', 'Level 02 Imaging Suite', '{"lat":30.2672,"lng":-97.7431}'::jsonb, ARRAY['/demo/photos/level-02-progress.jpg'], 'showcase-user-superintendent', NOW(), NOW()),
  ('showcase-dailylog-2026-06-09', 'showcase-project-highrise', '2026-06-09', 'Partly cloudy', '74-82 F', 7.5, 4, 'Started MEP overhead coordination walk and photo documentation.', 'None blocking; awaiting AOR response.', 'Trade leads aligned on alternate routing options.', 'Level 02 Corridor', '{"lat":30.2675,"lng":-97.7429}'::jsonb, ARRAY['/demo/photos/level-02-progress.jpg'], 'showcase-user-superintendent', NOW(), NOW()),
  ('showcase-dailylog-2026-06-10', 'showcase-project-highrise', '2026-06-10', 'Cloudy', '72-79 F', 8, 3, 'Received RFI response and updated field coordination plan.', 'Need owner acknowledgement before proceeding with change directive.', 'Correspondence COR-0001 created.', 'Site Trailer', '{"lat":30.2671,"lng":-97.7430}'::jsonb, ARRAY['/demo/documents/rfi-004-response-markup.pdf'], 'showcase-user-admin', NOW(), NOW())
ON CONFLICT ("projectId", "date") DO UPDATE SET
  "weather" = EXCLUDED."weather",
  "summary" = EXCLUDED."summary",
  "issues" = EXCLUDED."issues",
  "notes" = EXCLUDED."notes",
  "files" = EXCLUDED."files",
  "updatedAt" = NOW();

INSERT INTO "DailyActivity" ("id", "dailyLogId", "activity", "location", "coordinates", "files", "taskId", "startTime", "endTime", "progress", "notes", "status", "createdAt", "updatedAt")
VALUES
  ('showcase-activity-layout', 'showcase-dailylog-2026-06-08', 'Clinic suite control line layout', 'Level 02 East Wing', '{"lat":30.2672,"lng":-97.7431}'::jsonb, ARRAY[]::TEXT[], 'showcase-task-embed-review', '2026-06-08 07:00:00', '2026-06-08 11:30:00', 100, 'Layout verified against A-201.', 'COMPLETED', NOW(), NOW()),
  ('showcase-activity-mepwalk', 'showcase-dailylog-2026-06-09', 'MEP overhead coordination walk', 'Level 02 Corridor', '{"lat":30.2675,"lng":-97.7429}'::jsonb, ARRAY['/demo/photos/level-02-progress.jpg'], 'showcase-task-mep-roughin', '2026-06-09 13:00:00', '2026-06-09 15:30:00', 35, 'Routing conflict documented for RFI.', 'IN_PROGRESS', NOW(), NOW()),
  ('showcase-activity-response', 'showcase-dailylog-2026-06-10', 'RFI response review and field update', 'Site Trailer', '{"lat":30.2671,"lng":-97.7430}'::jsonb, ARRAY['/demo/documents/rfi-004-response-markup.pdf'], 'showcase-task-embed-review', '2026-06-10 16:00:00', '2026-06-10 17:00:00', 65, 'Response logged and correspondence issued.', 'COMPLETED', NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "activity" = EXCLUDED."activity",
  "progress" = EXCLUDED."progress",
  "notes" = EXCLUDED."notes",
  "status" = EXCLUDED."status",
  "updatedAt" = NOW();

INSERT INTO "_CrewMemberToDailyActivity" ("A", "B")
VALUES
  ('showcase-crew-foreman', 'showcase-activity-layout'),
  ('showcase-crew-carpenter', 'showcase-activity-layout'),
  ('showcase-crew-electrician', 'showcase-activity-mepwalk'),
  ('showcase-crew-plumber', 'showcase-activity-mepwalk'),
  ('showcase-crew-foreman', 'showcase-activity-response')
ON CONFLICT DO NOTHING;

INSERT INTO "ProjectAttendance" ("id", "projectId", "date", "actualStartTime", "workDelayed", "delayReason", "delayDuration", "markedById", "dayType", "dayTypeReason", "isWorkDay", "notes", "createdAt", "updatedAt")
VALUES
  ('showcase-attendance-2026-06-08', 'showcase-project-highrise', '2026-06-08', '2026-06-08 07:00:00', false, NULL, NULL, 'showcase-user-superintendent', 'WORKDAY', NULL, true, 'All crews checked in on time.', NOW(), NOW()),
  ('showcase-attendance-2026-06-09', 'showcase-project-highrise', '2026-06-09', '2026-06-09 07:15:00', true, 'Late material delivery at gate.', 15, 'showcase-user-superintendent', 'WORKDAY', NULL, true, 'Short gate delay; work recovered by noon.', NOW(), NOW()),
  ('showcase-attendance-2026-06-10', 'showcase-project-highrise', '2026-06-10', '2026-06-10 07:00:00', false, NULL, NULL, 'showcase-user-superintendent', 'WORKDAY', NULL, true, 'Plumber off-site for manufacturer training.', NOW(), NOW())
ON CONFLICT ("projectId", "date") DO UPDATE SET
  "actualStartTime" = EXCLUDED."actualStartTime",
  "workDelayed" = EXCLUDED."workDelayed",
  "delayReason" = EXCLUDED."delayReason",
  "notes" = EXCLUDED."notes",
  "updatedAt" = NOW();

INSERT INTO "AttendanceRecord" ("id", "projectAttendanceId", "crewMemberId", "status", "checkInTime", "checkOutTime", "breakDuration", "totalHours", "scheduledHours", "leaveType", "isApproved", "workLocation", "tasks", "notes", "createdAt", "updatedAt")
VALUES
  ('showcase-att-rec-foreman-0608', 'showcase-attendance-2026-06-08', 'showcase-crew-foreman', 'PRESENT', '2026-06-08 07:00:00', '2026-06-08 15:30:00', 30, 8, 8, NULL, NULL, 'Level 02', ARRAY['Layout','Coordination'], NULL, NOW(), NOW()),
  ('showcase-att-rec-elec-0608', 'showcase-attendance-2026-06-08', 'showcase-crew-electrician', 'PRESENT', '2026-06-08 07:00:00', '2026-06-08 15:30:00', 30, 8, 8, NULL, NULL, 'Level 02', ARRAY['Review'], NULL, NOW(), NOW()),
  ('showcase-att-rec-plumber-0608', 'showcase-attendance-2026-06-08', 'showcase-crew-plumber', 'PRESENT', '2026-06-08 07:00:00', '2026-06-08 15:30:00', 30, 8, 8, NULL, NULL, 'Level 02', ARRAY['Review'], NULL, NOW(), NOW()),
  ('showcase-att-rec-carp-0608', 'showcase-attendance-2026-06-08', 'showcase-crew-carpenter', 'PRESENT', '2026-06-08 07:00:00', '2026-06-08 15:30:00', 30, 8, 8, NULL, NULL, 'Level 02', ARRAY['Layout'], NULL, NOW(), NOW()),
  ('showcase-att-rec-foreman-0610', 'showcase-attendance-2026-06-10', 'showcase-crew-foreman', 'PRESENT', '2026-06-10 07:00:00', '2026-06-10 15:30:00', 30, 8, 8, NULL, NULL, 'Site Trailer', ARRAY['RFI response'], NULL, NOW(), NOW()),
  ('showcase-att-rec-plumber-0610', 'showcase-attendance-2026-06-10', 'showcase-crew-plumber', 'ABSENT', NULL, NULL, NULL, 0, 8, 'TRAINING', true, NULL, ARRAY[]::TEXT[], 'Manufacturer medical gas training.', NOW(), NOW())
ON CONFLICT ("projectAttendanceId", "crewMemberId") DO UPDATE SET
  "status" = EXCLUDED."status",
  "totalHours" = EXCLUDED."totalHours",
  "notes" = EXCLUDED."notes",
  "updatedAt" = NOW();

INSERT INTO "Issue" ("id", "projectId", "title", "description", "category", "severity", "status", "location", "reportedBy", "reportedById", "dueDate", "resolvedAt", "resolution", "createdAt", "updatedAt")
VALUES
  ('showcase-issue-safety', 'showcase-project-highrise', 'Temporary guardrail missing at Level 02 east opening', 'Guardrail section removed for delivery access and must be restored before end of shift.', 'Safety', 'Critical', 'Resolved', 'Level 02 East Opening', 'Carlos Reyes', 'showcase-user-superintendent', '2026-06-08', '2026-06-08 14:20:00', 'Guardrail restored and photo documented.', NOW(), NOW()),
  ('showcase-issue-quality', 'showcase-project-highrise', 'Ceiling clearance conflict above imaging suite', 'Overhead routing conflict identified during MEP walk. Linked to RFI 004.', 'Quality', 'High', 'In Progress', 'Room 204 Imaging Suite', 'Luis Hernandez', 'showcase-user-superintendent', '2026-06-12', NULL, NULL, NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "status" = EXCLUDED."status",
  "resolution" = EXCLUDED."resolution",
  "updatedAt" = NOW();

INSERT INTO "_IssueTaggedUsers" ("A", "B")
VALUES
  ('showcase-issue-safety', 'showcase-user-superintendent'),
  ('showcase-issue-quality', 'showcase-user-admin'),
  ('showcase-issue-quality', 'showcase-user-owner')
ON CONFLICT DO NOTHING;

INSERT INTO "_DocumentToIssue" ("A", "B")
VALUES
  ('showcase-doc-photo', 'showcase-issue-safety'),
  ('showcase-doc-drawings', 'showcase-issue-quality')
ON CONFLICT DO NOTHING;

INSERT INTO "PunchListItem" ("id", "projectId", "title", "description", "location", "discipline", "status", "priority", "assigneeId", "dueDate", "closedAt", "issueId", "taskId", "createdAt", "updatedAt")
VALUES
  ('showcase-punch-access-panel', 'showcase-project-highrise', 'Add access panel at imaging corridor routing change', 'Owner/AOR requested access panel after approved alternate routing.', 'Level 02 Corridor outside Room 204', 'MEP / Drywall', 'Ready for Review', 'High', 'showcase-user-superintendent', '2026-10-01', NULL, 'showcase-issue-quality', 'showcase-task-mep-roughin', NOW(), NOW()),
  ('showcase-punch-guardrail-photo', 'showcase-project-highrise', 'Attach final guardrail correction photo', 'Close safety documentation with corrected guardrail photo.', 'Level 02 East Opening', 'Safety', 'Closed', 'Medium', 'showcase-user-superintendent', '2026-06-09', '2026-06-08 15:00:00', 'showcase-issue-safety', NULL, NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "status" = EXCLUDED."status",
  "closedAt" = EXCLUDED."closedAt",
  "issueId" = EXCLUDED."issueId",
  "taskId" = EXCLUDED."taskId",
  "updatedAt" = NOW();

INSERT INTO "_PunchListDocuments" ("A", "B")
VALUES
  ('showcase-doc-drawings', 'showcase-punch-access-panel'),
  ('showcase-doc-photo', 'showcase-punch-guardrail-photo')
ON CONFLICT DO NOTHING;

INSERT INTO "Timecard" ("id", "projectId", "crewMemberId", "weekStart", "status", "totalRegularHours", "totalOvertimeHours", "totalBreakHours", "notes", "submittedById", "submittedAt", "approvedById", "approvedAt", "rejectionReason", "createdAt", "updatedAt")
VALUES
  ('showcase-timecard-foreman-week1', 'showcase-project-highrise', 'showcase-crew-foreman', '2026-06-08', 'Approved', 40, 2, 2.5, 'Week includes RFI coordination overtime.', 'showcase-user-superintendent', '2026-06-12 16:00:00', 'showcase-user-admin', '2026-06-13 10:30:00', NULL, NOW(), NOW()),
  ('showcase-timecard-electrician-week1', 'showcase-project-highrise', 'showcase-crew-electrician', '2026-06-08', 'Submitted', 38, 0, 2.5, 'Awaiting PM approval.', 'showcase-user-superintendent', '2026-06-12 16:05:00', NULL, NULL, NULL, NOW(), NOW())
ON CONFLICT ("projectId", "crewMemberId", "weekStart") DO UPDATE SET
  "status" = EXCLUDED."status",
  "totalRegularHours" = EXCLUDED."totalRegularHours",
  "totalOvertimeHours" = EXCLUDED."totalOvertimeHours",
  "totalBreakHours" = EXCLUDED."totalBreakHours",
  "notes" = EXCLUDED."notes",
  "submittedAt" = EXCLUDED."submittedAt",
  "approvedAt" = EXCLUDED."approvedAt",
  "updatedAt" = NOW();

INSERT INTO "TimecardEntry" ("id", "timecardId", "date", "regularHours", "overtimeHours", "breakHours", "notes", "createdAt", "updatedAt")
VALUES
  ('showcase-timeentry-foreman-0608', 'showcase-timecard-foreman-week1', '2026-06-08', 8, 0, 0.5, 'Layout and safety coordination.', NOW(), NOW()),
  ('showcase-timeentry-foreman-0609', 'showcase-timecard-foreman-week1', '2026-06-09', 8, 1, 0.5, 'MEP coordination walk.', NOW(), NOW()),
  ('showcase-timeentry-foreman-0610', 'showcase-timecard-foreman-week1', '2026-06-10', 8, 1, 0.5, 'RFI response and correspondence follow-up.', NOW(), NOW()),
  ('showcase-timeentry-electrician-0608', 'showcase-timecard-electrician-week1', '2026-06-08', 8, 0, 0.5, 'Drawing review.', NOW(), NOW()),
  ('showcase-timeentry-electrician-0609', 'showcase-timecard-electrician-week1', '2026-06-09', 7.5, 0, 0.5, 'Overhead route walk.', NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "regularHours" = EXCLUDED."regularHours",
  "overtimeHours" = EXCLUDED."overtimeHours",
  "breakHours" = EXCLUDED."breakHours",
  "notes" = EXCLUDED."notes",
  "updatedAt" = NOW();

INSERT INTO "Expense" ("id", "projectId", "amount", "currency", "vendor", "category", "date", "notes", "receiptUrl", "createdById", "isReimbursable", "isApproved", "createdAt", "updatedAt")
VALUES
  ('showcase-expense-panels', 'showcase-project-highrise', 48250.75, 'USD', 'Austin Metal Panel Supply', 'Materials', '2026-06-06', 'Deposit for approved metal panel submittal package.', '/demo/documents/submittal-metal-panels.pdf', 'showcase-user-admin', false, true, NOW(), NOW()),
  ('showcase-expense-safety', 'showcase-project-highrise', 1820.00, 'USD', 'SafeSite Rentals', 'Safety', '2026-06-08', 'Temporary guardrails and opening protection rental.', '/demo/documents/safety-rental-receipt.pdf', 'showcase-user-superintendent', false, true, NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "amount" = EXCLUDED."amount",
  "vendor" = EXCLUDED."vendor",
  "isApproved" = EXCLUDED."isApproved",
  "updatedAt" = NOW();

INSERT INTO "Notification" ("id", "userId", "title", "description", "time", "isRead", "createdAt", "updatedAt")
VALUES
  ('showcase-notification-rfi', 'showcase-user-admin', 'RFI 004 answered', 'AOR response is linked to COR-0001 and the imaging suite task.', '2026-06-10 16:15:00', false, NOW(), NOW()),
  ('showcase-notification-punch', 'showcase-user-superintendent', 'Punch item ready for review', 'Access panel item is ready for owner review.', '2026-06-11 09:00:00', false, NOW(), NOW()),
  ('showcase-notification-timecard', 'showcase-user-admin', 'Timecard submitted', 'Ana Torres timecard is waiting for approval.', '2026-06-12 16:10:00', false, NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET
  "description" = EXCLUDED."description",
  "time" = EXCLUDED."time",
  "isRead" = EXCLUDED."isRead",
  "updatedAt" = NOW();
