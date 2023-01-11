import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true,
    },
    sender: {
        type: String,
        required: true
    },
    receiver: {
        type: String,
        required: true
    }
})

export = mongoose.model('Message',postSchema)