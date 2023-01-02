import express from 'express'
const router = express.Router()
import message from '../controllers/message.js'
import auth from '../controllers/auth.js'


router.get('/', auth.authenticateMiddleware, message.getAllmessages)

router.post('/', auth.authenticateMiddleware, message.addNewMessage)

export = router