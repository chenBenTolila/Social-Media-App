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
const user_model_1 = __importDefault(require("../models/user_model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function sendError(res, error) {
    res.status(400).send({
        'err': error
    });
}
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('register');
    const email = req.body.email;
    const password = req.body.password;
    //check if credentials are valid
    if (email == null || password == null) {
        return sendError(res, "please provide valid email and password");
    }
    // check if the user is not already registered
    try {
        const user = yield user_model_1.default.findOne({ 'email': email });
        if (user != null) {
            sendError(res, "user already registered try a different name");
        }
    }
    catch (err) {
        console.log("error: " + err);
        sendError(res, "failed checking user");
    }
    // create new User & encrypt password
    try {
        const salt = yield bcrypt_1.default.genSalt(10);
        const encryptedPwd = yield bcrypt_1.default.hash(password, salt);
        let newUser = new user_model_1.default({
            'email': email,
            'password': encryptedPwd
        });
        newUser = yield newUser.save();
        res.status(200).send(newUser);
    }
    catch (err) {
        sendError(res, 'fail ...');
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('login');
    const email = req.body.email;
    const password = req.body.password;
    if (email == null || password == null) {
        return sendError(res, "bad email or password");
    }
    try {
        const user = yield user_model_1.default.findOne({ 'email': email });
        if (user == null)
            return sendError(res, "incorrect user or password");
        const match = yield bcrypt_1.default.compare(password, user.password);
        if (!match)
            return sendError(res, "incorrect user or password");
        const accessToken = yield jsonwebtoken_1.default.sign({ 'id': user._id }, process.env.ACCESS_TOKEN_SECRET, { 'expiresIn': process.env.JWT_TOKEN_EXPIRATION });
        res.status(200).send({ 'accesstoken': accessToken });
    }
    catch (err) {
        console.log("error: " + err);
        sendError(res, "failed checking user");
    }
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(400).send({ 'error': "not implemented" });
});
const authenticateMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    if (authHeader == null)
        return sendError(res, 'authentication missing');
    const token = authHeader.split(' ')[1];
    if (token == null)
        return sendError(res, 'authentication missing');
    try {
        const user = yield jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // TODO: fix ts
        // req.userId = user._id
        console.log("token user: " + user);
        next();
    }
    catch (err) {
        return sendError(res, 'failed validating token');
    }
});
module.exports = { login, register, logout, authenticateMiddleware };
//# sourceMappingURL=auth.js.map