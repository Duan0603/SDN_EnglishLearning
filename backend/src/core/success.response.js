import {SuccessStatusCode, SuccessReasonStatusCode, StatusCode} from "../data/data.js";

class SuccessResponse {
    constructor({message, statusCode = SuccessStatusCode.OK, reasonStatusCode = SuccessReasonStatusCode.OK, metadata = {}}) {
        this.message = !message ? reasonStatusCode : message
        this.status = statusCode
        this.metadata = metadata
    }

    send(res, headers = {}) {
        for(const [key, value] of Object.entries(headers)){
            res.set(key, value)
        }
        return res.status(this.status).json(this)
    }
}

export class OK extends SuccessResponse {
    constructor({message, statusCode = StatusCode.OK, reasonStatusCode = SuccessReasonStatusCode.OK, metadata}) {
        super({message, statusCode, reasonStatusCode, metadata});
    }
}

export class Created extends SuccessResponse {
    constructor({message, statusCode = StatusCode.CREATED, reasonStatusCode = SuccessReasonStatusCode.CREATED, metadata}) {
        super({message, statusCode, reasonStatusCode, metadata});
    }
}