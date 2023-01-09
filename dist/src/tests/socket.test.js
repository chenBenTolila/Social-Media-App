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
const userEmail = "user1@gmail.com";
const userPassword = "12345";
let accessToken = '';
let clientSocket = null;
function clientSocketConnect() {
    return new Promise((resolve) => {
        clientSocket.on("connect", () => {
            resolve("1");
        });
    });
}
describe("my awesome project", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield post_model_1.default.remove();
        yield user_model_1.default.remove();
        yield (0, supertest_1.default)(app_1.default).post('/auth/register').send({
            "email": userEmail,
            "password": userPassword
        });
        const response = yield (0, supertest_1.default)(app_1.default).post('/auth/login').send({
            "email": userEmail,
            "password": userPassword
        });
        accessToken = response.body.accessToken;
        clientSocket = (0, socket_io_client_1.default)('http://localhost:' + process.env.PORT, {
            auth: {
                token: 'barrer ' + accessToken
            }
        });
        yield clientSocketConnect();
    }));
    afterAll(() => {
        app_1.default.close();
        clientSocket.close();
        mongoose_1.default.connection.close();
    });
    test("should work", (done) => {
        clientSocket.once("echo:echo", (arg) => {
            console.log("echo:echo");
            expect(arg.msg).toBe('hello');
            done();
        });
        clientSocket.emit("echo:echo", { 'msg': 'hello' });
    });
    test("Post get all test", (done) => {
        clientSocket.once('post:get_all', (arg) => {
            console.log("on any " + arg);
            expect(arg.status).toBe('OK');
            done();
        });
        clientSocket.emit("post:get_all", "stam");
    });
});
//# sourceMappingURL=socket.test.js.map