import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'
import { csrfProtection } from './middlewares/csrf'

const { PORT = 3000 } = process.env
const app = express()

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
})
app.use(limiter)

app.use(cookieParser())

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true, limit: '10kb' }))
app.use(json({ limit: '10kb' }))

app.post('*', csrfProtection)
app.put('*', csrfProtection)
app.patch('*', csrfProtection)
app.delete('*', csrfProtection)

app.options('*', cors())
app.use(routes)
app.use(errors())
app.use(errorHandler)

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
