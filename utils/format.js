export function formatDuration(duration,isHm = false) {
  const minutes = Math.floor(isHm ? duration / 1000 / 60 : duration / 60).toString().padStart(2, '0')
  const seconds = Math.floor(isHm ? duration / 1000 % 60 : duration % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

export function formatDate(timestamp) {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}