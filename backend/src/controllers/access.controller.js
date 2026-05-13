import {Created} from "../core/success.response.js";
import {AccessService} from "../services/access.service.js";
export class AccessController {
    static signUp = async (req, res, next) => {
        console.log(`[P]::signUP::`, req.body)

        new Created({
            message: "New shop created!",
            metadata: await AccessService.signUp(req.body)
        }).send(res)
    }
    static signIn = async (req, res, next) => {

    }
}