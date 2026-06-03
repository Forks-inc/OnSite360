# Changelog

All notable changes to OnSite360 are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Project documentation suite: root README, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, per-module READMEs, and expanded `docs/`.

## [1.0.0] - 2026-06-03

### Added
- Backend API (NestJS + Prisma + PostgreSQL) with modules for auth, users, projects, tasks, documents, communication, schedule, roles, permissions, notifications, and copilot.
- React + Vite PWA frontend with project, task, schedule, document, communication, and reporting views.
- JWT authentication with role- and permission-based access control.
- Swagger/OpenAPI documentation at `/debug`.
- Docker Compose setup and database seeding.

[Unreleased]: https://github.com/yourusername/OnSite360/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/OnSite360/releases/tag/v1.0.0
