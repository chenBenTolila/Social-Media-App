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
            sendError(res, "user already registered, try a different name");
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
        return sendError(res, "please provide valid email and password");
    }
    try {
        const user = yield user_model_1.default.findOne({ 'email': email });
        if (user == null)
            return sendError(res, "incorrect user or password");
        const match = yield bcrypt_1.default.compare(password, user.password);
        if (!match)
            return sendError(res, "incorrect user or password");
        const accessToken = yield jsonwebtoken_1.default.sign({ 'id': user._id }, process.env.ACCESS_TOKEN_SECRET, { 'expiresIn': process.env.JWT_TOKEN_EXPIRATION });
        const refreshToken = yield jsonwebtoken_1.default.sign({ 'id': user._id }, process.env.REFRESH_TOKEN_SECRET);
        if (user.refresh_tokens == null)
            user.refresh_tokens = [refreshToken];
        else
            user.refresh_tokens.push(refreshToken);
        yield user.save();
        // check if the return is really needed
        return res.status(200).send({
            'accesstoken': accessToken,
            'refreshToken': refreshToken
        });
    }
    catch (err) {
        console.log("error: " + err);
        sendError(res, "failed checking user");
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
        const user = yield jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const userObj = yield user_model_1.default.findById(user.id);
        if (userObj == null)
            return sendError(res, 'failed validating token');
        if (!userObj.refresh_tokens.includes(refreshToken)) {
            userObj.refresh_tokens = []; // deleting all the the refresh tokens
            yield userObj.save();
            return sendError(res, 'failed validating token');
        }
        const newAccessToken = yield jsonwebtoken_1.default.sign({ 'id': user._id }, process.env.ACCESS_TOKEN_SECRET, { 'expiresIn': process.env.JWT_TOKEN_EXPIRATION });
        const newRefreshToken = yield jsonwebtoken_1.default.sign({ 'id': user._id }, process.env.REFRESH_TOKEN_SECRET);
        // TODO:
        // missing assignment in this statement 
        userObj.refresh_tokens[userObj.refresh_tokens.indexOf(refreshToken)];
        yield userObj.save();
        return res.status(200).send({
            'accesstoken': newAccessToken,
            'refreshToken': newRefreshToken
        });
    }
    catch (err) {
        return sendError(res, 'failed validating token');
    }
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = getTokenFromRequest(req);
    if (refreshToken == null)
        return sendError(res, 'authentication missing');
    try {
        const user = yield jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
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
        res.status(200).send();
    }
    catch (err) {
        return sendError(res, 'failed validating token');
    }
});
const authenticateMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = getTokenFromRequest(req);
    if (token == null)
        return sendError(res, 'authentication missing');
    try {
        const user = yield jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.body.userId = user.id;
        console.log("token user: " + user);
        next();
    }
    catch (err) {
        return sendError(res, 'failed validating token');
    }
});
module.exports = { login, register, logout, refresh, authenticateMiddleware };
//# sourceMappingURL=auth.js.map