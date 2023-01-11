import server from "../app"
import mongoose from "mongoose"
import Client, { Socket } from "socket.io-client"
import { DefaultEventsMap } from "@socket.io/component-emitter"

import request from 'supertest'
import Post from '../models/post_model'
import User from '../models/user_model'

const userEmail = "user1@gmail.com"
const userPassword = "12345"

const userEmail2 = "user2@gmail.com"
const userPassword2 = "12345"

const firstPostMessage = 'this is the first new test post message'
const secondPostMessage = 'this is the second new test post message'
let newPostId = ""
const newPostMessageUpdated = 'This is the updated first post message'

const message = "hi... test 123"
 
type Client = {
    socket : Socket<DefaultEventsMap, DefaultEventsMap>,
    accessToken : string,
    id : string
}

let client1: Client
let client2: Client


function clientSocketConnect(clientSocket: Socket<DefaultEventsMap, DefaultEventsMap>):Promise<string> {
    return new Promise((resolve)=> {
        clientSocket.on("connect", () =>{
            resolve("1")
        });
    })
}

const connectUser = async (userEmail: string, userPassword: string)=>{
    const response1 = await request(server).post('/auth/register').send({
        "email": userEmail,
        "password": userPassword 
    })
    const userId = response1.body._id

    const response = await request(server).post('/auth/login').send({
        "email": userEmail,
        "password": userPassword 
    })
    const token = response.body.accessToken

    const socket = Client('http://localhost:' + process.env.PORT, {
        auth: {
            token: 'barrer ' + token
        }
    })

    await clientSocketConnect(socket)
    const client = {socket: socket, accessToken: token, id: userId }
    return client
}

describe("my awesome project", () => {
    jest.setTimeout(15000)

    beforeAll(async () => {
        await Post.remove()
        await User.remove()

        client1 = await connectUser(userEmail, userPassword )
        client2 = await connectUser(userEmail2, userPassword2 )
   });

    afterAll(() => {
        client1.socket.close();
        client2.socket.close();
        server.close()
        mongoose.connection.close()
    });

    test("should work", (done) => {
        client1.socket.once("echo:echo_res", (arg) => {
            console.log("echo:echo")
            expect(arg.msg).toBe('hello')
            done();
        });
        client1.socket.emit("echo:echo", { 'msg': 'hello' })
    });

    test("Post add new test", (done) => {
        client1.socket.once("post:post.response", (arg) => {
            console.log("on any" + arg)
            expect(arg.body.message).toBe(firstPostMessage)
            expect(arg.body.sender).toBe(client1.id)
            expect(arg.status).toBe("ok")
            newPostId = arg.body._id
            done()
        })
        console.log("test post add new post")
        client1.socket.emit("post:post", {
            message: firstPostMessage,
            sender: client1.id,
        })
    })

    test("Post add new test by a different user", (done) => {
        client2.socket.once("post:post.response", (arg) => {
            console.log("on any" + arg)
            expect(arg.body.message).toBe(secondPostMessage)
            expect(arg.body.sender).toBe(client2.id)
            expect(arg.status).toBe("ok")
            done()
        })
        console.log("test post add new post")
        client2.socket.emit("post:post", {
            message: secondPostMessage,
            sender: client2.id,
        })
    })

    test("Post get all test", (done) => {
        client1.socket.once("post:get.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.status).toBe("ok");
            expect(arg.body.length).toEqual(2);
            done();
        });
        console.log("test post get all");
        client1.socket.emit("post:get", "stam");
    });

    test("Test chat message", (done)=>{
        client2.socket.once('chat:message',(args)=>{
            expect(args.to).toBe(client2.id)
            expect(args.message).toBe(message)
            expect(args.from).toBe(client1.id)
            done()
        })
        client1.socket.emit("chat:send_message", {'to':client2.id, 'message':message})
    })
});

