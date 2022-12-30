const express = require('express')
const app = express()
const dotenv = require('dotenv').config()

const body_parser = require('body-parser')

app.use(body_parser.urlencoded({extended:true,limit:'1mb'}))
app.use(body_parser.json())


const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL,{useNewUrlParser:true})
const db = mongoose.connection
db.on('error',error=>{console.error(error)})
db.once('open',()=>{console.log('connected to mongo DB')})

app.use('/public',express.static('public'))

const postRouter = require('./routes/post_route.js')
const messageRouter = require('./routes/message_route.js')

app.use('/post',postRouter)

app.use('/message',messageRouter)

module.exports = app