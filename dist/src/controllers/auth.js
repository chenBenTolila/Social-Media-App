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
    console.log('register in backend');
    const email = req.body._email;
    const password = req.body.password;
    const name = req.body.name;
    const avatarUrl = req.body.image;
    console.log("url: " + avatarUrl);
    //check if credentials are valid
    if (email == null || password == null || name == null || avatarUrl == null) {
        console.log('empty credentials');
        return sendError(res, "please provide valid email and password");
    }
    // check if the user is not already registered
    try {
        const user = yield user_model_1.default.findOne({ 'email': email });
        if (user != null) {
            console.log('user already registeredd');
            return sendError(res, "user already registered, try a different name");
        }
        // create new User & encrypt password
        const salt = yield bcrypt_1.default.genSalt(10);
        const encryptedPwd = yield bcrypt_1.default.hash(password, salt);
        const newUser = new user_model_1.default({
            'email': email,
            'password': encryptedPwd,
            'name': name,
            'imageUrl': avatarUrl,
        });
        console.log('saving new user');
        yield newUser.save();
        // TODO: fix the return value - need to change the return value to email instead of id
        console.log("success in saving");
        return res.status(200).send({
            'email': email,
            '_id': newUser._id,
        });
    }
    catch (err) {
        return sendError(res, 'fail ...');
    }
});
function generateTokens(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const accessToken = jsonwebtoken_1.default.sign({ 'id': userId }, process.env.ACCESS_TOKEN_SECRET, { 'expiresIn': process.env.JWT_TOKEN_EXPIRATION });
        const refreshToken = jsonwebtoken_1.default.sign({ 'id': userId }, process.env.REFRESH_TOKEN_SECRET);
        return { 'accessToken': accessToken, 'refreshToken': refreshToken };
    });
}
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('login in backend');
    const email = req.body.email;
    const password = req.body.password;
    if (email == null || password == null) {
        console.log('credentials are empty');
        return sendError(res, "please provide valid email and password");
    }
    console.log('credentials are not empty');
    try {
        const user = yield user_model_1.default.findOne({ 'email': email });
        if (user == null) {
            console.log('user is null');
            return sendError(res, "incorrect user or password");
        }
        const match = yield bcrypt_1.default.compare(password, user.password);
        if (!match) {
            console.log('not matching');
            return sendError(res, "incorrect user or password");
        }
        const tokens = yield generateTokens(user._id.toString());
        console.log('generated tokens');
        if (user.refresh_tokens == null)
            user.refresh_tokens = [tokens.refreshToken];
        else
            user.refresh_tokens.push(tokens.refreshToken);
        yield user.save();
        console.log(tokens);
        // check if the return is really needed
        return res.status(200).send({ 'tokens': tokens, 'userId': user._id });
    }
    catch (err) {
        console.log("error: " + err);
        return sendError(res, "failed checking user");
    }
});
function getTokenFromRequest(req) {
    const authHeader = req.headers['authorization'];
    if (authHeader == null)
        return null;
    return authHeader.split(' ')[1];
}
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = getTokenFromRequest(req);
    if (refreshToken == null)
        return sendError(res, 'authentication missing');
    // verifying the refresh token
    try {
        const user = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const userObj = yield user_model_1.default.findById(user.id);
        if (userObj == null)
            return sendError(res, 'failed validating token');
        if (!userObj.refresh_tokens.includes(refreshToken)) {
            userObj.refresh_tokens = []; // deleting all the the refresh tokens
            yield userObj.save();
            return sendError(res, 'failed validating token');
        }
        const tokens = yield generateTokens(userObj._id.toString());
        // TODO:
        // missing assignment in this statement 
        userObj.refresh_tokens[userObj.refresh_tokens.indexOf(refreshToken)] = tokens.refreshToken;
        yield userObj.save();
        return res.status(200).send(tokens);
    }
    catch (err) {
        return sendError(res, 'failed validating token');
    }
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("logout func");
    const refreshToken = getTokenFromRequest(req);
    if (refreshToken == null)
        return sendError(res, 'authentication missing');
    try {
        const user = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const userObj = yield user_model_1.default.findById(user.id);
        if (userObj == null)
            return sendError(res, 'failed validating token');
        if (!userObj.refresh_tokens.includes(refreshToken)) {
            userObj.refresh_tokens = []; // deleting all of the the refresh tokens
            yield userObj.save();
            return sendError(res, 'failed validating token');
        }
        userObj.refresh_tokens.splice(userObj.refresh_tokens.indexOf(refreshToken), 1);
        yield userObj.save();
        return res.status(200).send();
    }
    catch (err) {
        return sendError(res, 'failed validating token');
    }
});
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.params.id);
    try {
        const user = yield user_model_1.default.findById(req.params.id);
        res.status(200).send(user);
    }
    catch (err) {
        res.status(400).send({ 'error': "fail to get user from db" });
    }
});
const putUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("in putUserById");
    console.log(req.params.id);
    console.log(req.body.password);
    if (req.body.password != undefined) {
        const salt = yield bcrypt_1.default.genSalt(10);
        req.body.password = yield bcrypt_1.default.hash(req.body.password, salt);
    }
    try {
        const user = yield user_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        console.log("save post in db");
        res.status(200).send(user);
    }
    catch (err) {
        console.log("fail to update post in db");
        res.status(400).send({ error: "fail to update post in db" });
    }
});
const authenticateMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("in authenticate middleware");
    const token = getTokenFromRequest(req);
    if (token == null)
        return sendError(res, 'authentication missing');
    try {
        const user = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.body.userId = user.id;
        console.log("token user: " + user);
        return next();
    }
    catch (err) {
        console.log("invalid token need to return 100 status");
        return res.status(410).send({
            'err': 'failed validating token'
        });
    }
});
module.exports = { login, register, logout, refresh, authenticateMiddleware, getUserById, putUserById };
//# sourceMappingURL=auth.js.map