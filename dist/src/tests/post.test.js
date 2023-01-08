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
const newPostMessage = 'This is the new test post message';
const newPostSender = '999000';
let newPostId = '';
const newPostMessageUpdated = 'This is the updated message';
const userEmail = "user1@gmail.com";
const userPassword = "12345";
let accessToken = '';
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield post_model_1.default.remove();
    yield user_model_1.default.remove();
    yield (0, supertest_1.default)(server_1.default).post('/auth/register').send({
        "email": userEmail,
        "password": userPassword
    });
}));
function loginUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).post('/auth/login').send({
            "email": userEmail,
            "password": userPassword
        });
        accessToken = response.body.accessToken;
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
            "message": newPostMessage,
            "sender": newPostSender
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(newPostMessage);
        expect(response.body.sender).toEqual(newPostSender);
        newPostId = response.body._id;
    }));
    test("get all posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).get('/post').set('Authorization', 'JWT ' + accessToken);
        expect(response.statusCode).toEqual(200);
        expect(response.body[0].message).toEqual(newPostMessage);
        expect(response.body[0].sender).toEqual(newPostSender);
    }));
    test("get post by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).get('/post/' + newPostId).set('Authorization', 'JWT ' + accessToken);
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(newPostMessage);
        expect(response.body.sender).toEqual(newPostSender);
    }));
    test("get post by wrong id fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).get('/post/12345').set('Authorization', 'JWT ' + accessToken);
        expect(response.statusCode).toEqual(400);
    }));
    test("get post by sender", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).get('/post?sender=' + newPostSender).set('Authorization', 'JWT ' + accessToken);
        expect(response.statusCode).toEqual(200);
        expect(response.body[0].message).toEqual(newPostMessage);
        expect(response.body[0].sender).toEqual(newPostSender);
    }));
    test("get post by wrong sender", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).get("/post?sender=12345").set('Authorization', 'JWT ' + accessToken);
        console.log(response.body);
        expect(response.statusCode).toEqual(200);
        expect(response.body.length).toEqual(0);
    }));
    test("update post by ID", () => __awaiter(void 0, void 0, void 0, function* () {
        let response = yield (0, supertest_1.default)(server_1.default).put('/post/' + newPostId).set('Authorization', 'JWT ' + accessToken).send({
            "message": newPostMessageUpdated,
            "sender": newPostSender
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(newPostMessageUpdated);
        expect(response.body.sender).toEqual(newPostSender);
        response = yield (0, supertest_1.default)(server_1.default).get('/post/' + newPostId).set('Authorization', 'JWT ' + accessToken);
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(newPostMessageUpdated);
        expect(response.body.sender).toEqual(newPostSender);
        response = yield (0, supertest_1.default)(server_1.default).put('/post/12345').set('Authorization', 'JWT ' + accessToken).send({
            "message": newPostMessageUpdated,
            "sender": newPostSender
        });
        expect(response.statusCode).toEqual(400);
        response = yield (0, supertest_1.default)(server_1.default).put('/post/' + newPostId).set('Authorization', 'JWT ' + accessToken).send({
            "message": newPostMessageUpdated,
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(newPostMessageUpdated);
        expect(response.body.sender).toEqual(newPostSender);
    }));
});
// newPostId
// get post by id -> יצירת פוסט שמירת ID ואז קריאת הפוסט
// get post by sender
// add api for update post using PUT
//# sourceMappingURL=post.test.js.map