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
const post_1 = __importDefault(require("../controllers/post"));
const request_1 = __importDefault(require("../request"));
module.exports = (io, socket) => {
    const getAllPosts = (body) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("get all posts handler with socketId: %s", socket.data.user);
        try {
            const response = yield post_1.default.getAllPosts(new request_1.default(body, socket.data.user, null, null));
            console.log("trying to send post:get_all.response");
            socket.emit("post:get.response", response);
        }
        catch (err) {
            socket.emit("post:get.response", { status: "fail" });
        }
    });
    const getPostById = (body) => __awaiter(void 0, void 0, void 0, function* () {
    });
    const addNewPost = (body) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("new post handler with socketId: %s", socket.data.user);
        try {
            const response = yield post_1.default.addNewPost(new request_1.default(body, socket.data.user, null, null));
            console.log("trying to send post:post.response");
            socket.emit("post:post.response", response);
        }
        catch (err) {
            socket.emit("post:post.response", { status: "fail" });
        }
    });
    console.log('register post handlers');
    socket.on("post:get", getAllPosts);
    socket.on("post:get:id", getPostById);
    socket.on("post:post", addNewPost);
};
//# sourceMappingURL=postHandler.js.map