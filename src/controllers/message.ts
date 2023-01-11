import Message from "../models/message_model"
import request from "../request"
import response from "../response"
import error from "../error"

const getAllMessages = async (req: request) => {
    // implement the get all messages with specific sender
    try {
        let messages = {};

        if (req.query != null && req.query.sender != null) {
            messages = await Message.find({ sender: req.query.sender })
        } else if (req.query != null && req.query.reciever != null) {
            messages = await Message.find({ reciever: req.query.reciever })
        } else {
            messages = await Message.find()
        }
        return new response(messages, req.userId, null)
    } catch (err) {
        console.log("err");
        return new response(null, req.userId, new error(400, err.message))
    }
}

const addNewMessage = async (req: request) => {
    const message = new Message({
        body: req.body["message"],
        sender: req.userId,
        reciever: req.body["to"]
    })
    console.log("end creation new message")
    console.log("message is: " + req.body["message"])
    console.log("sender is: " + req.userId)
    console.log("reciever is: " + req.body["to"])

    try {
        const newMessage = await message.save()
        console.log("save message in db")
        return new response(newMessage, req.userId, null)
    } catch (err) {
        console.log("saving message in db failed")
        console.log(err)

        return new response(null, req.userId, new error(400, err.message))
    }
}

export = { getAllMessages, addNewMessage }