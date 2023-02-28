"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const mongoose_1 = __importDefault(require("mongoose"));
const postSchema = new mongoose_1.default.Schema({
    // TODO: test if I need to change bode to message
    message: {
        type: String,
        required: true,
    },
    sender: {
        type: String,
        required: true
    },
});
module.exports = mongoose_1.default.model('Message', postSchema);
//# sourceMappingURL=message_model.js.map