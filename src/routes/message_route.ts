import express from 'express'
const router = express.Router()
import message from '../controllers/message'

router.get('/',message.getAllmessages)

router.post('/',message.addNewMessage)

export = router