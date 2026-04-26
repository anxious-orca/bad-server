import BadRequestError from '../errors/bad-request-error'

const MAX_LIMIT = 10

export function setSafeLimit(raw: unknown): number {
  const n = Number(raw)
  if (isNaN(n) || n < 1) return MAX_LIMIT
  return Math.min(n, MAX_LIMIT)
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function rejectMongoOperators(obj: unknown, fieldName = 'query'): void {
  const str = JSON.stringify(obj)
  if (/\$/.test(str)) {
    throw new BadRequestError(`Недопустимые операторы в параметре ${fieldName}`)
  }
}