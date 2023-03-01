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
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const post_model_1 = __importDefault(require("../models/post_model"));
const user_model_1 = __importDefault(require("../models/user_model"));
const firstPostMessage = 'This is the first new test post message';
const secondPostMessage = 'This is the second new test post message';
const firstPostImageUrl = 'imageUrl';
let firstPostSender = '';
let firstPostId = '';
const newPostMessageUpdated = 'This is the updated first post message';
const userEmail = "user1@gmail.com";
const userPassword = "12345";
const userName = "user1";
let accessToken = '';
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield post_model_1.default.remove();
    yield user_model_1.default.remove();
    const res = yield (0, supertest_1.default)(server_1.default).post('/auth/register').send({
        "_email": userEmail,
        "password": userPassword,
        "name": userName,
        "image": "",
    });
    firstPostSender = res.body._id;
    console.log("testing register:::");
    console.log(res.body._id);
}));
function loginUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).post('/auth/login').send({
            "email": userEmail,
            "password": userPassword
        });
        accessToken = response.body.tokens.accessToken;
    });
}
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield loginUser();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield post_model_1.default.remove();
    yield user_model_1.default.remove();
    mongoose_1.default.connection.close();
}));
describe("Posts Tests", () => {
    test("add new post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).post('/post').set('Authorization', 'JWT ' + accessToken).send({
            "message": firstPostMessage,
            "sender": firstPostSender,
            "image": firstPostImageUrl,
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body.post.message).toEqual(firstPostMessage);
        expect(response.body.post.sender).toEqual(firstPostSender);
        firstPostId = response.body.post._id;
    }));
    test("add second new post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).post('/post').set('Authorization', 'JWT ' + accessToken).send({
            "message": secondPostMessage,
            "sender": firstPostSender,
            "image": firstPostImageUrl,
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body.post.message).toEqual(secondPostMessage);
        expect(response.body.post.sender).toEqual(firstPostSender);
    }));
    test("get all posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .get("/post")
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);
        expect(response.body.post[0].message).toEqual(firstPostMessage);
        expect(response.body.post[0].sender).toEqual(firstPostSender);
        expect(response.body.post[0].imageUrl).toEqual(firstPostImageUrl);
        expect(response.body.post.length).toEqual(2);
    }));
    test("get post by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).get('/post/' + firstPostId).set('Authorization', 'JWT ' + accessToken);
        expect(response.statusCode).toEqual(200);
        expect(response.body.post.message).toEqual(firstPostMessage);
        expect(response.body.post.sender).toEqual(firstPostSender);
        expect(response.body.post.imageUrl).toEqual(firstPostImageUrl);
    }));
    test("get post by wrong id fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).get('/post/12345').set('Authorization', 'JWT ' + accessToken);
        expect(response.statusCode).toEqual(400);
    }));
    test("get post by sender", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .get("/post?sender=" + firstPostSender)
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);
        console.log(response.body);
        expect(response.body.post[0].message).toEqual(firstPostMessage);
        expect(response.body.post[0].sender).toEqual(firstPostSender);
        expect(response.body.post[0].imageUrl).toEqual(firstPostImageUrl);
        expect(response.body.post.length).toEqual(2);
    }));
    test("get post by wrong sender", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .get("/post?sender=12345")
            .set("Authorization", "JWT " + accessToken);
        console.log(response.body);
        expect(response.statusCode).toEqual(200);
        expect(response.body.post.length).toEqual(0);
    }));
    test("update post by ID", () => __awaiter(void 0, void 0, void 0, function* () {
        let response = yield (0, supertest_1.default)(server_1.default).put('/post/' + firstPostId).set('Authorization', 'JWT ' + accessToken).send({
            "message": newPostMessageUpdated,
            "sender": firstPostSender
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body.post.message).toEqual(newPostMessageUpdated);
        expect(response.body.post.sender).toEqual(firstPostSender);
        expect(response.body.post.imageUrl).toEqual(firstPostImageUrl);
        response = yield (0, supertest_1.default)(server_1.default).get('/post/' + firstPostId).set('Authorization', 'JWT ' + accessToken);
        expect(response.statusCode).toEqual(200);
        expect(response.body.post.message).toEqual(newPostMessageUpdated);
        expect(response.body.post.sender).toEqual(firstPostSender);
        expect(response.body.post.imageUrl).toEqual(firstPostImageUrl);
        response = yield (0, supertest_1.default)(server_1.default).put('/post/12345').set('Authorization', 'JWT ' + accessToken).send({
            "message": newPostMessageUpdated,
            "sender": firstPostSender
        });
        expect(response.statusCode).toEqual(400);
        response = yield (0, supertest_1.default)(server_1.default).put('/post/' + firstPostId).set('Authorization', 'JWT ' + accessToken).send({
            "message": newPostMessageUpdated,
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body.post.message).toEqual(newPostMessageUpdated);
        expect(response.body.post.sender).toEqual(firstPostSender);
        expect(response.body.post.imageUrl).toEqual(firstPostImageUrl);
    }));
    test("delete post by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .delete("/post/" + firstPostId)
            .set("Authorization", "JWT " + accessToken);
        console.log(response.body);
        expect(response.statusCode).toEqual(200);
    }));
});
// newPostId
// get post by id -> יצירת פוסט שמירת ID ואז קריאת הפוסט
// get post by sender
// add api for update post using PUT
//# sourceMappingURL=post.test.js.map