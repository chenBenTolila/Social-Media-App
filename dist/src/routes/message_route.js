"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const message_js_1 = __importDefault(require("../controllers/message.js"));
const auth_js_1 = __importDefault(require("../controllers/auth.js"));
router.get('/', auth_js_1.default.authenticateMiddleware, message_js_1.default.getAllmessages);
router.post('/', auth_js_1.default.authenticateMiddleware, message_js_1.default.addNewMessage);
module.exports = router;
//# sourceMappingURL=message_route.js.map