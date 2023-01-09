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
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const echoHandler_1 = __importDefault(require("./socket/echoHandler"));
const postHandler_1 = __importDefault(require("./socket/postHandler"));
module.exports = (server) => {
    const io = new socket_io_1.Server(server);
    io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
        let token = socket.handshake.auth.token;
        if (token == null)
            return next(new Error('Authentication error'));
        token = token.split(' ')[1];
        jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                return next(new Error('Authentication error'));
            }
            else {
                socket.data.user = user.id;
                return next();
            }
        });
    }));
    io.on('connection', (socket) => {
        console.log('a user connected ' + socket.id);
        (0, echoHandler_1.default)(io, socket);
        (0, postHandler_1.default)(io, socket);
    });
    return io;
};
//# sourceMappingURL=socket_server.js.map