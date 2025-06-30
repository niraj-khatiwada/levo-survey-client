export function toLocalISOWithTz(datetimeLocalStr: string): string {
  const date = new Date(datetimeLocalStr)

  const pad = (n: number) => (n < 10 ? '0' + n : n)

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())

  console.log(
    `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`,
    new Date(
      `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`,
    ).toISOString(),
  )
  return new Date(
    `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`,
  ).toISOString()
}

export const toLocalDatetime = (date: string) => {
  date = date.endsWith('Z') ? date : date + 'Z'
  return new Date(date).toLocaleString()
}
