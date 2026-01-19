export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return ''

  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatTitle(title: string, maxLength: number = 40): string {
  if (title.length <= maxLength) return title
  return title.slice(0, maxLength - 3) + '...'
}
