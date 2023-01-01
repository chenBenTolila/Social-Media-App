"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const post_1 = __importDefault(require("../controllers/post"));
router.get('/', post_1.default.getAllPosts);
router.get('/:id', post_1.default.getPostById);
router.post('/', post_1.default.addNewPost);
router.put('/:id', post_1.default.putPostById);
module.exports = router;
//# sourceMappingURL=post_route.js.map