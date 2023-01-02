import { NextFunction, Request, Response } from 'express'
import User from '../models/user_model'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

function sendError(res:Response, error:String) {
    res.status(400).send({
        'err': error
    })
}

const register = async (req:Request, res:Response)=>{
    console.log('register')
    const email = req.body.email
    const password = req.body.password

    //check if credentials are valid
    if (email == null || password == null) {
        return sendError(res, "please provide valid email and password")
    }

    // check if the user is not already registered
    try {
        const user = await User.findOne({'email': email})
        if(user != null) {
            sendError(res, "user already registered try a different name")
        }
    }catch (err){
        console.log("error: " + err)
        sendError(res, "failed checking user")
    }

    // create new User & encrypt password
    try{
        const salt = await bcrypt.genSalt(10)
        const encryptedPwd = await bcrypt.hash(password, salt)
        let newUser = new User({
            'email': email,
            'password': encryptedPwd
        })
        newUser = await newUser.save()
        res.status(200).send(newUser)

    } catch(err) {
        sendError(res,'fail ...')
    }
}

const login = async (req:Request, res:Response)=>{
    console.log('login')
    const email = req.body.email
    const password = req.body.password
    if (email == null || password == null) {
        return sendError(res, "bad email or password")
    }

    try {
        const user = await User.findOne({'email': email})
        if(user == null) return sendError(res, "incorrect user or password")
        
        const match = await bcrypt.compare(password, user.password)
        if(!match) return sendError(res, "incorrect user or password")

        const accessToken = await jwt.sign(
            {'id': user._id},
            process.env.ACCESS_TOKEN_SECRET,
            {'expiresIn':process.env.JWT_TOKEN_EXPIRATION}
        )

        res.status(200).send({'accesstoken': accessToken})
    } catch(err){
        console.log("error: " + err)
        sendError(res, "failed checking user")
    }
}


const logout = async (req:Request, res:Response)=>{
    res.status(400).send({'error': "not implemented"})
}

const authenticateMiddleware = async (req:Request, res:Response, next:NextFunction)=>{
    const authHeader = req.headers['authorization']
    if (authHeader == null) return sendError(res,'authentication missing')
    const token = authHeader.split(' ')[1]
    if(token == null) return sendError(res,'authentication missing')

    try {
        const user = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        // TODO: fix ts
        // req.userId = user._id
        console.log("token user: " + user)
        next()
    }catch(err) {
        return sendError(res,'failed validating token')
    }
}

export = {login, register, logout, authenticateMiddleware}

