import crypto from 'crypto'
import { NextFunction, Request, Response } from 'express'
import ForbiddenError from '../errors/forbidden-error'

const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex')
const TOKEN_TTL_MS = 1000 * 60 * 60 // 1 hour

interface CsrfPayload {
  ts: number
  sig: string
}

function generateToken(): string {
  const ts = Date.now()
  const sig = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(String(ts))
    .digest('hex')
  const payload: CsrfPayload = { ts, sig }
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

function validateToken(token: string): boolean {
  try {
    const payload: CsrfPayload = JSON.parse(
      Buffer.from(token, 'base64url').toString('utf8')
    )
    if (Date.now() - payload.ts > TOKEN_TTL_MS) return false
    const expected = crypto
      .createHmac('sha256', CSRF_SECRET)
      .update(String(payload.ts))
      .digest('hex')
    
    const expectedBytes = new Uint8Array(Buffer.from(expected, 'hex'))
    const actualBytes = new Uint8Array(Buffer.from(payload.sig, 'hex'))

    if (expectedBytes.length !== actualBytes.length) return false

    return crypto.timingSafeEqual(expectedBytes, actualBytes)
  } catch {
    return false
  }
}

export function csrfTokenHandler(_req: Request, res: Response): void {
  res.json({ csrfToken: generateToken() })
}

export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  const token = req.headers['x-csrf-token'] as string | undefined
  if (!token || !validateToken(token)) {
    return next(new ForbiddenError('Невалидный CSRF токен'))
  }
  return next()
}