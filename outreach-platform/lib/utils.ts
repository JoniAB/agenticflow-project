import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, differenceInDays } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(date: string | null): string {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function daysInStage(updatedAt: string): number {
  return differenceInDays(new Date(), new Date(updatedAt))
}
