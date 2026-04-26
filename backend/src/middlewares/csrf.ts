import crypto from 'crypto'
import { NextFunction, Request, Response } from 'express'
import ForbiddenError from '../errors/forbidden-error'

const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex')
const CSRF_COOKIE_NAME = '_csrf'

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

function signToken(token: string): string {
  return crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(token)
    .digest('hex')
}

export function csrfTokenHandler(req: Request, res: Response): void {
  const existing = req.cookies?.[CSRF_COOKIE_NAME]
  const token = existing || generateToken()

  if (!existing) {
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  res.json({ csrfToken: signToken(token) })
}

export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME]
  const headerToken = req.headers['x-csrf-token'] as string | undefined

  if (!cookieToken || !headerToken) {
    return next(new ForbiddenError('Невалидный CSRF токен'))
  }

  const expected = signToken(cookieToken)
  const expectedBytes = new Uint8Array(Buffer.from(expected, 'hex'))
  const actualBytes = new Uint8Array(Buffer.from(headerToken, 'hex'))

  if (expectedBytes.length !== actualBytes.length) {
    return next(new ForbiddenError('Невалидный CSRF токен'))
  }

  try {
    if (!crypto.timingSafeEqual(expectedBytes, actualBytes)) {
      return next(new ForbiddenError('Невалидный CSRF токен'))
    }
  } catch {
    return next(new ForbiddenError('Невалидный CSRF токен'))
  }

  return next()
}