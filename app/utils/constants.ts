import type { KanbanColumn, TaskPriority, TaskStatus } from '~/types'

type StyleConfig = {
  label: string
  color: string
  bgColor: string
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'todo', title: 'To Do', color: 'slate' },
  { id: 'in_progress', title: 'In Progress', color: 'blue' },
  { id: 'in_review', title: 'In Review', color: 'amber' },
  { id: 'done', title: 'Done', color: 'emerald' },
]

export const PRIORITY_CONFIG: Record<TaskPriority, StyleConfig> = {
  low: {
    label: 'Low',
    color: 'text-slate-400',
    bgColor: 'bg-slate-400/20',
  },
  medium: {
    label: 'Medium',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/20',
  },
  high: {
    label: 'High',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/20',
  },
  urgent: {
    label: 'Urgent',
    color: 'text-rose-400',
    bgColor: 'bg-rose-400/20',
  },
}

export const STATUS_CONFIG: Record<TaskStatus, StyleConfig> = {
  todo: {
    label: 'To Do',
    color: 'text-slate-400',
    bgColor: 'bg-slate-400/20',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/20',
  },
  in_review: {
    label: 'In Review',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/20',
  },
  done: {
    label: 'Done',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/20',
  },
}

