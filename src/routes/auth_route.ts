import express from 'express'
const router = express.Router()
import auth from '../controllers/auth.js'

router.post('/register', auth.register)

router.post('/login', auth.login)

router.get('/logout', auth.logout)

router.get('/refresh', auth.refresh)


export = router