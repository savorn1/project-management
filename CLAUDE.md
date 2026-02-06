# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TaskFlow is a project management application built with Nuxt 4 and Tailwind CSS. It features a dashboard with stats, kanban boards for task management, project tracking, and team member management using mock data.

## Development Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Build for production
npm run preview    # Preview production build
```

## Architecture

### Data Layer
All data is centralized in [app/data/mockData.ts](app/data/mockData.ts):
- `teamMembers`, `projects`, `tasks` - Core data arrays
- Helper functions: `getProjectTasks()`, `getMemberById()`, `calculateProjectProgress()`, etc.

### State Management via Composables
Located in `app/composables/`:
- **useTasks**: Task CRUD, filtering, and status management
- **useProjects**: Project CRUD with computed stats
- **useKanban**: Drag-and-drop kanban board logic
- **useDashboard**: Dashboard statistics and recent activity
- **useTeam**: Team member management

Composables use Vue's reactivity (`ref`, `computed`) and import mock data. State is module-scoped (shared across components).

### Type Definitions
All TypeScript interfaces in [app/types/index.ts](app/types/index.ts):
- `Task` with `TaskStatus` ('todo' | 'in_progress' | 'review' | 'done') and `TaskPriority` ('low' | 'medium' | 'high' | 'urgent')
- `Project`, `TeamMember`, `KanbanColumn`, `DashboardStats`

### Component Organization
```
app/components/
├── ui/           # Base components (BaseCard, BaseButton, BaseBadge, BaseModal, etc.)
├── layout/       # AppHeader, AppSidebar
├── dashboard/    # DashboardStats, ProjectProgress, RecentTasks
├── kanban/       # KanbanBoard, KanbanColumn
├── tasks/        # TaskCard, TaskList, TaskPriorityBadge
├── projects/     # ProjectCard
└── team/         # TeamMemberCard, AvatarGroup
```

UI components use a consistent dark theme with slate backgrounds and gradient accents.

### Page Routes
- `/` - Dashboard with stats and task overview
- `/projects` - Projects list
- `/projects/[id]` - Project detail with kanban board
- `/tasks` - Task list view
- `/team` - Team members

### Configuration
- Components auto-imported without path prefix ([nuxt.config.ts](nuxt.config.ts))
- Tailwind via `@nuxtjs/tailwindcss` module
- Runtime config supports `apiBase` for future API integration

## Important Patterns

### Styling Constants
[app/utils/constants.ts](app/utils/constants.ts) defines:
- `KANBAN_COLUMNS` - Column configs with colors
- `PRIORITY_CONFIG` / `STATUS_CONFIG` - Label and color mappings
- `PROJECT_COLORS` / `PROJECT_ICONS` - Available options for projects

### Date Formatting
[app/utils/formatters.ts](app/utils/formatters.ts) provides:
- `formatDate()`, `formatShortDate()`, `getRelativeTime()`
- `getDueDateStatus()` - Returns 'overdue' | 'today' | 'upcoming' | 'none'
- `generateId()` - Simple random ID generation

### Task Status Colors
- todo: `slate-400`
- in_progress: `blue-400`
- review: `amber-400`
- done: `emerald-400`
