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
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../app"));
const mongoose_1 = __importDefault(require("mongoose"));
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const supertest_1 = __importDefault(require("supertest"));
const post_model_1 = __importDefault(require("../models/post_model"));
const user_model_1 = __importDefault(require("../models/user_model"));
const message_model_1 = __importDefault(require("../models/message_model"));
const userEmail = "user1@gmail.com";
const userPassword = "12345";
const userEmail2 = "user2@gmail.com";
const userPassword2 = "12345";
const firstPostMessage = 'this is the first new test post message';
const secondPostMessage = 'this is the second new test post message';
let newPostId = "";
const newPostMessageUpdated = 'This is the updated first post message';
const message = "hi... test 123";
let client1;
let client2;
function clientSocketConnect(clientSocket) {
    return new Promise((resolve) => {
        clientSocket.on("connect", () => {
            resolve("1");
        });
    });
}
const connectUser = (userEmail, userPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const response1 = yield (0, supertest_1.default)(app_1.default).post('/auth/register').send({
        "email": userEmail,
        "password": userPassword
    });
    const userId = response1.body._id;
    const response = yield (0, supertest_1.default)(app_1.default).post('/auth/login').send({
        "email": userEmail,
        "password": userPassword
    });
    const token = response.body.accessToken;
    const socket = (0, socket_io_client_1.default)('http://localhost:' + process.env.PORT, {
        auth: {
            token: 'barrer ' + token
        }
    });
    yield clientSocketConnect(socket);
    const client = { socket: socket, accessToken: token, id: userId };
    return client;
});
describe("my awesome project", () => {
    jest.setTimeout(15000);
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield post_model_1.default.remove();
        yield user_model_1.default.remove();
        yield message_model_1.default.remove();
        client1 = yield connectUser(userEmail, userPassword);
        client2 = yield connectUser(userEmail2, userPassword2);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        client1.socket.close();
        client2.socket.close();
        yield post_model_1.default.remove();
        yield user_model_1.default.remove();
        yield message_model_1.default.remove();
        app_1.default.close();
        mongoose_1.default.connection.close();
    }));
    test("should work", (done) => {
        client1.socket.once("echo:echo_res", (arg) => {
            console.log("echo:echo");
            expect(arg.msg).toBe('hello');
            done();
        });
        client1.socket.emit("echo:echo", { 'msg': 'hello' });
    });
    test("Post add new test", (done) => {
        client1.socket.once("post:post.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.body.message).toBe(firstPostMessage);
            expect(arg.body.sender).toBe(client1.id);
            expect(arg.status).toBe("ok");
            newPostId = arg.body._id;
            done();
        });
        console.log("test post add new post");
        client1.socket.emit("post:post", {
            message: firstPostMessage,
            sender: client1.id,
        });
    });
    test("Post add new test by a different user", (done) => {
        client2.socket.once("post:post.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.body.message).toBe(secondPostMessage);
            expect(arg.body.sender).toBe(client2.id);
            expect(arg.status).toBe("ok");
            done();
        });
        console.log("test post add new post");
        client2.socket.emit("post:post", {
            message: secondPostMessage,
            sender: client2.id,
        });
    });
    test("Post get all test", (done) => {
        client1.socket.once("post:get.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.status).toBe("ok");
            expect(arg.body.length).toEqual(2);
            done();
        });
        console.log("test post get all");
        client1.socket.emit("post:get", "stam");
    });
    test("Post get by id test", (done) => {
        client1.socket.once("post:get:id.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.body.message).toBe(firstPostMessage);
            expect(arg.body.sender).toBe(client1.id);
            expect(arg.status).toBe("ok");
            done();
        });
        console.log("test post get by id");
        client1.socket.emit("post:get:id", {
            id: newPostId,
        });
    });
    test("Post get by wrong id test", (done) => {
        client1.socket.once("post:get:id.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.err.code).toBe(400);
            expect(arg.status).toBe("fail");
            done();
        });
        console.log("test post get by wrong id");
        client1.socket.emit("post:get:id", {
            id: 12345,
        });
    });
    test("Post get by sender test", (done) => {
        client1.socket.once("post:get:sender.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.body[0].message).toBe(firstPostMessage);
            expect(arg.body[0].sender).toBe(client1.id);
            expect(arg.status).toBe("ok");
            done();
        });
        console.log("test post get by sender");
        client1.socket.emit("post:get:sender", {
            sender: client1.id,
        });
    });
    test("get post by wrong sender", (done) => {
        client1.socket.once("post:get:sender.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.status).toBe("ok");
            expect(arg.body.length).toEqual(0);
            done();
        });
        console.log("test post get by wrong sender");
        client1.socket.emit("post:get:sender", {
            sender: 12345,
        });
    });
    test("Post put by id test - update message and sender", (done) => {
        client1.socket.once("post:put.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.body.message).toBe(newPostMessageUpdated);
            expect(arg.body.sender).toBe(client1.id);
            expect(arg.status).toBe("ok");
            done();
        });
        console.log("test post put by id");
        client1.socket.emit("post:put", {
            id: newPostId,
            message: newPostMessageUpdated,
            sender: client1.id,
        });
    });
    test("Post put by id test check", (done) => {
        client1.socket.once("post:get:id.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.body.message).toBe(newPostMessageUpdated);
            expect(arg.body.sender).toBe(client1.id);
            expect(arg.status).toBe("ok");
            done();
        });
        console.log("test post get by id");
        client1.socket.emit("post:get:id", {
            id: newPostId,
        });
    });
    test("Post put by wrong id test", (done) => {
        client1.socket.once("post:put.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.status).toBe("fail");
            done();
        });
        console.log("test post put by id");
        client1.socket.emit("post:put", {
            id: 123456,
            message: newPostMessageUpdated,
            sender: client1.id,
        });
    });
    test("Post put by id test - update message", (done) => {
        client1.socket.once("post:put.response", (arg) => {
            console.log("on any" + arg);
            expect(arg.body.message).toBe(newPostMessageUpdated);
            expect(arg.body.sender).toBe(client1.id);
            expect(arg.status).toBe("ok");
            done();
        });
        console.log("test post put by id");
        client1.socket.emit("post:put", {
            id: newPostId,
            message: newPostMessageUpdated,
        });
    });
    test("Test chat message", (done) => {
        client2.socket.once('chat:message', (args) => {
            expect(args.to).toBe(client2.id);
            expect(args.message).toBe(message);
            expect(args.from).toBe(client1.id);
            expect(args.res.status).toBe("ok");
            done();
        });
        client1.socket.emit("chat:send_message", { to: client2.id, message: message });
    });
    test("test chat send message with no message", (done) => {
        client2.socket.once("chat:message", (args) => {
            expect(args.res.status).toBe("fail");
            done();
        });
        console.log("test chat send message");
        client1.socket.emit("chat:send_message", {
            to: client2.id,
        });
    });
    test("test chat get all messages that send by user", (done) => {
        client1.socket.once("chat:get_all.response", (args) => {
            expect(args.body.length).toBe(1);
            console.log("response in tests: " + args);
            //expect(args[0].body[0].reciever).toBe(client2.id)
            expect(args.body[0].body).toBe(message);
            expect(args.body[0].sender).toBe(client1.id);
            expect(args.status).toBe("ok");
            done();
        });
        console.log("test chat get all messages by specific sender");
        client1.socket.emit("chat:get_all", {
            sender: client1.id,
        });
    });
    test("test chat get all messages that send to user", (done) => {
        client1.socket.once("chat:get_all.response", (arg) => {
            expect(arg.body.length).toBe(0);
            expect(arg.status).toBe("ok");
            done();
        });
        console.log("test chat get all messages");
        client1.socket.emit("chat:get_all", {
            reciever: client1.id,
        });
    });
    test("test chat get all messages that send by user that did not send any message", (done) => {
        client1.socket.once("chat:get_all.response", (arg) => {
            expect(arg.body.length).toBe(0);
            expect(arg.status).toBe("ok");
            done();
        });
        console.log("test chat get all messages");
        client1.socket.emit("chat:get_all", {
            sender: client1.id + 2,
        });
    });
    test("test chat get all messages ", (done) => {
        client1.socket.once("chat:get_all.response", (arg) => {
            expect(arg.body.length).toBe(1);
            expect(arg.status).toBe("ok");
            done();
        });
        console.log("test chat get all messages");
        client1.socket.emit("chat:get_all");
    });
});
//# sourceMappingURL=socket.test.js.map