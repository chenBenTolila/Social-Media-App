import { Server } from "socket.io"
import http from 'http'
import jwt from 'jsonwebtoken'
import echoHandler from './socket/echoHandler'
import postHandler from './socket/postHandler'
import chatHandler from './socket/chatHandler'

export = (server: http.Server) => {
    const io = new Server(server);

    console.log("creates socket server")

    io.use(async (socket, next) => {
        let token = socket.handshake.auth.token;
        console.log("first token: " + token)
        if(token == null) return next(new Error('Authentication error'))
        token = token.split(' ')[1]
        console.log("user token is");
        console.log(token)
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err){
                console.log("error in token verify: " + err)
                return next(new Error('Authentication error'));
            } else{
                socket.data.user = user.id
                return next()
            }
        })
    });

    io.on('connection', async (socket) => {
        console.log('a user connected ' + socket.id);
        echoHandler(io, socket)
        postHandler(io, socket)
        chatHandler(io, socket)
        
        //register the socket in a room according to the user id, for the chat
        const userId = socket.data.user
        console.log("userId: " + userId)
        await socket.join(userId)
    });
    return io
}