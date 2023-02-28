import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
    // TODO: test if I need to change bode to message
    message: {
        type: String,
        required: true,
    },
    sender: {
        type: String,
        required: true
    },
})

export = mongoose.model('Message',postSchema)