"use strict";
class response {
    constructor(body, userId, err) {
        this.body = {};
        this.userId = null;
        this.err = null;
        this.status = null;
        this.body = body;
        this.userId = userId;
        this.err = err;
        if (err == null)
            this.status = "ok";
        else
            this.status = "fail";
    }
    sendRestResponse(res) {
        if (this.err == null) {
            res.status(200).send({
                status: "ok",
                post: this.body,
            });
        }
        else {
            res.status(this.err.code).send({
                status: "fail",
                message: this.err.message,
            });
        }
    }
}
module.exports = response;
//# sourceMappingURL=response.js.map