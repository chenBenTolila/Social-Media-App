import { NextFunction, Request, Response } from 'express'
import User from '../models/user_model'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
// unused import!
import { use } from '../server'

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
            return sendError(res, "user already registered, try a different name")
        }
    }catch (err){
        console.log("error: " + err)
        return sendError(res, "failed checking user")
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
        return res.status(200).send(newUser)

    } catch(err) {
        return sendError(res,'fail ...')
    }
}

async function generateTokens(userId:string){
    const accessToken = await jwt.sign(
        {'id': userId},
        process.env.ACCESS_TOKEN_SECRET,
        {'expiresIn':process.env.JWT_TOKEN_EXPIRATION}
    )
    const refreshToken = await jwt.sign(
        {'id': userId},
        process.env.REFRESH_TOKEN_SECRET
    )

    return {'accessToken':accessToken, 'refreshToken':refreshToken}
}

const login = async (req:Request, res:Response)=>{
    console.log('login')
    const email = req.body.email
    const password = req.body.password
    if (email == null || password == null) {
        return sendError(res, "please provide valid email and password")
    }

    try {
        const user = await User.findOne({'email': email})
        if(user == null) return sendError(res, "incorrect user or password")
        
        const match = await bcrypt.compare(password, user.password)
        if(!match) return sendError(res, "incorrect user or password")

        const tokens = await generateTokens(user._id.toString())
       

        if (user.refresh_tokens == null) user.refresh_tokens = [tokens.refreshToken]
        else user.refresh_tokens.push(tokens.refreshToken)
        await user.save()

        // check if the return is really needed
        return res.status(200).send(tokens)    
    } catch(err){
        console.log("error: " + err)
        return sendError(res, "failed checking user")
    }
}

function getTokenFromRequest(req:Request): string{
    const authHeader = req.headers['authorization']
    if (authHeader == null) return null
    return authHeader.split(' ')[1]
}

const refresh = async (req:Request, res:Response)=>{
    const refreshToken = getTokenFromRequest(req)
    if(refreshToken == null) return sendError(res,'authentication missing')

    // verifying the refresh token
    try {
        const user = await jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)
        const userObj = await User.findById(user.id)
        if (userObj == null) return sendError(res,'failed validating token')
        
        if (!userObj.refresh_tokens.includes(refreshToken)) {
            userObj.refresh_tokens = [] // deleting all the the refresh tokens
            await userObj.save()
            return sendError(res, 'failed validating token')
        }

        const tokens = await generateTokens(userObj._id.toString())
        
        // TODO:
        // missing assignment in this statement 
        userObj.refresh_tokens[userObj.refresh_tokens.indexOf(refreshToken)] = tokens.refreshToken
        await userObj.save()

        return res.status(200).send(tokens)

    }catch(err) {
        return sendError(res,'failed validating token')
    }
}

const logout = async (req:Request, res:Response)=>{
    const refreshToken = getTokenFromRequest(req)
    if(refreshToken == null) return sendError(res,'authentication missing')

    try {
        const user = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const userObj = await User.findById(user.id)
        if (userObj == null) return sendError(res,'failed validating token')
        
        if (!userObj.refresh_tokens.includes(refreshToken)) {
            userObj.refresh_tokens = [] // deleting all of the the refresh tokens
            await userObj.save()
            return sendError(res, 'failed validating token')
        }

        userObj.refresh_tokens.splice(userObj.refresh_tokens.indexOf(refreshToken), 1)
        await userObj.save()
        return res.status(200).send()

    }catch(err) {
        return sendError(res,'failed validating token')
    }
}


const authenticateMiddleware = async (req:Request, res:Response, next:NextFunction)=>{
    const token = getTokenFromRequest(req)
    if(token == null) return sendError(res,'authentication missing')

    try {
        const user = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        req.body.userId = user.id
        console.log("token user: " + user)
        return next()
    }catch(err) {
        return sendError(res,'failed validating token')
    }
}

export = {login, register, logout, refresh, authenticateMiddleware}



