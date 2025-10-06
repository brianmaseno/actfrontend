import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger',
    under_review: 'badge-info',
    draft: 'badge-warning',
    active: 'badge-success',
    archived: 'badge-danger',
  };
  return colors[status] || 'badge-info';
}

export function truncate(str: string, length: number = 50) {
  return str.length > length ? str.substring(0, length) + '...' : str;
}
