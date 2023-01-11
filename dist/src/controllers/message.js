"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const message_model_1 = __importDefault(require("../models/message_model"));
const response_1 = __importDefault(require("../response"));
const error_1 = __importDefault(require("../error"));
const getAllMessages = (req) => __awaiter(void 0, void 0, void 0, function* () {
    // implement the get all messages with specific sender
    try {
        let messages = {};
        if (req.query != null && req.query.sender != null) {
            messages = yield message_model_1.default.find({ sender: req.query.sender });
        }
        else if (req.query != null && req.query.reciever != null) {
            messages = yield message_model_1.default.find({ reciever: req.query.reciever });
        }
        else {
            messages = yield message_model_1.default.find();
        }
        return new response_1.default(messages, req.userId, null);
    }
    catch (err) {
        console.log("err");
        return new response_1.default(null, req.userId, new error_1.default(400, err.message));
    }
});
const addNewMessage = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const message = new message_model_1.default({
        body: req.body["message"],
        sender: req.userId,
        reciever: req.body["to"]
    });
    console.log("end creation new message");
    console.log("message is: " + req.body["message"]);
    console.log("sender is: " + req.userId);
    console.log("reciever is: " + req.body["to"]);
    try {
        const newMessage = yield message.save();
        console.log("save message in db");
        return new response_1.default(newMessage, req.userId, null);
    }
    catch (err) {
        console.log("saving message in db failed");
        console.log(err);
        return new response_1.default(null, req.userId, new error_1.default(400, err.message));
    }
});
module.exports = { getAllMessages, addNewMessage };
//# sourceMappingURL=message.js.map