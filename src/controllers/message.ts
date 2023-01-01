import { Request, Response } from 'express'

const getAllmessages = (req:Request, res:Response)=>{
    res.send('get all messages')
}

const addNewMessage = (req:Request, res:Response)=>{
    res.send('add a new message')
}


export = {getAllmessages, addNewMessage}