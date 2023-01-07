"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_js_1 = __importDefault(require("../controllers/auth.js"));
router.post('/register', auth_js_1.default.register);
router.post('/login', auth_js_1.default.login);
router.get('/logout', auth_js_1.default.logout);
router.get('/refresh', auth_js_1.default.refresh);
module.exports = router;
//# sourceMappingURL=auth_route.js.map