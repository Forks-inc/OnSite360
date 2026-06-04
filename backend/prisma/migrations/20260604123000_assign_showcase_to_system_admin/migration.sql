-- Make the showcase project visible to the default system admin account.
INSERT INTO "UserProject" (
  "id",
  "userId",
  "projectId",
  "projectRole",
  "accessLevel",
  "assignedDate",
  "isActive",
  "workSchedule",
  "notes",
  "createdAt",
  "updatedAt"
)
SELECT
  'showcase-user-project-system-admin',
  u."id",
  'showcase-project-highrise',
  'Project Manager',
  3,
  NOW(),
  true,
  'Full-time',
  'Default admin assignment for the full showcase project.',
  NOW(),
  NOW()
FROM "User" u
WHERE u."email" = 'admin@onsite360.com'
ON CONFLICT ("userId", "projectId") DO UPDATE SET
  "projectRole" = EXCLUDED."projectRole",
  "accessLevel" = 3,
  "isActive" = true,
  "notes" = EXCLUDED."notes",
  "updatedAt" = NOW();
