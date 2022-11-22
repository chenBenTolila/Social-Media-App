const request = require('supertest')
const app = require('../server')
const mongoose = require('mongoose')
const Post = require('../models/post_model')

const newPostMessage = 'This is the new test post message'
const newPostSender = '999000'
let newPostId = ''

beforeAll(async ()=>{
    await Post.remove()
})

afterAll(async ()=>{
    await Post.remove()
    mongoose.connection.close()
})


describe("Posts Tests", ()=>{
    
    test("add new post", async ()=>{
        const response = await request(app).post('/post').send({
            "message": newPostMessage,
            "sender": newPostSender
        })
        expect(response.statusCode).toEqual(200)
        expect(response.body.message).toEqual(newPostMessage)
        expect(response.body.sender).toEqual(newPostSender)
        newPostId = response.body._id
    })

    test("get all posts", async ()=>{
        const response = await request(app).get('/post')
        expect(response.statusCode).toEqual(200)
        expect(response.body[0].message).toEqual(newPostMessage)
        expect(response.body[0].sender).toEqual(newPostSender)
    })

    
    test("get post by id",async ()=>{
        const response = await request(app).get('/post/' + newPostId)
        expect(response.statusCode).toEqual(200)
        expect(response.body.message).toEqual(newPostMessage)
        expect(response.body.sender).toEqual(newPostSender)
    })

})

// newPostId
// get post by id -> יצירת פוסט שמירת ID ואז קריאת הפוסט
// get post by sender
// add api for update post using PUT

