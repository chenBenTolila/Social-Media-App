"use strict";
const getAllmessages = (req, res) => {
    res.send('get all messages');
};
const addNewMessage = (req, res) => {
    res.send('add a new message');
};
module.exports = { getAllmessages, addNewMessage };
//# sourceMappingURL=message.js.map