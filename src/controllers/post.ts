import { Request, Response } from 'express'
import Post from '../models/post_model'

import request from "../request";
import response from "../response";
import error from "../error";


const getAllPosts = async (req:request) => {
    console.log("new version of get all posts")
    try {
        let posts = {}
        if (req.query != null && req.query.sender != null) {
            posts = await Post.find({ sender: req.query.sender })
        } else {
            posts = await Post.find()
        }
        return new response(posts, req.userId, null)
    } catch (err) {
        console.log("err")
        return new response(null, req.userId, new error(400, err.message))
    }
}


const getPostById = async (req:Request, res:Response)=>{
    console.log(req.params.id)

    try{
        const post = await Post.findById(req.params.id)
        res.status(200).send(post)
    }catch (err) {
        res.status(400).send({'error': "fail to get posts from db"})
    }
}

const addNewPost = async (req: request)=>{

    const post = new Post({
        message: req.body["message"],
        sender: req.body["sender"]  
    })

    try{
        const newPost = await post.save()
        console.log("save post in db")
        return new response(newPost, req.userId, null)
    } catch (err){
        console.log("fail to save post in db")
        return new response(null, req.userId, new error(400, err.message))
    }
}


const putPostById = async (req:Request, res:Response)=>{
    try{
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, {new: true})
        res.status(200).send(post)
    }catch (err){
        console.log("fail to update post in db")
        res.status(400).send({'error': 'fail adding new post to db'})
    }
}

export = {getAllPosts, addNewPost, getPostById, putPostById}

