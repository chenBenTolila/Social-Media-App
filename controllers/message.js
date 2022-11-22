const getAllmessages = (req, res, next)=>{
    res.send('get all messages')
}

const addNewMessage = (req, res, next)=>{
    res.send('add a new message')
}


module.exports = {getAllmessages, addNewMessage}