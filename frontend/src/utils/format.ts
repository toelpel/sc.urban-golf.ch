export function shortGameName(name: string, maxLength = 24): string {
  return name.length > maxLength
    ? name.slice(0, maxLength - 3) + '…'
    : name
}

export function formatDateCH(ts: string): string {
  return new Date(ts).toLocaleString('de-CH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
