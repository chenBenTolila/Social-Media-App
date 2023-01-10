"use strict";
class request {
    constructor(body, userId, query, params) {
        this.body = {};
        this.query = null;
        this.params = null;
        this.userId = null;
        this.body = body;
        this.userId = userId;
        this.query = query;
        this.params = params;
    }
    //ctor
    static fromRestRequest(req) {
        return new request(req.body, req.body.userId, req.query, req.params); // I have change to this -> req.body.userId, need to check for problems
    }
}
module.exports = request;
//# sourceMappingURL=request.js.map