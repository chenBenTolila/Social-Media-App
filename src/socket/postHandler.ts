import { Server, Socket } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import postController from '../controllers/post'

export = (io:Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>,
    socket:Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>) => {

    const getAllPosts = async () => {
        const res = await postController.getAllPostsEvent()
        socket.emit('post:get_all', res)
    }
    
    const getPostById = (payload) => {
        socket.emit('post:get_by_id', payload)
    }

    const addNewPost = (payload) => {
        socket.emit('post:add_new', payload)
    }
    
    console.log('register post handlers')
    socket.on("post:get_all", getAllPosts)
    socket.on("post:get_by_id", getPostById)
    socket.on("post:add_new", addNewPost)

}