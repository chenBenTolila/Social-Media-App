import { Server, Socket } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import postController from '../controllers/post'
import request from "../request"

export = (io:Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>,
    socket:Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>) => {

    const getAllPosts = async (body) => {
        console.log(
            "get all posts handler with socketId: %s",
            socket.data.user
        )
        try {
            const response = await postController.getAllPosts(
                new request(body, socket.data.user, null, null)
            )
            console.log("trying to send post:get_all.response")
            socket.emit("post:get.response", response)
        } catch (err) {
            socket.emit("post:get.response", { status: "fail" })
        }
    }
    
    const getPostById = async (body) => {
    }

    const addNewPost = async (body) => {
        console.log("new post handler with socketId: %s", socket.data.user)
        try {
            const response = await postController.addNewPost(
                new request(body, socket.data.user, null, null)
            );
            console.log("trying to send post:post.response");
            socket.emit("post:post.response", response);
        } catch (err) {
            socket.emit("post:post.response", { status: "fail" });
        }
    }
    
    console.log('register post handlers')
    socket.on("post:get", getAllPosts)
    socket.on("post:get:id", getPostById)
    socket.on("post:post", addNewPost)
}