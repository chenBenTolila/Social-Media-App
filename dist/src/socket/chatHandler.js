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
const message_1 = __importDefault(require("../controllers/message"));
const request_1 = __importDefault(require("../request"));
module.exports = (io, socket) => {
    // {'to': destination user id,
    //   'message' : message to send}
    const sendMessage = (payload) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('chat:send_message');
        const to = payload.to;
        const message = payload.message;
        const from = socket.data.user;
        try {
            const response = yield message_1.default.addNewMessage(new request_1.default(payload, from, null, null));
            io.to(to).emit("chat:message", { 'to': to, 'from': from, 'message': message, res: response });
        }
        catch (err) {
            socket.emit("chat:message", { status: "fail" });
        }
    });
    const getAllMessages = (payload) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield message_1.default.getAllMessages(new request_1.default(payload, socket.data.user, payload, null));
            console.log("chat:get_all.response ");
            console.log("req - userId" + socket.data.user);
            console.log(response);
            io.to(socket.data.user).emit("chat:get_all.response", response);
        }
        catch (err) {
            socket.emit("chat:get_all.response", { status: "fail" });
        }
    });
    console.log('register chat handlers');
    socket.on("chat:send_message", sendMessage);
    socket.on("chat:get_all", getAllMessages);
};
//# sourceMappingURL=chatHandler.js.map